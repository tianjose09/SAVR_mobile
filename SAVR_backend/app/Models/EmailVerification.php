<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailVerification extends Model
{
    protected $fillable = [
        'email',
        'code',
        'expires_at',
        'used',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used'       => 'boolean',
    ];

    public function isExpired(): bool
    {
        return now()->isAfter($this->expires_at);
    }

    public function isValid(string $code): bool
    {
        return !$this->used
            && !$this->isExpired()
            && $this->code === $code;
    }
}