<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesTransactionItem extends Model
{
    protected $fillable = [
        'sales_transaction_id',
        'item_id',
        'quantity',
        'price',
        'subtotal',
    ];

    public function salesTransaction()
    {
        return $this->belongsTo(SalesTransaction::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
