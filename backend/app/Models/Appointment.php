<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = [
        'user_id',
        'veterinarian_id',
        'pet_id',
        'date',
        'time',
        'status', // 'pending', 'confirmed', 'completed', 'cancelled'
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function veterinarian()
    {
        return $this->belongsTo(Veterinarian::class);
    }

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }
}
