<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceRecord extends Model
{
    protected $fillable = [
        'service_date',
        'car_id',
        'stall_id',
        'product_id',
        'staff_id',
        'payment_id',
        'payment_type',
        'status',
    ];

    protected $casts = [
        'service_date' => 'datetime',
    ];

    public function payment(){
        return $this->morphTo();
    }

    public function car(){
        return $this->belongsTo(Car::class);
    }

    public function returnWashPairFor(){
        return $this->morphMany(ServiceRecord::class, 'payment');
    }

    public function stall(){
        return $this->belongsTo(Stall::class);
    }

    public function product(){
        return $this->belongsTo(Product::class);
    }

    public function staff(){
        return $this->belongsTo(Staff::class);
    }
}
