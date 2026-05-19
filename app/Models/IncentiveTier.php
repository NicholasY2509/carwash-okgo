<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncentiveTier extends Model
{
    use HasFactory;

    protected $table = 'incentive_tiers';

    protected $fillable = [
        'name',
        'min_cars',
        'max_cars',
        'commission',
    ];

    protected $casts = [
        'min_cars' => 'integer',
        'max_cars' => 'integer',
        'commission' => 'integer',
    ];
}
