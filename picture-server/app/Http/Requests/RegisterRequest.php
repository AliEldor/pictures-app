<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:3',
        ];
    }


    public function messages():array{
        return [
            "full_name.required" => "Your name is required!",
            "email.required" => "Your email is required!",
            "password.required" => "Password is needed!",
        ];
    }

    public function attributes(): array{
        return [
            "full_name" => "Full Name",
            "email" => "Email Address"
        ];
    }
}
