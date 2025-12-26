<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    /**
     * Crée un nouvel utilisateur (Admin, Prof ou Étudiant) avec son profil associé.
     */
    public function storeUser(Request $request)
    {
        // 1. VALIDATION DES DONNÉES
        $validated = $request->validate([
            // Données d'identité et de connexion (Table users)
            'nom' => 'required|string|max:50',
            'prenom' => 'required|string|max:50',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|in:ETUDIANT,PROF,ADMIN',

            // Données administratives communes (Pour les tables profils)
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'date_naissance' => 'nullable|date',

            // Champs spécifiques Étudiant (Requis si rôle = ETUDIANT)
            'matricule' => 'required_if:role,ETUDIANT|unique:etudiants',
            'id_groupe' => 'required_if:role,ETUDIANT|exists:groupes,id_groupe',
            
            // Champs spécifiques Prof (Optionnel)
            'specialite' => 'nullable|string|max:100',
        ]);

        // 2. CRÉATION DU COMPTE DE CONNEXION (Table users)
        // On insère 'nom' et 'prenom' directement car nous avons modifié la migration
        $user = User::create([
            'name' => $validated['prenom'] . ' ' . $validated['nom'], 
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        // 3. CRÉATION DU PROFIL MÉTIER (Table etudiants ou professeurs)
        
        // On prépare les données communes à injecter dans le profil
        $profilData = [
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'], // On redondance l'email pour faciliter les requêtes métier
            'telephone' => $validated['telephone'] ?? null,
            'adresse' => $validated['adresse'] ?? null,
            'date_naissance' => $validated['date_naissance'] ?? null,
        ];

        if ($validated['role'] === 'ETUDIANT') {
            // Création du profil Étudiant via la relation
            $user->etudiant()->create(array_merge($profilData, [
                'matricule' => $validated['matricule'],
                'id_groupe' => $validated['id_groupe'],
                'date_inscription' => now(),
            ]));
        } 
        elseif ($validated['role'] === 'PROF') {
            // Création du profil Professeur via la relation
            $user->professeur()->create(array_merge($profilData, [
                'specialite' => $validated['specialite'] ?? null,
                'date_embauche' => now(),
                'est_actif' => true
            ]));
        }

        return response()->json([
            'message' => 'Utilisateur et profil complets créés avec succès',
            'user' => $user
        ], 201);
    }

}