<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class PurchasedPacket extends Model
{
    use HasUuids;

    protected $fillable = [
        'voucher_packet_id',
        'customer_id',
        'car_id',
        'price',
        'purchased_at',
        'expired_at',
        'status',
    ];

    protected $casts = [
        'purchased_at' => 'datetime',
        'expired_at'   => 'datetime',
    ];

    protected static function booted()
    {
        static::created(function ($model) {
            // Clear dashboard cache when new packet is purchased
            $today = Carbon::today()->format('Y-m-d');
            Cache::forget("dashboard_data_{$today}");
        });

        static::updated(function ($model) {
            // Clear dashboard cache when packet is updated
            $today = Carbon::today()->format('Y-m-d');
            Cache::forget("dashboard_data_{$today}");
        });
    }

    public function voucherPacket()
    {
        return $this->belongsTo(VoucherPacket::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    public function salesTransaction()
    {
        return $this->belongsTo(SalesTransaction::class, 'sales_transaction_id');
    }

    public function vouchers()
    {
        return $this->hasMany(Voucher::class, 'purchased_packet_id');
    }

    public function voucherDeltamas()
    {
        return $this->hasOne(VoucherDeltamas::class);
    }
}
