<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class FinancialDonation extends Model {
    protected $fillable = [
        'user_id','amount','payment_method','paymongo_payment_id',
        'paymongo_checkout_url','reference_number','receipt_image_path','message','status',
    ];
    public function user() { return $this->belongsTo(User::class); }
}