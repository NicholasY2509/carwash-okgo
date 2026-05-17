<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Car extends Model
{
    use HasUuids;

    protected $fillable = [
        'customer_id',
        'car_type_id',
        'plate_number',
        'model',
        'color',
        'photo',
    ];

    public function customer(){
        return $this->belongsTo(Customer::class);
    }

    public function carType()
    {
        return $this->belongsTo(CarType::class);
    }

    public function salesTransactions(){
        return $this->hasMany(SalesTransaction::class);
    }

    public function specialPrograms()
    {
        return $this->belongsToMany(SpecialProgram::class, 'special_program_cars');
    }
}
