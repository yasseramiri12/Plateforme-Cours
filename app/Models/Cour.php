<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cour extends Model
{
    use HasFactory;

    protected $table = 'cours'; // Laravel chercherait 'cours' (pluriel) par défaut, mais bon de préciser
    protected $primaryKey = 'id_cours';

    protected $fillable = [
        'titre',
        'description',
        'fichier_url',
        'type_document',
        'date_creation',
        'est_publie',
        'est_valide',
    ];

    /**
     * Relation N:N avec Groupe (Table pivot: diffusion)
     * Définit à qui le cours est montré
     */
    public function groupes()
    {
        return $this->belongsToMany(Groupe::class, 'diffusion', 'id_cours', 'id_groupe')
                    ->withPivot('date_ouverture', 'date_fermeture');
    }
}
