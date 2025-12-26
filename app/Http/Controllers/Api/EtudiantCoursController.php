<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cour;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EtudiantCoursController extends Controller
{
    /**
     * Liste les cours accessibles uniquement pour le groupe de l'étudiant connecté.
     */
    public function index(Request $request)
    {
        // 1. Récupérer le User connecté (Table users)
        $user = $request->user();

        // 2. Récupérer le profil métier (Table etudiants) via la relation
        $etudiantProfile = $user->etudiant;

        // Vérification de sécurité : est-ce bien un étudiant avec un groupe ?
        if (!$etudiantProfile || !$etudiantProfile->id_groupe) {
            return response()->json(['message' => 'Accès refusé : Profil étudiant incomplet ou sans groupe.'], 403);
        }

        $idGroupe = $etudiantProfile->id_groupe;

        // 3. Requête filtrée via la table pivot diffusion
        $cours = Cour::whereHas('groupes', function ($query) use ($idGroupe) {
                        $query->where('groupes.id_groupe', $idGroupe);
                    })
                    ->where('est_publie', true) // ET sont publiés par le prof
                    ->where('est_valide', true) // ET sont validés par l'admin
                    ->with('groupes:id_groupe,nom_groupe') // Charge les infos du groupe pour affichage
                    ->orderBy('created_at', 'desc') // On utilise bien created_at standard
                    ->get();

        return response()->json([
            'status' => 'success',
            'groupe_etudiant' => $idGroupe,
            'count' => $cours->count(),
            'data' => $cours
        ]);
    }

    /**
     * Téléchargement sécurisé d'un fichier.
     */
       public function download(Request $request, $id)
    {
        // 1. Vérification Profil
        $user = $request->user();
        $etudiantProfile = $user->etudiant;

        if (!$etudiantProfile || !$etudiantProfile->id_groupe) {
            return response()->json(['message' => 'Accès refusé : Profil étudiant invalide.'], 403);
        }

        $idGroupe = $etudiantProfile->id_groupe;

        // 2. Vérification Existence Cours
        $cour = Cour::find($id);
        if (!$cour) {
            return response()->json(['message' => 'Erreur 404 : Ce cours n\'existe pas (ID incorrect).'], 404);
        }

        // 3. Vérification Statut
        if (!$cour->est_valide) {
            return response()->json(['message' => 'Accès refusé : Ce cours n\'a pas encore été validé par l\'administrateur.'], 403);
        }
        if (!$cour->est_publie) {
            return response()->json(['message' => 'Accès refusé : Ce cours n\'est pas publié.'], 403);
        }

        // 4. Vérification Groupe (La plus fréquente source d'erreur)
        // On vérifie si le cours est bien lié au groupe de l'étudiant via la table diffusion
        $isDiffuse = $cour->groupes()->where('groupes.id_groupe', $idGroupe)->exists();

        if (!$isDiffuse) {
            return response()->json([
                'message' => 'Accès refusé : Ce cours n\'est pas destiné à votre groupe.',
                'votre_groupe_id' => $idGroupe,
                'cours_diffuse_aux_groupes' => $cour->groupes->pluck('id_groupe')
            ], 403);
        }

        // 5. Gestion Fichier avec plusieurs stratégies de chemin
        $fichier_url = $cour->fichier_url;
        
        // Stratégie 1: Le chemin commence par /storage/ ou storage/
        $path = $fichier_url;
        
        // Enlever le /storage/ en début si présent
        if (strpos($path, '/storage/') === 0) {
            $path = str_replace('/storage/', '', $path);
        } elseif (strpos($path, 'storage/') === 0) {
            $path = str_replace('storage/', '', $path);
        }
        
        // Vérifier si le fichier existe avec le disque 'public'
        if (!Storage::disk('public')->exists($path)) {
            // Stratégie 2: Peut-être le chemin est déjà un chemin brut 'cours_files/...'
            // Essayer sans modification
            if (!Storage::disk('public')->exists($fichier_url)) {
                return response()->json([
                    'message' => 'Erreur Serveur : Le fichier physique est introuvable.',
                    'chemin_attendu' => $path,
                    'url_stockee' => $fichier_url,
                    'disque' => 'public'
                ], 404);
            }
            $path = $fichier_url;
        }

        // --- TÉLÉCHARGEMENT ---
        $fullPath = Storage::disk('public')->path($path);
        $fileName = basename($fullPath);
        
        return response()->download($fullPath, $cour->titre . '.' . pathinfo($fullPath, PATHINFO_EXTENSION));
    }

    /**
     * Récupère le profil de l'étudiant connecté
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        $etudiant = $user->etudiant;

        if (!$etudiant) {
            return response()->json(['message' => 'Profil étudiant non trouvé.'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id_etudiant' => $etudiant->id_etudiant,
                'matricule' => $etudiant->matricule,
                'nom' => $etudiant->nom,
                'prenom' => $etudiant->prenom,
                'email' => $etudiant->email,
                'telephone' => $etudiant->telephone,
                'adresse' => $etudiant->adresse,
                'date_naissance' => $etudiant->date_naissance,
                'date_inscription' => $etudiant->date_inscription,
                'groupe' => $etudiant->groupe ? [
                    'id_groupe' => $etudiant->groupe->id_groupe,
                    'nom_groupe' => $etudiant->groupe->nom_groupe,
                    'filiere' => $etudiant->groupe->filiere ? [
                        'id_filiere' => $etudiant->groupe->filiere->id_filiere,
                        'nom_filiere' => $etudiant->groupe->filiere->nom_filiere
                    ] : null
                ] : null
            ]
        ]);
    }

    /**
     * Récupère les notifications de l'étudiant
     */
    public function getNotifications(Request $request)
    {
        $user = $request->user();
        $etudiant = $user->etudiant;

        if (!$etudiant) {
            return response()->json(['message' => 'Profil étudiant non trouvé.'], 404);
        }

        // Récupère les derniers cours publiés pour le groupe de l'étudiant
        $notifications = Cour::whereHas('groupes', function ($query) use ($etudiant) {
                            $query->where('groupes.id_groupe', $etudiant->id_groupe);
                        })
                        ->where('est_publie', true)
                        ->where('est_valide', true)
                        ->orderBy('created_at', 'desc')
                        ->limit(5)
                        ->get()
                        ->map(function ($cour) {
                            return [
                                'id' => $cour->id_cour,
                                'titre' => 'Nouveau cours: ' . $cour->titre,
                                'message' => 'Un nouveau cours "' . $cour->titre . '" a été publié pour votre groupe.',
                                'created_at' => $cour->created_at
                            ];
                        });

        return response()->json([
            'status' => 'success',
            'data' => $notifications
        ]);
    }

    /**
     * Récupère le calendrier des cours (schedule)
     */
    public function getCalendar(Request $request)
    {
        $user = $request->user();
        $etudiant = $user->etudiant;

        if (!$etudiant || !$etudiant->id_groupe) {
            return response()->json(['message' => 'Profil étudiant incomplet.'], 403);
        }

        // Récupère les cours pour le calendrier
        $courses = Cour::whereHas('groupes', function ($query) use ($etudiant) {
                            $query->where('groupes.id_groupe', $etudiant->id_groupe);
                        })
                        ->where('est_publie', true)
                        ->where('est_valide', true)
                        ->with(['groupes:id_groupe,nom_groupe'])
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json([
            'status' => 'success',
            'count' => $courses->count(),
            'data' => $courses
        ]);
    }

    /**
     * Recherche dans les cours
     */
    public function search(Request $request)
    {
        $query = $request->query('q', '');
        $user = $request->user();
        $etudiant = $user->etudiant;

        if (!$etudiant || !$etudiant->id_groupe) {
            return response()->json(['message' => 'Profil étudiant incomplet.'], 403);
        }

        $courses = Cour::whereHas('groupes', function ($q) use ($etudiant) {
                            $q->where('groupes.id_groupe', $etudiant->id_groupe);
                        })
                        ->where('est_publie', true)
                        ->where('est_valide', true)
                        ->where(function ($q) use ($query) {
                            $q->where('titre', 'like', '%' . $query . '%')
                              ->orWhere('description', 'like', '%' . $query . '%');
                        })
                        ->with('groupes')
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json([
            'status' => 'success',
            'query' => $query,
            'count' => $courses->count(),
            'data' => $courses
        ]);
    }
}