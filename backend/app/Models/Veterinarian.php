<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Veterinarian extends Model
{
    protected $fillable = [
        'user_id',
        'clinic_name',
        'specialty',
        'address',
        'city',
        'phone',
        'latitude',
        'longitude',
        'rating',
        'reviews_count',
        'consultation_price',
        'is_emergency_available',
        'offers_online_consultation',
        'experience_years',
        'availabilities', // JSON representation of weekly slots
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'rating' => 'float',
        'reviews_count' => 'integer',
        'consultation_price' => 'decimal:2',
        'is_emergency_available' => 'boolean',
        'offers_online_consultation' => 'boolean',
        'experience_years' => 'integer',
        'availabilities' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
