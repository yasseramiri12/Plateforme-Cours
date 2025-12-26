<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CoursController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Page d'accueil (Welcome)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// --- ROUTES PUBLIQUES ---

// 1. Affichage du Login React
Route::get('/login-app', function () {
    return Inertia::render('Auth/Login');
})->name('login.app');

// 2. Traitement du Login (Session)
Route::post('/login-web', [AuthController::class, 'loginWeb']);

// --- ESPACE ADMINISTRATEUR (Dashboard + Structure) ---
Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    
    // Dashboard Principal
    Route::get('/dashboard', function () {
        if (Auth::user()->role !== 'ADMIN') abort(403);
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');

    // Gestion des Utilisateurs
    Route::get('/users', function () {
        if (Auth::user()->role !== 'ADMIN') abort(403);
        return Inertia::render('Admin/Users');
    })->name('admin.users');

    // Gestion de la Structure
    Route::get('/filieres', function () {
        if (Auth::user()->role !== 'ADMIN') abort(403);
        return Inertia::render('Admin/Structure/Filieres');
    })->name('admin.filieres');

    Route::get('/groupes', function () {
        if (Auth::user()->role !== 'ADMIN') abort(403);
        return Inertia::render('Admin/Structure/Groupes');
    })->name('admin.groupes');

    Route::get('/modules', function () {
        if (Auth::user()->role !== 'ADMIN') abort(403);
        return Inertia::render('Admin/Structure/Modules');
    })->name('admin.modules');

    Route::get('/documents', function () {
        if (Auth::user()->role !== 'ADMIN') abort(403);
        return Inertia::render('Admin/Structure/Documents');
    })->name('admin.documents');

    Route::get('/videos', function () {
        if (Auth::user()->role !== 'ADMIN') abort(403);
        return Inertia::render('Admin/Structure/Videos');
    })->name('admin.videos');
});

// --- ESPACE PROFESSEUR ---
Route::middleware(['auth', 'verified'])->prefix('prof')->group(function () {
    
    Route::get('/dashboard', function () {
        if (Auth::user()->role !== 'PROF') abort(403);
        return Inertia::render('Prof/Dashboard');
    })->name('prof.dashboard');

    Route::get('/courses', function () {
        if (Auth::user()->role !== 'PROF') abort(403);
        return Inertia::render('Prof/Courses');
    })->name('prof.courses');

    Route::get('/groupes', function () {
        if (Auth::user()->role !== 'PROF') abort(403);
        return Inertia::render('Prof/Groupes');
    })->name('prof.groupes');

    Route::get('/documents', function () {
        if (Auth::user()->role !== 'PROF') abort(403);
        return Inertia::render('Prof/Documents');
    })->name('prof.documents');
    
    Route::get('/profile', function () {
        if (Auth::user()->role !== 'PROF') abort(403);
        return Inertia::render('Prof/Profile');
    })->name('prof.profile');
});

// --- ESPACE ÉTUDIANT ---
Route::middleware(['auth', 'verified'])->prefix('etudiant')->group(function () {
    
    Route::get('/dashboard', function () {
        if (Auth::user()->role !== 'ETUDIANT') abort(403);
        return Inertia::render('Etudiant/Dashboard');
    })->name('etudiant.dashboard');

    Route::get('/mes-cours', function () {
        if (Auth::user()->role !== 'ETUDIANT') abort(403);
        return Inertia::render('Etudiant/Courses');
    })->name('etudiant.courses');

    Route::get('/profil', function () {
        if (Auth::user()->role !== 'ETUDIANT') abort(403);
        return Inertia::render('Etudiant/Profile');
    })->name('etudiant.profile');

    Route::get('/calendrier', function () {
        if (Auth::user()->role !== 'ETUDIANT') abort(403);
        return Inertia::render('Etudiant/Calendar');
    })->name('etudiant.calendar');

    Route::get('/telecharger-video', function () {
        if (Auth::user()->role !== 'ETUDIANT') abort(403);
        return Inertia::render('Etudiant/DownloadVideos');
    })->name('etudiant.download-videos');

    Route::get('/telecharger-pdf', function () {
        if (Auth::user()->role !== 'ETUDIANT') abort(403);
        return Inertia::render('Etudiant/DownloadPDFs');
    })->name('etudiant.download-pdfs');

    Route::get('/schedule', function () {
        if (Auth::user()->role !== 'ETUDIANT') abort(403);
        return Inertia::render('Etudiant/Schedule');
    })->name('etudiant.schedule');

    Route::get('/grades', function () {
        if (Auth::user()->role !== 'ETUDIANT') abort(403);
        return Inertia::render('Etudiant/Grades');
    })->name('etudiant.grades');

    Route::get('/assignments', function () {
        if (Auth::user()->role !== 'ETUDIANT') abort(403);
        return Inertia::render('Etudiant/Assignments');
    })->name('etudiant.assignments');

    Route::get('/transcript', function () {
        if (Auth::user()->role !== 'ETUDIANT') abort(403);
        return Inertia::render('Etudiant/Transcript');
    })->name('etudiant.transcript');

    Route::get('/certificates', function () {
        if (Auth::user()->role !== 'ETUDIANT') abort(403);
        return Inertia::render('Etudiant/Certificates');
    })->name('etudiant.certificates');
});


Route::get('/dashboard-client', function () {
    $user = Auth::user();

    if ($user->role === 'ADMIN') {
        return redirect()->route('admin.dashboard');
    } elseif ($user->role === 'PROF') {
        return redirect()->route('prof.dashboard');
    } elseif ($user->role === 'ETUDIANT') {
        return redirect()->route('etudiant.dashboard');
    } else {
        return redirect()->route('cours.index');
    }
})->middleware(['auth', 'verified']);


// --- ROUTES GÉNÉRIQUES & ÉTUDIANTS ---
Route::middleware('auth')->group(function () {
    // Dashboard par défaut (Fallback)
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Espace Cours (Étudiant/Prof)
    Route::get('/cours', [CoursController::class, 'index'])->name('cours.index');

    // Route de test
    Route::get('/test', function () {
        return 'Web.php fonctionne ! (Connecté)';
    });
});

// Route pour le tableau de bord étudiant en HTML statique
Route::get('/etudiant/dashboard-vanilla', function () {
    return file_get_contents(resource_path('static/dashboard.html'));
});

require __DIR__.'/auth.php';