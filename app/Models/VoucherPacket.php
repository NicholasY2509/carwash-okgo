<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VoucherPacket extends Model
{
    use SoftDeletes;

    public function voucherType()
    {
        return $this->belongsTo(VoucherType::class);
    }
}
