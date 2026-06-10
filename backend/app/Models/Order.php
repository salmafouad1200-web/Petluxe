<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'items', // Array of items: [['product_id' => 1, 'name' => 'Kibble', 'price' => 29.99, 'quantity' => 2]]
        'total_price',
        'status', // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
        'shipping_address',
        'phone',
        'payment_method', // 'card', 'paypal', 'cash'
        'payment_status', // 'pending', 'paid', 'failed'
    ];

    protected $casts = [
        'items' => 'array',
        'total_price' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
