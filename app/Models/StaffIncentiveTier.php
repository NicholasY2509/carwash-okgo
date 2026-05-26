<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StaffIncentiveTier extends Model
{
    protected $fillable = [
        'name',
        'min_cars',
        'max_cars',
        'flat_amount',
    ];
}
