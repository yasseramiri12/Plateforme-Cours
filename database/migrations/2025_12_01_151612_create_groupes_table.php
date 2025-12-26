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
        Schema::create('groupes', function (Blueprint $table) {
            $table->id('id_groupe');
            $table->string('nom_groupe');
            $table->string('annee_scolaire');
            $table->integer('capacite_max');
            // Clé étrangère vers Filiere
            $table->foreignId('id_filiere')->constrained('filieres', 'id_filiere')->onDelete('cascade');
            $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('groupes');
    }
};
