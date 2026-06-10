<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Pet;
use App\Models\Veterinarian;
use App\Models\Order;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class AdminController extends Controller
{
    private function checkAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(response()->json(['error' => 'Accès interdit. Réservé aux administrateurs.'], 403));
        }
    }

    public function getStats(Request $request)
    {
        $this->checkAdmin($request);

        $totalUsers = User::count();
        $totalPets = Pet::count();
        $totalVets = Veterinarian::count();
        $totalOrders = Order::count();
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total_price');

        // Recent Orders
        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Orders by Status
        $ordersByStatus = [
            'pending' => Order::where('status', 'pending')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'shipped' => Order::where('status', 'shipped')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
        ];

        // Sales revenue over time (Mocked grouped dates from real orders or seed data for front end charts)
        $salesData = [
            ['date' => '01 Jun', 'sales' => 120.00],
            ['date' => '02 Jun', 'sales' => 340.50],
            ['date' => '03 Jun', 'sales' => 210.00],
            ['date' => '04 Jun', 'sales' => 540.00],
            ['date' => '05 Jun', 'sales' => 412.00],
            ['date' => '06 Jun', 'sales' => 670.00],
            ['date' => '07 Jun', 'sales' => floatval($totalRevenue)],
        ];

        // Category breakdown
        $categoryBreakdown = [
            ['name' => 'Alimentation', 'value' => 60],
            ['name' => 'Accessoires', 'value' => 20],
            ['name' => 'Santé', 'value' => 15],
            ['name' => 'Jouets', 'value' => 5],
        ];

        return response()->json([
            'metrics' => [
                'total_users' => $totalUsers,
                'total_pets' => $totalPets,
                'total_vets' => $totalVets,
                'total_orders' => $totalOrders,
                'total_revenue' => round($totalRevenue, 2),
            ],
            'recent_orders' => $recentOrders,
            'orders_by_status' => $ordersByStatus,
            'sales_chart' => $salesData,
            'category_chart' => $categoryBreakdown,
        ]);
    }

    public function getUsers(Request $request)
    {
        $this->checkAdmin($request);
        $users = User::orderBy('created_at', 'desc')->get();
        return response()->json($users);
    }

    public function updateUserRole(Request $request, $id)
    {
        $this->checkAdmin($request);

        $request->validate([
            'role' => 'required|string|in:admin,user,veterinarian',
        ]);

        $user = User::findOrFail($id);
        $user->role = $request->role;
        $user->save();

        return response()->json([
            'message' => 'Rôle de l\'utilisateur mis à jour.',
            'user' => $user
        ]);
    }

    public function deleteUser(Request $request, $id)
    {
        $this->checkAdmin($request);

        $user = User::findOrFail($id);
        if ($user->id === $request->user()->id) {
            return response()->json(['error' => 'Vous ne pouvez pas supprimer votre propre compte.'], 400);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }

    public function exportOrdersCsv(Request $request)
    {
        $this->checkAdmin($request);

        $orders = Order::with('user')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="orders_export.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $callback = function() use ($orders) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for French characters in Excel
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // Headers
            fputcsv($file, ['ID Commande', 'Client', 'Email', 'Adresse', 'Total (€)', 'Statut', 'Méthode Paiement', 'Date']);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->id,
                    $order->user ? $order->user->name : 'N/A',
                    $order->user ? $order->user->email : 'N/A',
                    $order->shipping_address,
                    $order->total_price,
                    $order->status,
                    $order->payment_method,
                    $order->created_at->format('Y-m-d H:i')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
