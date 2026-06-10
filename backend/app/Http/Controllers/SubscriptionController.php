<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function checkout(Request $request)
    {
        $user = $request->user();
        
        // Simule un traitement de paiement de 1.5 secondes
        sleep(1);

        // Met à jour l'utilisateur en tant que PRO
        $user->is_pro = true;
        $user->save();

        return response()->json([
            'message' => 'Paiement simulé réussi. Vous êtes maintenant PetLuxe Pro !',
            'user' => $user
        ]);
    }
}
