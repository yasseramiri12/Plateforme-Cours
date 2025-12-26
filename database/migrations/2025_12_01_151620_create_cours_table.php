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
        Schema::create('cours', function (Blueprint $table) {
            $table->id('id_cours');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->string('fichier_url');
            $table->string('type_document'); // PDF, VIDEO...
            $table->boolean('est_publie')->default(false);
            $table->boolean('est_valide')->default(false);
            $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cours');
    }
};
