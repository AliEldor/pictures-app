<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "message" => "Missing Fields",
                "errors" => $validator->errors()
            ], 422);
        }

        $credentials = [
            "email" => $request["email"],
            "password" => $request["password"]
        ];

        if (!Auth::attempt($credentials)) {
            return response()->json([
                "success" => false,
                "error" => "Unauthorized"
            ], 401);
        }

        $user = Auth::user();
        $token = JWTAuth::fromUser($user);
        $user->token = $token;

        return response()->json([
            "success" => true,
            "user" => $user
        ]);
    }

    function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "errors" => $validator->errors()
            ], 422);
        }

        $user = new User;
        $user->full_name = $request["full_name"];
        $user->email = $request["email"];
        $user->password = bcrypt($request["password"]);
        $user->save();

        return response()->json([
            "success" => true
        ]);
    }

    function logout()
    {
        Auth::logout();
        
        return response()->json([
            "success" => true,
            "message" => "Successfully logged out"
        ]);
    }
}