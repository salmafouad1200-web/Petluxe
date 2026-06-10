<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'category', // 'food', 'accessories', 'healthcare', 'toys'
        'stock',
        'image',
        'rating',
        'reviews_count',
    ];

    protected $casts = [
        'price' => 'float',
        'stock' => 'integer',
        'rating' => 'float',
        'reviews_count' => 'integer',
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class); // We will define this helper pivot or relation shortly
    }
}
