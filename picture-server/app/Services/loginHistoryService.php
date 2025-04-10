<?php
namespace App\Services;
use App\Models\LoginHistory;

class LoginHistoryService
{
    public static function store($data)
    {
        try {
            $loginHistory = LoginHistory::create([
                'user_id' => $data["user_id"],
                'ip_address' => $data["ip_address"],
                'geolocation' => json_encode([
                    'latitude' => $data["latitude"],
                    'longitude' => $data["longitude"]
                ])
            ]);
            
            return [
                "success" => true,
                "data" => $loginHistory
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    public static function getUserHistory($userId)
    {
        try {
            $loginHistory = LoginHistory::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();
                
            return [
                "success" => true,
                "data" => $loginHistory
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}