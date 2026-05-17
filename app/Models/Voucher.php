<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = [
        'serial_number',
        'status',
        'purchased_packet_id',
        'sales_transaction_id',
        'redeemed_at',
        'expired_at',
        'voucher_type_id',
    ];

    protected $casts = [
        'redeemed_at' => 'date',
        'expired_at'  => 'date',
    ];

    public function voucherType()
    {
        return $this->belongsTo(VoucherType::class);
    }

    public function serviceRecords()
    {
        return $this->morphMany(ServiceRecord::class, 'payment');
    }

    public function purchasedPacket()
    {
        return $this->belongsTo(PurchasedPacket::class);
    }

    public function salesTransactionByDate()
    {
        return $this->belongsTo(SalesTransaction::class, 'updated_at', 'transaction_date');
    }

    public function salesTransaction()
    {
        return $this->belongsTo(SalesTransaction::class);
    }

    public function voucherIssuancesVouchers()
    {
        return $this->hasMany(VoucherIssuanceVoucher::class);
    }
}
