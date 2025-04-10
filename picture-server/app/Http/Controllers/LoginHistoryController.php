<?php
namespace App\Http\Controllers;
use App\Http\Requests\LoginHistoryRequest;
use App\Services\LoginHistoryService;
use Illuminate\Support\Facades\Auth;

class LoginHistoryController extends Controller
{
    function store(LoginHistoryRequest $request)
    {
        $validated = $request->validated();
        
        if (!isset($validated['user_id'])) {
            $validated['user_id'] = Auth::id();
        }
        
        $response = LoginHistoryService::store($validated);
        if (isset($response['error'])) {
            return $this->errorResponse($response, 422);
        }
        return $this->successResponse($response, 201);
    }
    
    function getUserHistory()
    {
        $userId = Auth::id();
        $response = LoginHistoryService::getUserHistory($userId);
        if (isset($response['error'])) {
            return $this->errorResponse($response, 500);
        }
        return $this->successResponse($response, 200);
    }
}