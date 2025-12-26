<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- IMPORTS DES CONTRÔLEURS ---
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminStructureController;
use App\Http\Controllers\Api\AdminValidationController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AdminAssignmentController;
use App\Http\Controllers\Api\ProfCoursController;
use App\Http\Controllers\Api\EtudiantCoursController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Login (Public)
Route::post('/login', [AuthController::class, 'login']);

// Routes Protégées
Route::middleware('auth:sanctum')->group(function () {

    // ==========================================
    // 1. ESPACE ADMINISTRATEUR
    // ==========================================
    Route::prefix('admin')->group(function () {
        
        // A. GESTION DES UTILISATEURS (CRUD)
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);
        Route::post('/users', [AdminController::class, 'storeUser']); // Création spécifique (avec profil)
        Route::put('/users/{id}', [AdminUserController::class, 'update']);
        

        // B. STRUCTURE PÉDAGOGIQUE (Filières, Groupes, Modules)
        Route::get('/filieres', [AdminStructureController::class, 'indexFilieres']);
        Route::post('/filieres', [AdminStructureController::class, 'storeFiliere']);
        Route::put('/filieres/{id}', [AdminStructureController::class, 'updateFiliere']);
        Route::delete('/filieres/{id}', [AdminStructureController::class, 'destroyFiliere']);

        Route::get('/groupes', [AdminStructureController::class, 'indexGroupes']);
        Route::post('/groupes', [AdminStructureController::class, 'storeGroupe']);
        Route::put('/groupes/{id}', [AdminStructureController::class, 'updateGroupe']);
        Route::delete('/groupes/{id}', [AdminStructureController::class, 'destroyGroupe']);

        Route::get('/modules', [AdminStructureController::class, 'indexModules']);
        Route::post('/modules', [AdminStructureController::class, 'storeModule']);
        Route::put('/modules/{id}', [AdminStructureController::class, 'updateModule']);
        Route::delete('/modules/{id}', [AdminStructureController::class, 'destroyModule']);

        // B.2 GESTION DES DOCUMENTS ET VIDÉOS
        Route::get('/documents', [AdminStructureController::class, 'indexDocuments']);
        Route::post('/documents', [AdminStructureController::class, 'storeDocument']);
        Route::put('/documents/{id}', [AdminStructureController::class, 'updateDocument']);
        Route::delete('/documents/{id}', [AdminStructureController::class, 'destroyDocument']);

        Route::get('/videos', [AdminStructureController::class, 'indexVideos']);
        Route::post('/videos', [AdminStructureController::class, 'storeVideo']);
        Route::put('/videos/{id}', [AdminStructureController::class, 'updateVideo']);
        Route::delete('/videos/{id}', [AdminStructureController::class, 'destroyVideo']);

        // C. AFFECTATIONS (Tables Pivots)
        // Programme : Lier Module à Filière
        Route::post('/programme/assign', [AdminAssignmentController::class, 'addModuleToFiliere']);
        Route::delete('/programme/{id_filiere}/{id_module}', [AdminAssignmentController::class, 'removeModuleFromFiliere']);

        // Enseignement : Lier Prof à Module
        Route::post('/enseignement/assign', [AdminAssignmentController::class, 'assignProfToModule']);
        Route::delete('/enseignement/{id_prof}/{id_module}', [AdminAssignmentController::class, 'detachProfFromModule']);

        // D. VALIDATION DES COURS
        Route::get('/cours/all', [AdminValidationController::class, 'index']);
        Route::get('/cours/pending', [AdminValidationController::class, 'pending']);
        Route::patch('/cours/{id}/validate', [AdminValidationController::class, 'validateCourse']);
        Route::delete('/cours/{id}/reject', [AdminValidationController::class, 'rejectCourse']);
    });

    // ==========================================
    // 2. ESPACE PROFESSEUR
    // ==========================================
    Route::prefix('prof')->group(function () {
        Route::get('/my-modules', [ProfCoursController::class, 'getMyModules']);
        Route::get('/my-groupes', [ProfCoursController::class, 'getMyGroupes']);
        
        Route::get('/cours', [ProfCoursController::class, 'index']);
        Route::post('/cours', [ProfCoursController::class, 'store']);
        Route::put('/cours/{id}', [ProfCoursController::class, 'update']);
        Route::delete('/cours/{id}', [ProfCoursController::class, 'destroy']);
    });

    // ==========================================
    // 3. ESPACE ÉTUDIANT
    // ==========================================
    Route::prefix('etudiant')->group(function () {
        Route::get('/mes-cours', [EtudiantCoursController::class, 'index']);
        Route::get('/cours/{id}/download', [EtudiantCoursController::class, 'download']);
        Route::get('/profil', [EtudiantCoursController::class, 'getProfile']);
        Route::get('/notifications', [EtudiantCoursController::class, 'getNotifications']);
        Route::get('/calendrier', [EtudiantCoursController::class, 'getCalendar']);
        Route::get('/rechercher', [EtudiantCoursController::class, 'search']);
    });

});