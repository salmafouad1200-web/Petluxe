<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'user_id',
        'content',
        'media',
        'media_type', // 'image', 'video', 'none'
        'likes', // Array of user_ids who liked this post: [1, 5, 12]
        'likes_count',
        'comments_count',
    ];

    protected $casts = [
        'likes' => 'array',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
