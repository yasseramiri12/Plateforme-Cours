<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Professeur extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_prof';

    protected $fillable = [
        'user_id',
        // Infos administratives
        'nom',
        'prenom',
        'email',
        'telephone',
        'adresse',
        'date_naissance',
        // Infos professionnelles
        'date_embauche',
        'specialite',
        'est_actif'
    ];

    // Relation vers le compte de connexion
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    // Relation vers les modules enseignés (inchangée)
    public function modules()
    {
        return $this->belongsToMany(Module::class, 'enseigner', 'id_module', 'id_prof')
                    ->withPivot('annee_affectation', 'est_coordinateur');
    }
}