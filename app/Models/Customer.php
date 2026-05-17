<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'email', 'phone', 'ktp_photo'];

    public function cars(){
        return $this->hasMany(Car::class);
    }

    public function salesTransactions(){
        return $this->hasMany(SalesTransaction::class);
    }
}
