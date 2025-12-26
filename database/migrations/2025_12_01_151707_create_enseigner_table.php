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
        Schema::create('enseigner', function (Blueprint $table) {
            $table->foreignId('id_prof')->constrained('professeurs', 'id_prof')->onDelete('cascade');
            $table->foreignId('id_module')->constrained('modules', 'id_module')->onDelete('cascade');
            $table->primary(['id_prof', 'id_module']);
            $table->string('annee_affectation');
            $table->boolean('est_coordinateur')->default(false);
            
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enseigner');
    }
};
