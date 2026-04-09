<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartnerKitchenProfile extends Model
{
    protected $fillable = [
        'user_id',
        'kitchen_name',
        'website_url',
        'contact_person',
        'position_role',
        'contact_number'
    ];
}