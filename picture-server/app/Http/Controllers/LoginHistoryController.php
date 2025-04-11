<?php
namespace App\Http\Controllers;
use App\Http\Requests\LoginHistoryRequest;
use App\Services\LoginHistoryService;
use Illuminate\Support\Facades\Auth;

class LoginHistoryController extends Controller
{
    function store(LoginHistoryRequest $request)
    {
        $response = LoginHistoryService::store($request->validated());
        if (!$response['success']) {
            return $this->errorResponse($response['error'], 400);
        }
        return $this->successResponse($response['data']);
    }
    
    function getUserHistory()
    {
        $userId = Auth::id();
        $response = LoginHistoryService::getUserHistory($userId);
        if (!$response['success']) {
            return $this->errorResponse($response['error'], 500);
        }
        return $this->successResponse($response['data']);
    }
}