<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $table = 'modules';
    protected $primaryKey = 'id_module';

    protected $fillable = [
        'nom_module',
        'code_module',
        'credits_ects',
    ];

    /**
     * Relation N:N avec Filiere (Table pivot: programme)
     */
    public function filieres()
    {
        return $this->belongsToMany(Filiere::class, 'programme', 'id_module', 'id_filiere')
                    ->withPivot('semestre', 'coefficient');
    }

    /**
     * Relation N:N avec Professeur (Table pivot: enseigner)
     */
    public function professeurs()
    {
        return $this->belongsToMany(Professeur::class, 'enseigner', 'id_prof', 'id_module')
                    ->withPivot('annee_affectation', 'est_coordinateur');
    }
}