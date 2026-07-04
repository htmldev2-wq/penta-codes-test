<?php

use Illuminate\Support\Facades\Route;

// This app is a pure API backend — the site itself is a separate static
// frontend (deployed to Vercel) that calls POST /api/leads (see routes/api.php).
Route::get('/', fn () => response()->json([
    'service' => 'Pentacodes API',
    'status' => 'ok',
]));
