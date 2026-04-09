<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class FoodDonation extends Model {
    protected $fillable = [
        'user_id','food_items','food_item_images','schedule_type',
        'pickup_address','pickup_lat','pickup_lng','preferred_date','time_slot','status',
    ];
    protected $casts = ['food_items'=>'array','food_item_images'=>'array'];
    public function user() { return $this->belongsTo(User::class); }
}