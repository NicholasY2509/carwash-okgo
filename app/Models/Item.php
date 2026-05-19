<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $fillable = [
        'sku',
        'name',
        'description',
        'stock',
        'price',
    ];

    protected $casts = [
        'stock' => 'integer',
        'price' => 'decimal:2',
    ];

    /**
     * The products (services) that this item belongs to.
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'item_product')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    /**
     * Get the stock movements for this item.
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Get the purchase items for this item.
     */
    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class);
    }
}
