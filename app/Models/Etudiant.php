<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_etudiant';

    protected $fillable = [
        'user_id',
        'matricule',
        'id_groupe',
        'date_inscription',
        // Infos administratives complètes
        'nom',
        'prenom',
        'email',
        'telephone',
        'adresse',
        'date_naissance'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function groupe()
    {
        return $this->belongsTo(Groupe::class, 'id_groupe', 'id_groupe');
    }
}