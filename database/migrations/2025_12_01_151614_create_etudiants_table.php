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
        Schema::create('etudiants', function (Blueprint $table) {
            // Clé primaire personnalisée
            $table->id('id_etudiant');

            // Lien OBLIGATOIRE vers le compte de connexion (Table users)
            // OnDelete('cascade') : Si on supprime le User, le profil Etudiant est supprimé aussi.
            $table->foreignId('user_id')
                  ->unique() // Important : Un User = Un seul profil Etudiant
                  ->constrained('users')
                  ->onDelete('cascade');

            // --- Nouveaux détails administratifs ---
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->unique(); // Email de contact ou perso
            $table->string('telephone')->nullable();
            $table->string('adresse')->nullable();
            $table->date('date_naissance')->nullable();

            // --- Données Scolaires ---
            $table->string('matricule')->unique(); // Ex: E2023001
            $table->dateTime('date_inscription'); // Date d'entrée à l'école

            // Affectation pédagogique (Lien vers la table Groupes)
            // OnDelete('restrict') : Empêche de supprimer un groupe s'il contient encore des étudiants.
            $table->foreignId('id_groupe')
                  ->constrained('groupes', 'id_groupe')
                  ->onDelete('restrict');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('etudiants');
    }
};