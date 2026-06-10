<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('sort')) {
            if ($request->sort === 'price_asc') {
                $query->orderBy('price', 'asc');
            } elseif ($request->sort === 'price_desc') {
                $query->orderBy('price', 'desc');
            } elseif ($request->sort === 'rating') {
                $query->orderBy('rating', 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $products = $query->get();
        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json($product);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|in:food,accessories,healthcare,toys',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|max:3072',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $imageUrl = 'https://images.unsplash.com/photo-1589724128522-83569420e64c?auto=format&fit=crop&q=80&w=400';
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $imageUrl = asset('storage/' . $path);
        }

        $product = Product::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => floatval($request->price),
            'category' => $request->category,
            'stock' => intval($request->stock),
            'image' => $imageUrl,
            'rating' => 5.0,
            'reviews_count' => 0,
        ]);

        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category' => 'required|string|in:food,accessories,healthcare,toys',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|image|max:3072',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $product->image = asset('storage/' . $path);
        }

        $product->name = $request->name;
        $product->description = $request->description;
        $product->price = floatval($request->price);
        $product->category = $request->category;
        $product->stock = intval($request->stock);
        $product->save();

        return response()->json($product);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Produit supprimé.']);
    }
}
