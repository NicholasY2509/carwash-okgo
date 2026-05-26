<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CashierIncentiveTier extends Model
{
    protected $fillable = [
        'name',
        'min_packets',
        'max_packets',
        'commission_per_packet',
    ];
}
