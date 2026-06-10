<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Analysis extends Model
{
    protected $fillable = [
        'user_id',
        'pet_id',
        'photo',
        'animal_type',
        'breed',
        'confidence',
        'age_estimation',
        'weight_estimation',
        'personality_traits',
        'behavior_analysis',
        'health_observations',
        'nutrition_recommendations',
    ];

    protected $casts = [
        'confidence' => 'float',
        'personality_traits' => 'array',
        'behavior_analysis' => 'array',
        'health_observations' => 'array',
        'nutrition_recommendations' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }
}
