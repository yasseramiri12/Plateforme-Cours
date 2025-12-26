<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('professeurs', function (Blueprint $table) {
            // Clé primaire personnalisée
            $table->id('id_prof');

            // Lien OBLIGATOIRE vers le compte de connexion (Table users)
            $table->foreignId('user_id')
                  ->unique() // Important : Un User = Un seul profil Professeur
                  ->constrained('users')
                  ->onDelete('cascade');

            // --- Nouveaux détails administratifs (Identiques au prof) ---
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->unique(); // Email de contact professionnel
            $table->string('telephone')->nullable();
            $table->string('adresse')->nullable();
            $table->date('date_naissance')->nullable();

            // --- Données Professionnelles (Spécifique Professeur) ---
            $table->date('date_embauche')->nullable();
            $table->string('specialite')->nullable();  // Ex: "IA", "Réseaux"
            
            // Gestion des droits d'accès
            $table->boolean('est_actif')->default(true); // Par défaut, le prof peut se connecter

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('professeurs');
    }
};