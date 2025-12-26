<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Filiere;
use App\Models\Groupe;
use App\Models\Module;
use App\Models\Cour;
use Illuminate\Http\Request;

class AdminStructureController extends Controller
{
    // ==================================================
    // GESTION DES FILIÈRES
    // ==================================================
    public function indexFilieres() {
        return response()->json(Filiere::all());
    }

    public function storeFiliere(Request $request) {
        $validated = $request->validate([
            'nom_filiere' => 'required|string|unique:filieres',
            'description' => 'nullable|string'
        ]);
        
        $filiere = Filiere::create($validated);
        return response()->json(['message' => 'Filière créée', 'data' => $filiere], 201);
    }

    public function updateFiliere(Request $request, $id) {
        $filiere = Filiere::findOrFail($id);
        
        $validated = $request->validate([
            // On ignore l'ID actuel pour la règle unique afin de pouvoir garder le même nom si on change juste la description
            'nom_filiere' => 'sometimes|string|unique:filieres,nom_filiere,' . $id . ',id_filiere',
            'description' => 'nullable|string'
        ]);

        $filiere->update($validated);
        return response()->json(['message' => 'Filière mise à jour', 'data' => $filiere]);
    }

    public function destroyFiliere($id) {
        // Attention : échouera si des groupes sont liés (grâce au onDelete('restrict') de la migration)
        // Idéalement, gérer l'exception ou vérifier avant
        $filiere = Filiere::find($id);
        if (!$filiere) return response()->json(['message' => 'Filière introuvable'], 404);

        try {
            $filiere->delete();
            return response()->json(['message' => 'Filière supprimée']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Impossible de supprimer cette filière car elle contient des groupes.'], 409);
        }
    }

    // ==================================================
    // GESTION DES GROUPES
    // ==================================================
    public function indexGroupes() {
        // On charge aussi le nom de la filière associée
        return response()->json(Groupe::with('filiere')->get());
    }

    public function storeGroupe(Request $request) {
        $validated = $request->validate([
            'nom_groupe' => 'required|string',
            'annee_scolaire' => 'required|string', // ex: 2023-2024
            'capacite_max' => 'required|integer',
            'id_filiere' => 'required|exists:filieres,id_filiere'
        ]);

        $groupe = Groupe::create($validated);
        return response()->json(['message' => 'Groupe créé', 'data' => $groupe], 201);
    }

    public function updateGroupe(Request $request, $id) {
        $groupe = Groupe::findOrFail($id);

        $validated = $request->validate([
            'nom_groupe' => 'sometimes|string',
            'annee_scolaire' => 'sometimes|string',
            'capacite_max' => 'sometimes|integer',
            'id_filiere' => 'sometimes|exists:filieres,id_filiere'
        ]);

        $groupe->update($validated);
        return response()->json(['message' => 'Groupe mis à jour', 'data' => $groupe]);
    }

    public function destroyGroupe($id) {
        $groupe = Groupe::find($id);
        if (!$groupe) return response()->json(['message' => 'Groupe introuvable'], 404);

        $groupe->delete();
        return response()->json(['message' => 'Groupe supprimé']);
    }

    // ==================================================
    // GESTION DES MODULES
    // ==================================================
    public function indexModules() {
        return response()->json(Module::all());
    }

    public function storeModule(Request $request) {
        $validated = $request->validate([
            'nom_module' => 'required|string',
            'code_module' => 'required|string|unique:modules', // Ex: INFO-101
            'credits_ects' => 'required|integer'
        ]);

        $module = Module::create($validated);
        return response()->json(['message' => 'Module créé', 'data' => $module], 201);
    }

    public function updateModule(Request $request, $id) {
        $module = Module::findOrFail($id);

        $validated = $request->validate([
            'nom_module' => 'sometimes|string',
            // Ignore l'ID actuel pour l'unicité du code
            'code_module' => 'sometimes|string|unique:modules,code_module,' . $id . ',id_module',
            'credits_ects' => 'sometimes|integer'
        ]);

        $module->update($validated);
        return response()->json(['message' => 'Module mis à jour', 'data' => $module]);
    }

    public function destroyModule($id) {
        $module = Module::find($id);
        if (!$module) return response()->json(['message' => 'Module introuvable'], 404);

        $module->delete();
        return response()->json(['message' => 'Module supprimé']);
    }

    // ==================================================
    // GESTION DES DOCUMENTS
    // ==================================================
    public function indexDocuments() {
        $documents = Cour::where('type_document', 'COURS')->get();
        return response()->json($documents);
    }

    public function storeDocument(Request $request) {
        $validated = $request->validate([
            'titre' => 'required|string',
            'description' => 'nullable|string',
            'fichier_url' => 'required|string',
        ]);

        $validated['type_document'] = 'COURS';
        $validated['date_creation'] = now();
        $validated['est_publie'] = true;
        $validated['est_valide'] = false;

        $document = Cour::create($validated);
        return response()->json(['message' => 'Document créé', 'data' => $document], 201);
    }

    public function updateDocument(Request $request, $id) {
        $document = Cour::findOrFail($id);

        $validated = $request->validate([
            'titre' => 'sometimes|string',
            'description' => 'nullable|string',
            'fichier_url' => 'sometimes|string',
        ]);

        $document->update($validated);
        return response()->json(['message' => 'Document mis à jour', 'data' => $document]);
    }

    public function destroyDocument($id) {
        $document = Cour::find($id);
        if (!$document) return response()->json(['message' => 'Document introuvable'], 404);

        $document->delete();
        return response()->json(['message' => 'Document supprimé']);
    }

    // ==================================================
    // GESTION DES VIDÉOS
    // ==================================================
    public function indexVideos() {
        $videos = Cour::where('type_document', 'VIDEO')->get();
        return response()->json($videos);
    }

    public function storeVideo(Request $request) {
        $validated = $request->validate([
            'titre' => 'required|string',
            'description' => 'nullable|string',
            'fichier_url' => 'required|string',
        ]);

        $validated['type_document'] = 'VIDEO';
        $validated['date_creation'] = now();
        $validated['est_publie'] = true;
        $validated['est_valide'] = false;

        $video = Cour::create($validated);
        return response()->json(['message' => 'Vidéo créée', 'data' => $video], 201);
    }

    public function updateVideo(Request $request, $id) {
        $video = Cour::findOrFail($id);

        $validated = $request->validate([
            'titre' => 'sometimes|string',
            'description' => 'nullable|string',
            'fichier_url' => 'sometimes|string',
        ]);

        $video->update($validated);
        return response()->json(['message' => 'Vidéo mise à jour', 'data' => $video]);
    }

    public function destroyVideo($id) {
        $video = Cour::find($id);
        if (!$video) return response()->json(['message' => 'Vidéo introuvable'], 404);

        $video->delete();
        return response()->json(['message' => 'Vidéo supprimée']);
    }
}