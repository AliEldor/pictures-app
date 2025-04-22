<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginHistoryTest extends TestCase
{
    use RefreshDatabase;
    
    protected $user;
    protected $token;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test user
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'full_name' => 'Test User',
            'password' => bcrypt('password123')
        ]);
        
        // Get token by logging in
        $loginResponse = $this->postJson('/api/v0.1/guest/login', [
            'email' => 'test@example.com',
            'password' => 'password123'
        ]);
        
        $this->token = $loginResponse->json('token');
    }

    
    public function test_can_store_login_history()
    {
        $loginDetails = [
            'user_id' => $this->user->id,
            'ip_address' => '192.168.1.1',
            'latitude' => 40.7128,
            'longitude' => -74.0060,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/v0.1/user/login-history', $loginDetails);

        $response->assertStatus(200)
            ->assertJson([
                'id' => 1,
                'user_id' => $this->user->id,
                'ip_address' => '192.168.1.1'
            ]);

        $this->assertDatabaseHas('login_history', [
            'user_id' => $this->user->id,
            'ip_address' => '192.168.1.1',
        ]);
    }

    
    public function test_unauthorized_user_cannot_store_login_history()
    {
        $loginDetails = [
            'user_id' => $this->user->id,
            'ip_address' => '192.168.1.1',
            'latitude' => 40.7128,
            'longitude' => -74.0060,
        ];

        // No authorization header
        $response = $this->postJson('/api/v0.1/user/login-history', $loginDetails);

        $response->assertStatus(401);

        $this->assertDatabaseMissing('login_history', [
            'user_id' => $this->user->id,
            'ip_address' => '192.168.1.1',
        ]);
    }

   
    public function test_login_history_validation()
    {
        // Missing required fields
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/v0.1/user/login-history', [
            'user_id' => $this->user->id,
            // Missing ip address, latitude, longitude
        ]);

        $response->assertStatus(422);
        
        // Invalid ip address
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/v0.1/user/login-history', [
            'user_id' => $this->user->id,
            'ip_address' => 'not-an-ip-address',
            'latitude' => 40.7128,
            'longitude' => -74.0060,
        ]);

        $response->assertStatus(422);
        
        // Invalid latitude value 
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/v0.1/user/login-history', [
            'user_id' => $this->user->id,
            'ip_address' => '192.168.1.1',
            'latitude' => 100.0,
            'longitude' => -74.0060,
        ]);

        $response->assertStatus(422);
    }

    
    public function test_user_can_retrieve_login_history()
    {
        // First, create some login history entries
        $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/v0.1/user/login-history', [
            'user_id' => $this->user->id,
            'ip_address' => '192.168.1.1',
            'latitude' => 40.7128,
            'longitude' => -74.0060,
        ]);

        $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/v0.1/user/login-history', [
            'user_id' => $this->user->id,
            'ip_address' => '192.168.1.2',
            'latitude' => 34.0522,
            'longitude' => -118.2437,
        ]);

        // get the login history
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/v0.1/user/login-history');

        $response->assertStatus(200)
                ->assertJsonCount(2);
    }
}