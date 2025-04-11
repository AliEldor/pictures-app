<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LoginHistory extends Model
{
    use HasFactory;

    protected $table = 'login_history';

    protected $fillable = [
        'user_id',
        'ip_address',
        'geolocation'
    ];

    protected $casts = [
        'geolocation' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
