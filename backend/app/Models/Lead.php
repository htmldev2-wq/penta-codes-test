<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    protected $fillable = [
        'form_id',
        'source_page',
        'name',
        'email',
        'phone',
        'website',
        'message',
        'user_agent',
    ];
}
