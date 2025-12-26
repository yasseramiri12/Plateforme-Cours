<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Login centralisé sur la table 'users'.
     */
    public function login(Request $request)
    {
        // 1. Validation
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Authentification standard Laravel (Table users)
        if (Auth::attempt($credentials)) {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            
            // 3. Création du Token
            $token = $user->createToken('auth_token')->plainTextToken;

            // 4. Récupération du profil métier lié (Polymorphisme manuel)
            $profil = null;
            
            if ($user->role === 'ETUDIANT') {
                // On charge le profil étudiant avec son groupe
                $profil = $user->etudiant()->with('groupe')->first();
            } elseif ($user->role === 'PROF') {
                // On charge le profil prof
                $profil = $user->professeur;
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Connexion réussie',
                'role' => $user->role,
                'user' => $user,         // Infos de connexion (Nom, Email)
                'profil_metier' => $profil, // Infos métier (Matricule, Groupe, Spécialité...)
                'token' => $token
            ]);
        }

        return response()->json(['message' => 'Identifiants incorrects'], 401);
    }
     /**
     * Login pour l'application Web (React/Inertia)
     * Crée une SESSION (Cookie) au lieu d'un simple token.
     */
    public function loginWeb(Request $request)
    {
        // 1. Validation
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Authentification avec Session
        if (Auth::attempt($credentials)) {
            // CRUCIAL : On régénère la session pour le navigateur
            $request->session()->regenerate();

            /** @var \App\Models\User $user */
            $user = Auth::user();
            
            // On récupère aussi le token pour les futurs appels API via Axios si besoin
            $token = $user->createToken('auth_token')->plainTextToken;

            // Récupération du profil métier
            $profil = null;
            if ($user->role === 'ETUDIANT') {
                $profil = $user->etudiant()->with('groupe')->first();
            } elseif ($user->role === 'PROF') {
                $profil = $user->professeur;
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Connexion Web réussie',
                'role' => $user->role,
                'user' => $user,
                'profil_metier' => $profil,
                'token' => $token
            ]);
        }

        return response()->json(['message' => 'Identifiants incorrects'], 401);
    }
}