<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'status',
        'amount',
        'payment_method',
        'reference_number',
        'receipt_path',
        'receipt_image_path',
        'message',
        'food_items',
        'food_item_images',
        'service_type',
        'quantity',
        'frequency',
        'service_date',
        'service_time',
        'address',
        'contact_first_name',
        'contact_last_name',
        'contact_email',
        'description',
        'schedule_type',
        'pickup_address',
        'preferred_date',
        'time_slot',
    ];

    protected $casts = [
        'food_items'       => 'array',
        'food_item_images' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}