<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LoginHistoryController;

// API Routes with versioning
Route::group(["prefix" => "v0.1"], function(){

    // Authenticated Routes
    Route::group(["middleware" => "auth:api"], function(){
        
        // User Routes
        Route::group(["prefix" => "user"], function(){

            // Add Login History routes
            Route::post('/login-history', [LoginHistoryController::class, "store"]);
            Route::get('/login-history', [LoginHistoryController::class, "getUserHistory"]);
     
            });
        

        // Common Routes
        Route::post('/logout', [AuthController::class, "logout"]);
    });

    // Unauthenticated Routes
    Route::group(["prefix" => "guest"], function(){
        Route::post('/login', [AuthController::class, "login"]);
        Route::post('/register', [AuthController::class, "register"]);
    });
});