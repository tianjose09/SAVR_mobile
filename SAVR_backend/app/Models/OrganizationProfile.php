<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrganizationProfile extends Model
{
    protected $fillable = [
        'user_id',
        'organization_name',
        'website_url',
        'industry_sector',
        'organization_type',
        'contact_person',
        'position_role',
        'contact_number'
    ];
}