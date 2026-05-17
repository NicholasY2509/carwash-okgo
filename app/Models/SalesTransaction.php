<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class SalesTransaction extends Model
{
    protected $fillable = [
        'purchased_packet_id',
        'staff_id',
        'car_id',
        'customer_id',
        'transaction_date',
        'total_amount',
        'payment_method',
        'paid_amount',
        'change_amount',
        'transaction_type',
        'warranty_claimed_at',
        'status',
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
    ];

    protected static function booted()
    {
        static::created(function ($model) {
            // Clear dashboard cache when new transaction is created
            $today = Carbon::today()->format('Y-m-d');
            Cache::forget("dashboard_data_{$today}");
        });

        static::updated(function ($model) {
            // Clear dashboard cache when transaction is updated
            $today = Carbon::today()->format('Y-m-d');
            Cache::forget("dashboard_data_{$today}");
        });
    }

    public function scopeCarWash($query)
    {
        return $query->where('transaction_type', 'Cuci Mobil');
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function serviceRecords()
    {
        return $this->morphMany(ServiceRecord::class, 'payment');
    }

    public function purchasedPackets()
    {
        return $this->hasMany(PurchasedPacket::class, 'sales_transaction_id');
    }

    public function voucher()
    {
        return $this->hasOne(Voucher::class);
    }
}
