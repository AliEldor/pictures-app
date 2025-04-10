<?php
namespace App\Services;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthService
{
    public static function login($userData)
    {
        try {
            $credentials = [
                "email" => $userData["email"],
                "password" => $userData["password"]
            ];
            
            if (!Auth::attempt($credentials)) {
                return [
                    "success" => false,
                    "error" => "Unauthorized"
                ];
            }
            
            $user = Auth::user();
            $token = JWTAuth::fromUser($user);
            
            return [
                "success" => true,
                "user" => $user,
                "token" => $token
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    public static function register($userData)
    {
        try {
            $user = new \App\Models\User;
            $user->full_name = $userData["full_name"];
            $user->email = $userData["email"];
            $user->password = bcrypt($userData["password"]);
            $user->save();
            
            return [
                "success" => true,
                "user" => $user
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    public static function logout()
    {
        try {
            Auth::logout();
            
            return [
                "success" => true,
                "message" => "Successfully logged out"
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}