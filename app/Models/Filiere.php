<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Filiere extends Model
{
    use HasFactory;

    protected $table = 'filieres';
    protected $primaryKey = 'id_filiere';

    protected $fillable = [
        'nom_filiere',
        'description',
        'responsable_id',
    ];

    /**
     * Relation 1:N (Une filière a plusieurs groupes)
     */
    public function groupes()
    {
        return $this->hasMany(Groupe::class, 'id_filiere', 'id_filiere');
    }

    /**
     * Relation N:N avec Module (Table pivot: programme)
     */
    public function modules()
    {
        return $this->belongsToMany(Module::class, 'programme', 'id_filiere', 'id_module')
                    ->withPivot('semestre', 'coefficient');
    }
}