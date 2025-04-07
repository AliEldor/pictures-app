<?php

namespace App\Http\Controllers;

use App\Models\LoginHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class LoginHistoryController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        
        // create login history record
        $loginHistory = LoginHistory::create([
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'geolocation' => json_encode([
                'latitude' => $request->latitude,
                'longitude' => $request->longitude
            ])
        ]);
        
        return response()->json([
            'success' => true,
            'data' => $loginHistory
        ]);
    }


    // get login history for authenticated user
    public function getUserHistory()
    {
        $user = Auth::user();
        $loginHistory = LoginHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $loginHistory
        ]);
    }
}
