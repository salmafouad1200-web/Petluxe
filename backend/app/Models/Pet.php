<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pet extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'species',
        'breed',
        'age',
        'weight',
        'sex',
        'vaccines',
        'photo',
        'medical_history',
        'documents',
    ];

    protected $casts = [
        'vaccines' => 'array',
        'medical_history' => 'array',
        'documents' => 'array',
        'age' => 'integer',
        'weight' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
