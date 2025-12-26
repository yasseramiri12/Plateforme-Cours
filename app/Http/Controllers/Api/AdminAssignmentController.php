<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Professeur;
use App\Models\Filiere;
use App\Models\Module;
use Illuminate\Http\Request;

class AdminAssignmentController extends Controller
{
    // ==================================================
    // GESTION PROGRAMME (Filière <-> Module)
    // ==================================================

    /**
     * Ajouter un module au programme d'une filière
     */
    public function addModuleToFiliere(Request $request)
    {
        $validated = $request->validate([
            'id_filiere' => 'required|exists:filieres,id_filiere',
            'id_module' => 'required|exists:modules,id_module',
            'semestre' => 'required|integer|min:1|max:6',
            'coefficient' => 'required|integer|min:1'
        ]);

        $filiere = Filiere::findOrFail($validated['id_filiere']);

        // attach() insère dans la table pivot 'programme'
        // syncWithoutDetaching évite les doublons
        $filiere->modules()->syncWithoutDetaching([
            $validated['id_module'] => [
                'semestre' => $validated['semestre'],
                'coefficient' => $validated['coefficient']
            ]
        ]);

        return response()->json(['message' => 'Module ajouté au programme de la filière']);
    }

    /**
     * Retirer un module d'une filière
     */
    public function removeModuleFromFiliere($id_filiere, $id_module)
    {
        $filiere = Filiere::findOrFail($id_filiere);
        $filiere->modules()->detach($id_module);

        return response()->json(['message' => 'Module retiré du programme']);
    }

    // ==================================================
    // GESTION ENSEIGNEMENT (Professeur <-> Module)
    // ==================================================

    /**
     * Assigner un professeur à un module
     */
    public function assignProfToModule(Request $request)
    {
        $validated = $request->validate([
            'id_prof' => 'required|exists:professeurs,id_prof',
            'id_module' => 'required|exists:modules,id_module',
            'annee_affectation' => 'required|string', // ex: 2023-2024
            'est_coordinateur' => 'boolean'
        ]);

        $prof = Professeur::findOrFail($validated['id_prof']);

        $prof->modules()->syncWithoutDetaching([
            $validated['id_module'] => [
                'annee_affectation' => $validated['annee_affectation'],
                'est_coordinateur' => $validated['est_coordinateur'] ?? false
            ]
        ]);

        return response()->json(['message' => 'Professeur assigné au module']);
    }

    /**
     * Désassigner un professeur d'un module
     */
    public function detachProfFromModule($id_prof, $id_module)
    {
        $prof = Professeur::findOrFail($id_prof);
        $prof->modules()->detach($id_module);

        return response()->json(['message' => 'Professeur désassigné du module']);
    }
}