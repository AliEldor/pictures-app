<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    
    public function test_user_can_register()
    {
        $userData = [
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/v0.1/guest/register', $userData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ]);

        $this->assertDatabaseHas('users', [
            'full_name' => 'Test User',
            'email' => 'test@example.com'
        ]);
    }

    
    public function test_user_cannot_register_with_existing_email()
    {
        // Create a user with the email we'll try to duplicate
        User::factory()->create([
            'email' => 'existing@example.com',
            'full_name' => 'Existing User'
        ]);

        $userData = [
            'full_name' => 'New User',
            'email' => 'existing@example.com',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/v0.1/guest/register', $userData);

        //  check status 
        $response->assertStatus(422);

        // Verify the duplicate user wasn't created
        $this->assertDatabaseMissing('users', [
            'full_name' => 'New User',
            'email' => 'existing@example.com'
        ]);
    }

    
    public function test_user_can_login()
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'full_name' => 'Login User',
            'password' => bcrypt('password123')
        ]);

        $loginData = [
            'email' => 'login@example.com',
            'password' => 'password123'
        ];

        $response = $this->postJson('/api/v0.1/guest/login', $loginData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ])
            ->assertJsonStructure([
                'token'
            ]);
    }

    
    public function test_user_cannot_login_with_invalid_credentials()
    {
        User::factory()->create([
            'email' => 'user@example.com',
            'full_name' => 'Valid User',
            'password' => bcrypt('correctpassword')
        ]);

        $loginData = [
            'email' => 'user@example.com',
            'password' => 'wrongpassword'
        ];

        $response = $this->postJson('/api/v0.1/guest/login', $loginData);

        $response->assertStatus(401);
    }

    
    public function test_user_can_logout()
    {
        $user = User::factory()->create([
            'email' => 'logout@example.com',
            'full_name' => 'Logout User',
            'password' => bcrypt('password123')
        ]);

        // Login  to get token
        $loginResponse = $this->postJson('/api/v0.1/guest/login', [
            'email' => 'logout@example.com',
            'password' => 'password123'
        ]);

        $token = $loginResponse->json('token');

        //  test logout
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/v0.1/logout');

        $response->assertStatus(200);
    }

    
    public function test_unauthorized_user_cannot_access_protected_routes()
    {
        $response = $this->postJson('/api/v0.1/logout');
        $response->assertStatus(401);

        $response = $this->getJson('/api/v0.1/user/login-history');
        $response->assertStatus(401);
    }
}