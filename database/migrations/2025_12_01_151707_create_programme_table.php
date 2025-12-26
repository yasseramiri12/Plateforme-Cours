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
        Schema::create('programme', function (Blueprint $table) {
            $table->foreignId('id_filiere')->constrained('filieres', 'id_filiere')->onDelete('cascade');
            $table->foreignId('id_module')->constrained('modules', 'id_module')->onDelete('cascade');
            $table->integer('semestre');
            $table->integer('coefficient');
            $table->primary(['id_filiere', 'id_module']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programme');
    }
};
