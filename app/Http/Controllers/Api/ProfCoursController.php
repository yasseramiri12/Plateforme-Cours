<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cour;
use App\Models\Module;
use App\Models\Groupe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * ProfCoursController - Gestion des cours pour les professeurs
 * 
 * Routes associées:
 * - GET /api/prof/my-modules: Récupérer les modules du prof
 * - GET /api/prof/my-groupes: Récupérer les groupes disponibles
 * - GET /api/prof/cours: Lister les cours du prof
 * - POST /api/prof/cours: Créer un cours (upload fichier)
 * - PUT /api/prof/cours/{id}: Modifier un cours
 * - DELETE /api/prof/cours/{id}: Supprimer un cours
 */
class ProfCoursController extends Controller
{
    /**
     * Récupérer les modules enseignés par le professeur
     * Via la table de relation 'enseigner'
     */
    public function getMyModules(Request $request) {
        $prof = $request->user()->professeur;
        
        if (!$prof) {
            return response()->json(['data' => []], 200);
        }

        return response()->json(['data' => $prof->modules]);
    }

    /**
     * Récupérer tous les groupes disponibles
     * (Le prof peut assigner ses cours à n'importe quel groupe)
     */
    public function getMyGroupes() {
        $groupes = Groupe::all();
        return response()->json(['data' => $groupes]);
    }

    /**
     * Lister les cours créés par le professeur
     * Retourne aussi les groupes liés à chaque cours
     */
    public function index(Request $request) {
        $cours = Cour::with('groupes')->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $cours]);
    }

    /**
     * Créer un nouveau cours (upload du fichier + assignation aux groupes)
     * 
     * Validation requise:
     * - titre: Requis, texte (max 255 caractères)
     * - type_document: COURS|TP|TD|VIDEO
     * - fichier: Fichier (max 20 MB)
     * - groupes: Tableau d'IDs de groupes (au moins un requis)
     */
    public function store(Request $request) {
        // Vérification que c'est bien un prof
        if ($request->user()->role !== 'PROF') {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $request->validate([
            'titre' => 'required|string|max:255',
            'type_document' => 'required|in:COURS,TD,TP,VIDEO',
            'fichier' => 'required|file|max:20480', // 20MB max
            'groupes' => 'required|array', // Tableau d'IDs [1, 2]
            'groupes.*' => 'exists:groupes,id_groupe',
            'description' => 'nullable|string'
            // 'id_module' => 'required' // Si vous gérez les modules
        ]);

        // 1. Upload Fichier
        // Stockage dans le dossier 'cours_files' du disque 'public'
        $path = $request->file('fichier')->store('cours_files', 'public');
        
        // Génération de l'URL accessible publiquement
        // Utilisé directement le chemin relatif au disque 'public', sans le /storage/
        // Cela permet au frontend de construire l'URL correctement
        $url = 'cours_files/' . basename($path);

        // 2. Création DB
        $cour = new Cour();
        $cour->titre = $request->titre;
        $cour->description = $request->input('description');
        $cour->type_document = $request->type_document;
        $cour->fichier_url = $url;
        
        $cour->est_publie = true;
        $cour->est_valide = false; // Doit être validé par l'Admin par défaut
        $cour->save();

        // 3. Liaison aux groupes (Diffusion)
        $cour->groupes()->sync($request->groupes);

        return response()->json([
            'message' => 'Cours déposé avec succès. En attente de validation admin.',
            'data' => $cour
        ], 201);
    }

    /**
     * Mise à jour d'un cours
     */
    public function update(Request $request, $id) {
        $cour = Cour::find($id);
        if (!$cour) return response()->json(['message' => 'Introuvable'], 404);

        $request->validate([
            'titre' => 'sometimes|string',
            'type_document' => 'sometimes|in:COURS,TD,TP,VIDEO',
        ]);

        $cour->update($request->only(['titre', 'description', 'type_document']));

        if ($request->has('groupes')) {
            $cour->groupes()->sync($request->groupes);
        }

        return response()->json(['message' => 'Cours mis à jour', 'data' => $cour]);
    }

    /**
     * Supprimer un cours
     */
    public function destroy($id) {
        $cour = Cour::find($id);
        if (!$cour) return response()->json(['message' => 'Introuvable'], 404);

        // Supprimer fichier physique pour nettoyer le serveur
        $path = $cour->fichier_url;
        
        // Si le chemin commence par /, enlever le premier slash
        if (strpos($path, '/') === 0) {
            $path = substr($path, 1);
        }
        
        // Essayer de supprimer le fichier s'il existe
        if (!empty($path) && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        $cour->delete();
        return response()->json(['message' => 'Cours supprimé']);
    }
}