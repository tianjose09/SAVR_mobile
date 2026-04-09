<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class UserBadge extends Model {
    protected $fillable = ['user_id','badge_id','status','progress','earned_at'];
    protected $casts = ['earned_at'=>'datetime'];
    public function badge() { return $this->belongsTo(Badge::class); }
}