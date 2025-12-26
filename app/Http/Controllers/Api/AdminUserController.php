<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller
{
    /**
     * Lister tous les utilisateurs avec leur profil métier
     */
    public function index()
    {
        // On récupère les users et on charge dynamiquement leur profil étudiant ou prof
        $users = User::with(['etudiant.groupe', 'professeur'])
                     ->orderBy('created_at', 'desc')
                     ->get();

        return response()->json([
            'count' => $users->count(),
            'data' => $users
        ]);
    }

    /**
     * Voir un utilisateur spécifique
     */
    public function show($id)
    {
        $user = User::with(['etudiant.groupe', 'professeur'])->find($id);

        if (!$user) return response()->json(['message' => 'Utilisateur introuvable'], 404);

        return response()->json($user);
    }

    /**
     * Supprimer un utilisateur (et son profil par cascade)
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) return response()->json(['message' => 'Utilisateur introuvable'], 404);

        // Pas touche au Super Admin (sécurité basique)
        if ($user->role === 'ADMIN' && $user->id === 1) { // Supposons que l'ID 1 est le super admin
             return response()->json(['message' => 'Impossible de supprimer le Super Admin'], 403);
        }

        $user->delete(); // Grâce à onDelete('cascade') dans les migrations, le profil etudiant/prof part aussi.

        return response()->json(['message' => 'Utilisateur et profil supprimés avec succès']);
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update(Request $request, $id)
    {
        $user = User::with(['etudiant', 'professeur'])->find($id);
        if (!$user) return response()->json(['message' => 'Utilisateur introuvable'], 404);

        // Mise à jour des infos générales
        $user->update($request->only(['name', 'email', 'role']));

        // Mise à jour du profil étudiant
        if ($user->etudiant) {
            $user->etudiant->update($request->only([
                'nom', 'prenom', 'email', 'telephone', 'adresse', 'date_naissance', 'id_groupe'
            ]));
        }

        // Mise à jour du profil professeur
        if ($user->professeur) {
            $user->professeur->update($request->only([
                'nom', 'prenom', 'email', 'telephone', 'adresse', 'date_naissance', 'date_embauche', 'specialite', 'est_actif'
            ]));
        }

        return response()->json(['message' => 'Utilisateur mis à jour', 'data' => $user->fresh(['etudiant.groupe', 'professeur'])]);
    }

    
}