<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Badge extends Model {
    protected $fillable = ['key','name','description','goal_type','goal_value','icon'];
}