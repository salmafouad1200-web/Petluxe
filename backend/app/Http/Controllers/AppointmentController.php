<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Notification;
use App\Models\Veterinarian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            $appointments = Appointment::with(['user', 'veterinarian.user', 'pet'])->get();
        } elseif ($user->role === 'veterinarian') {
            $vet = Veterinarian::where('user_id', $user->id)->first();
            if (!$vet) {
                return response()->json([]);
            }
            $appointments = Appointment::where('veterinarian_id', $vet->id)
                ->with(['user', 'pet'])
                ->get();
        } else {
            $appointments = Appointment::where('user_id', $user->id)
                ->with(['veterinarian.user', 'pet'])
                ->get();
        }

        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'veterinarian_id' => 'required|integer',
            'pet_id' => 'required|integer',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|string',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $vet = Veterinarian::findOrFail($request->veterinarian_id);

        $appointment = Appointment::create([
            'user_id' => $request->user()->id,
            'veterinarian_id' => $vet->id,
            'pet_id' => $request->pet_id,
            'date' => $request->date,
            'time' => $request->time,
            'status' => 'pending',
            'notes' => $request->notes,
        ]);

        // Create notification for veterinarian user
        Notification::create([
            'user_id' => $vet->user_id,
            'title' => 'Nouveau Rendez-vous !',
            'content' => $request->user()->name . ' a demandé un rendez-vous pour le ' . $request->date . ' à ' . $request->time . '.',
            'type' => 'appointment',
            'is_read' => false,
            'data' => ['appointment_id' => $appointment->id]
        ]);

        return response()->json($appointment, 201);
    }

    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);
        $user = $request->user();

        // Check permissions: either the customer, the vet, or admin
        $vet = Veterinarian::where('user_id', $user->id)->first();
        $isVetOwner = $vet && $vet->id === $appointment->veterinarian_id;
        
        if ($user->id !== $appointment->user_id && !$isVetOwner && $user->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        $request->validate([
            'status' => 'required|string|in:pending,confirmed,completed,cancelled',
            'notes' => 'nullable|string'
        ]);

        $appointment->status = $request->status;
        if ($request->filled('notes')) {
            $appointment->notes = $request->notes;
        }
        $appointment->save();

        // Send notification to the pet owner
        $statusTexts = [
            'confirmed' => 'a été CONFIRMÉ.',
            'completed' => 'est maintenant marqué comme TERMINÉ.',
            'cancelled' => 'a été ANNULÉ.'
        ];
        
        if (isset($statusTexts[$request->status])) {
            Notification::create([
                'user_id' => $appointment->user_id,
                'title' => 'Mise à jour du Rendez-vous',
                'content' => 'Votre rendez-vous avec ' . $appointment->veterinarian->clinic_name . ' ' . $statusTexts[$request->status],
                'type' => 'appointment',
                'is_read' => false,
                'data' => ['appointment_id' => $appointment->id]
            ]);
        }

        return response()->json($appointment);
    }
}
