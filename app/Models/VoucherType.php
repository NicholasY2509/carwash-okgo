<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VoucherType extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'name',
        'is_free',
        'description',
        'only_one_car',
        'voucher_suffix',
    ];

    protected $casts = [
        'only_one_car' => 'boolean',
    ];
}
