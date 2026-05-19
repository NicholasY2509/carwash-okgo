<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductSplit extends Model
{
    protected $fillable = [
        'product_id',
        'party_id',
        'percentage',
    ];

    protected $casts = [
        'percentage' => 'float',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function party()
    {
        return $this->belongsTo(Party::class);
    }
}
