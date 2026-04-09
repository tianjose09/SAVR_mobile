<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonorProfile extends Model
{
    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'middle_initial',
        'suffix',
        'date_of_birth',
        'gender',
        'house_no',
        'street',
        'barangay',
        'city_municipality',
        'province_region',
        'postal_zip_code',
        'contact_number',
    ];
}