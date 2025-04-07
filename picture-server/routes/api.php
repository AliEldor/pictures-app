<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// API Routes with versioning
Route::group(["prefix" => "v0.1"], function(){

    // Authenticated Routes
    Route::group(["middleware" => "auth:api"], function(){
        
        // User Routes
        Route::group(["prefix" => "user"], function(){
     
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