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
        if (!$response['success']) {
            return $this->errorResponse($response['error'], 401);
        }
        return $this->successResponse($response);
    }
    
    function register(RegisterRequest $request)
    {
        $response = AuthService::register($request->validated());
        if (!$response['success']) {
            return $this->errorResponse($response['error'], 400);
        }
        return $this->successResponse($response);
    }
    
    function logout()
    {
        $response = AuthService::logout();
        if (!$response['success']) {
            return $this->errorResponse($response['error'], 500);
        }
        return $this->successResponse(['message' => 'Successfully logged out']);
    }
}