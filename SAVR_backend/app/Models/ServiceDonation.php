<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ServiceDonation extends Model {
    protected $fillable = [
        'user_id','service_type','quantity','frequency','service_date',
        'service_time','address','contact_first_name','contact_last_name',
        'contact_email','description','status',
    ];
    public function user() { return $this->belongsTo(User::class); }
}