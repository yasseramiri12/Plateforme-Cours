<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Groupe extends Model
{
    use HasFactory;

    protected $table = 'groupes';
    protected $primaryKey = 'id_groupe';

    protected $fillable = [
        'nom_groupe',
        'annee_scolaire',
        'capacite_max',
        'id_filiere', // Clé étrangère
    ];

    /**
     * Relation 1:N Inverse (Un groupe appartient à une filière)
     */
    public function filiere()
    {
        return $this->belongsTo(Filiere::class, 'id_filiere', 'id_filiere');
    }

    /**
     * Relation 1:N (Un groupe contient plusieurs étudiants)
     */
    public function etudiants()
    {
        return $this->hasMany(Etudiant::class, 'id_groupe', 'id_groupe');
    }

    /**
     * Relation N:N avec Cours (Table pivot: diffusion)
     * Permet de voir les cours accessibles à ce groupe
     */
    public function cours()
    {
        return $this->belongsToMany(Cour::class, 'diffusion', 'id_groupe', 'id_cours')
                    ->withPivot('date_ouverture', 'date_fermeture');
    }
}
