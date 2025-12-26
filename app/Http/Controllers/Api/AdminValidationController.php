<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cour;
use Illuminate\Http\Request;

class AdminValidationController extends Controller
{
    public function index()
    {
        $cours = Cour::with(['groupes', 'groupes.filiere']) // On charge les infos utiles
                     ->orderBy('created_at', 'desc')
                     ->get();

        return response()->json([
            'status' => 'success',
            'count' => $cours->count(),
            'data' => $cours
        ]);
    }
    public function pending()
    {
        $cours = Cour::with(['groupes']) // On pourrait aussi charger le User qui a posté si on avait gardé le lien
                     ->where('est_valide', false)
                     ->orderBy('created_at', 'desc')
                     ->get();

        return response()->json(['status' => 'success', 'data' => $cours]);
    }

    /**
     * Valider un cours : le rend visible aux étudiants
     */
    public function validateCourse($id)
    {
        $cour = Cour::find($id);

        if (!$cour) {
            return response()->json(['message' => 'Cours introuvable'], 404);
        }

        $cour->est_valide = true;
        // On s'assure qu'il est aussi publié
        $cour->est_publie = true; 
        $cour->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Le cours a été validé.',
            'data' => $cour
        ]);
    }

    /**
     * Rejeter / Supprimer un cours inapproprié
     */
    public function rejectCourse($id)
    {
        $cour = Cour::find($id);
        if (!$cour) return response()->json(['message' => 'Introuvable'], 404);

        // Option A : Juste le dépublier
        // $cour->update(['est_publie' => false]);
        
        // Option B : Le supprimer définitivement
        $cour->delete(); 
        // Note: Pensez à supprimer le fichier physique aussi via Storage::delete()

        return response()->json(['message' => 'Cours rejeté et supprimé.']);
    }
}