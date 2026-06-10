<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $posts = Post::with(['user', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:1000',
            'media' => 'nullable|file|max:10240', // 10MB limit for image/video
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $mediaUrl = null;
        $mediaType = 'none';

        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $mime = $file->getMimeType();
            $path = $file->store('posts', 'public');
            $mediaUrl = asset('storage/' . $path);

            if (str_contains($mime, 'video')) {
                $mediaType = 'video';
            } else {
                $mediaType = 'image';
            }
        }

        $post = Post::create([
            'user_id' => $request->user()->id,
            'content' => $request->content,
            'media' => $mediaUrl,
            'media_type' => $mediaType,
            'likes' => [],
            'likes_count' => 0,
            'comments_count' => 0,
        ]);

        // Load the relationship for returning
        $post->load('user');

        return response()->json($post, 201);
    }

    public function like(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        $userId = $request->user()->id;

        $likes = $post->likes ?? [];
        
        if (in_array($userId, $likes)) {
            // Unlike: remove from array
            $likes = array_diff($likes, [$userId]);
            $post->likes_count = max(0, $post->likes_count - 1);
        } else {
            // Like: add to array
            $likes[] = $userId;
            $post->likes_count += 1;

            // Notify post owner if it's someone else
            if ($post->user_id !== $userId) {
                Notification::create([
                    'user_id' => $post->user_id,
                    'title' => 'Nouveau Like !',
                    'content' => $request->user()->name . ' a aimé votre publication.',
                    'type' => 'community',
                    'is_read' => false,
                    'data' => ['post_id' => $post->id]
                ]);
            }
        }

        // Re-index array values for JSON serialization
        $post->likes = array_values($likes);
        $post->save();

        return response()->json([
            'likes_count' => $post->likes_count,
            'likes' => $post->likes
        ]);
    }

    public function addComment(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $comment = Comment::create([
            'post_id' => $post->id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        $post->comments_count += 1;
        $post->save();

        // Notify post owner
        if ($post->user_id !== $request->user()->id) {
            Notification::create([
                'user_id' => $post->user_id,
                'title' => 'Nouveau Commentaire',
                'content' => $request->user()->name . ' a commenté votre publication.',
                'type' => 'community',
                'is_read' => false,
                'data' => ['post_id' => $post->id]
            ]);
        }

        $comment->load('user');

        return response()->json($comment, 201);
    }

    public function destroy(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        if ($request->user()->id !== $post->user_id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Publication supprimée.']);
    }
}
