<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// Dynamically setup class aliases based on MongoDB availability.
// This allows models to run on SQLite or MongoDB without code modification.
if (class_exists(\MongoDB\Laravel\Eloquent\Model::class)) {
    if (!class_exists(\App\Models\ModelBase::class)) {
        class_alias(\MongoDB\Laravel\Eloquent\Model::class, \App\Models\ModelBase::class);
    }
    if (!class_exists(\App\Models\AuthModelBase::class)) {
        class_alias(\MongoDB\Laravel\Auth\User::class, \App\Models\AuthModelBase::class);
    }
} else {
    if (!class_exists(\App\Models\ModelBase::class)) {
        class_alias(\Illuminate\Database\Eloquent\Model::class, \App\Models\ModelBase::class);
    }
    if (!class_exists(\App\Models\AuthModelBase::class)) {
        class_alias(\Illuminate\Foundation\Auth\User::class, \App\Models\AuthModelBase::class);
    }
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        // Disable stateful API to prevent 419 CSRF errors when accessed from SPA
        // $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
