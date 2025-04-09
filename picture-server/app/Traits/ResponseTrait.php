<?php

namespace App\Traits;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

trait ResponseTrait{
    public function successResponse($data, $code=200){
        return response()->json([
            "success" => true,
            "payload" => $data 
        ], $code);
    }
 
    public function errorResponse($error, $code){
        return response()->json([
            "success" => false,
            "error" => $error 
        ], $code);
    }

    public function failedValidation(Validator $validator){
        throw new HttpResponseException (response()->json([
            "result" => $validator->errors(),
            "success" => false
        ]));
    }
}
