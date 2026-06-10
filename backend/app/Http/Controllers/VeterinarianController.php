<?php

namespace App\Http\Controllers;

use App\Models\Veterinarian;
use Illuminate\Http\Request;

class VeterinarianController extends Controller
{
    public function index(Request $request)
    {
        $query = Veterinarian::with('user');

        // Text searches
        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }
        if ($request->filled('specialty')) {
            $term = $request->specialty;
            $query->where(function($q) use ($term) {
                $q->where('specialty', 'like', '%' . $term . '%')
                  ->orWhere('clinic_name', 'like', '%' . $term . '%')
                  ->orWhere('address', 'like', '%' . $term . '%');
            });
        }

        // Advanced Filters
        if ($request->filled('is_emergency_available') && $request->boolean('is_emergency_available')) {
            $query->where('is_emergency_available', true);
        }
        if ($request->filled('max_price')) {
            $query->where('consultation_price', '<=', $request->max_price);
        }
        if ($request->filled('min_rating')) {
            $query->where('rating', '>=', $request->min_rating);
        }

        // Sorting
        $sort = $request->input('sort_by', 'rating'); // default to rating
        if ($sort === 'experience') {
            $query->orderByDesc('experience_years');
        } else {
            $query->orderByDesc('rating');
        }

        // Pagination
        $paginated = $query->paginate(10);

        return response()->json($paginated);
    }

    public function show($id)
    {
        $vet = Veterinarian::with('user')->findOrFail($id);
        return response()->json($vet);
    }
}
