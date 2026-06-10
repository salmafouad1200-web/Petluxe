<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            $orders = Order::with('user')->orderBy('created_at', 'desc')->get();
        } else {
            $orders = Order::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
        }
        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        if ($request->user()->id !== $order->user_id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string|max:500',
            'phone' => 'required|string|max:20',
            'payment_method' => 'required|string|in:card,paypal,cash',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $items = $request->items;
        $totalPrice = 0;
        $processedItems = [];

        // In a real application, we want database transaction safety
        // Since we support SQLite/MongoDB, we can verify each item manually
        foreach ($items as $item) {
            $product = Product::findOrFail($item['product_id']);

            if ($product->stock < $item['quantity']) {
                return response()->json([
                    'error' => "Stock insuffisant pour le produit: {$product->name}. Stock disponible: {$product->stock}"
                ], 400);
            }

            // Deduct stock
            $product->stock -= $item['quantity'];
            $product->save();

            $subtotal = $product->price * $item['quantity'];
            $totalPrice += $subtotal;

            $processedItems[] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'quantity' => $item['quantity'],
                'image' => $product->image,
            ];
        }

        $order = Order::create([
            'user_id' => $request->user()->id,
            'items' => $processedItems,
            'total_price' => $totalPrice,
            'status' => 'pending',
            'shipping_address' => $request->shipping_address,
            'phone' => $request->phone,
            'payment_method' => $request->payment_method,
            'payment_status' => $request->payment_method === 'cash' ? 'pending' : 'paid',
        ]);

        // Trigger Notification
        Notification::create([
            'user_id' => $request->user()->id,
            'title' => 'Commande Reçue !',
            'content' => 'Votre commande d\'un montant de ' . number_format($totalPrice, 2) . ' € a été enregistrée avec succès.',
            'type' => 'order',
            'is_read' => false,
            'data' => ['order_id' => $order->id]
        ]);

        return response()->json($order, 201);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        $order = Order::findOrFail($id);

        $request->validate([
            'status' => 'nullable|string|in:pending,processing,shipped,delivered,cancelled',
            'payment_status' => 'nullable|string|in:pending,paid,failed',
        ]);

        if ($request->filled('status')) {
            $order->status = $request->status;
        }

        if ($request->filled('payment_status')) {
            $order->payment_status = $request->payment_status;
        }

        $order->save();

        // Create alert for customer
        Notification::create([
            'user_id' => $order->user_id,
            'title' => 'Mise à jour de votre Commande',
            'content' => "Le statut de votre commande #{$order->id} est maintenant: " . strtoupper($order->status),
            'type' => 'order',
            'is_read' => false,
            'data' => ['order_id' => $order->id]
        ]);

        return response()->json($order);
    }
}
