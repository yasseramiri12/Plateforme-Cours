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
        Schema::create('diffusion', function (Blueprint $table) {
            $table->foreignId('id_cours')->constrained('cours', 'id_cours')->onDelete('cascade');
            $table->foreignId('id_groupe')->constrained('groupes', 'id_groupe')->onDelete('cascade');
            $table->dateTime('date_ouverture')->nullable();
            $table->dateTime('date_fermeture')->nullable();
            $table->primary(['id_cours', 'id_groupe']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diffusion');
    }
};
