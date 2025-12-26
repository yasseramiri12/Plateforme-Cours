<?php

namespace App\Http\Controllers;

use App\Models\Cour;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CoursController extends Controller
{
    public function index() {
        // Récupérer les cours avec leurs groupes associés
        $cours = Cour::with('groupes')->get();
        
        // Renvoyer la vue React 'Cours/Index'
        return Inertia::render('Cours/Index', [
            'cours' => $cours,
            'auth' => ['user' => Auth::user()]
        ]);
    }
}