<?php
namespace App\Http\Controllers;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Services\AuthService;

class AuthController extends Controller
{
    function login(LoginRequest $request)
    {
        $response = AuthService::login($request->validated());
        if (isset($response['error'])) {
            return response()->json([
                'success' => false,
                'error' => $response['error']
            ], 401);
        }
        
        
        return response()->json([
            'success' => true,
            'user' => $response['user'],
            'token' => $response['token']
        ], 200);
    }
    
    function register(RegisterRequest $request)
    {
        $response = AuthService::register($request->validated());
        if (isset($response['error'])) {
            return response()->json([
                'success' => false,
                'error' => $response['error']
            ], 422);
        }
        
        return response()->json([
            'success' => true
        ], 201);
    }
    
    function logout()
    {
        $response = AuthService::logout();
        if (isset($response['error'])) {
            return response()->json([
                'success' => false,
                'error' => $response['error']
            ], 500);
        }
        
        return response()->json([
            'success' => true,
            'message' => $response['message']
        ], 200);
    }
}