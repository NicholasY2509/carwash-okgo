<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'is_split_profits',
    ];

    protected $casts = [
        'is_split_profits' => 'boolean',
    ];

    /**
     * The items (Barang) included in this service product.
     */
    public function items()
    {
        return $this->belongsToMany(Item::class, 'item_product')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    /**
     * The split profit configuration.
     */
    public function splits()
    {
        return $this->hasMany(ProductSplit::class);
    }
}

