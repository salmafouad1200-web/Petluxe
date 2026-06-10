<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class PetController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            $pets = Pet::with('user')->get();
        } else {
            $pets = Pet::where('user_id', $user->id)->get();
        }
        return response()->json($pets);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'species' => 'required|string|max:100',
            'breed' => 'required|string|max:100',
            'age' => 'required|integer|min:0',
            'weight' => 'required|numeric|min:0',
            'sex' => 'required|string|in:Mâle,Femelle',
            'vaccines' => 'nullable|string', // Comma separated or JSON array
            'photo' => 'nullable|image|mimes:jpeg,png,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $photoUrl = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'; // Default nice dog/cat placeholder
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pets', 'public');
            $photoUrl = asset('storage/' . $path);
        }

        $vaccines = [];
        if ($request->filled('vaccines')) {
            $vaccines = json_decode($request->vaccines, true);
            if (!is_array($vaccines)) {
                $vaccines = array_filter(array_map('trim', explode(',', $request->vaccines)));
            }
        }

        $pet = Pet::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'species' => $request->species,
            'breed' => $request->breed,
            'age' => intval($request->age),
            'weight' => floatval($request->weight),
            'sex' => $request->sex,
            'vaccines' => $vaccines,
            'photo' => $photoUrl,
            'medical_history' => [],
            'documents' => [],
        ]);

        return response()->json($pet, 201);
    }

    public function show(Request $request, $id)
    {
        $pet = Pet::findOrFail($id);

        if ($request->user()->id !== $pet->user_id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        return response()->json($pet);
    }

    public function update(Request $request, $id)
    {
        $pet = Pet::findOrFail($id);

        if ($request->user()->id !== $pet->user_id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'species' => 'required|string|max:100',
            'breed' => 'required|string|max:100',
            'age' => 'required|integer|min:0',
            'weight' => 'required|numeric|min:0',
            'sex' => 'required|string|in:Mâle,Femelle',
            'vaccines' => 'nullable|string', // Comma separated or JSON array
            'photo' => 'nullable|image|mimes:jpeg,png,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('photo')) {
            // Option to delete old file if it is stored in public disk
            $path = $request->file('photo')->store('pets', 'public');
            $pet->photo = asset('storage/' . $path);
        }

        $vaccines = $pet->vaccines ?? [];
        if ($request->filled('vaccines')) {
            $decoded = json_decode($request->vaccines, true);
            $vaccines = is_array($decoded) ? $decoded : array_filter(array_map('trim', explode(',', $request->vaccines)));
        }

        $pet->name = $request->name;
        $pet->species = $request->species;
        $pet->breed = $request->breed;
        $pet->age = intval($request->age);
        $pet->weight = floatval($request->weight);
        $pet->sex = $request->sex;
        $pet->vaccines = $vaccines;
        $pet->save();

        return response()->json($pet);
    }

    public function destroy(Request $request, $id)
    {
        $pet = Pet::findOrFail($id);

        if ($request->user()->id !== $pet->user_id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        $pet->delete();

        return response()->json(['message' => 'Animal supprimé avec succès.']);
    }

    // Custom helper to add medical records
    public function addMedicalRecord(Request $request, $id)
    {
        $pet = Pet::findOrFail($id);

        if ($request->user()->id !== $pet->user_id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        $request->validate([
            'date' => 'required|date',
            'type' => 'required|string|max:100',
            'description' => 'required|string',
        ]);

        $history = $pet->medical_history ?? [];
        $history[] = [
            'date' => $request->date,
            'type' => $request->type,
            'description' => $request->description,
        ];

        $pet->medical_history = $history;
        $pet->save();

        return response()->json($pet);
    }

    // Custom helper to upload medical document
    public function uploadDocument(Request $request, $id)
    {
        $pet = Pet::findOrFail($id);

        if ($request->user()->id !== $pet->user_id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'document' => 'required|file|mimes:pdf,jpeg,png,jpg,doc,docx|max:5120',
        ]);

        $path = $request->file('document')->store('pet_documents', 'public');
        
        $documents = $pet->documents ?? [];
        $documents[] = [
            'name' => $request->name,
            'url' => asset('storage/' . $path),
            'uploaded_at' => date('Y-m-d H:i:s'),
        ];

        $pet->documents = $documents;
        $pet->save();

        return response()->json($pet);
    }
}
