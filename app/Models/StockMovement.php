<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $fillable = [
        'item_id',
        'quantity',
        'resulting_stock',
        'type', // 'purchase', 'adjustment', 'waste', 'service_usage', 'service_cancellation'
        'reason',
        'reference_id',
        'reference_type',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'resulting_stock' => 'integer',
    ];

    /**
     * Get the item.
     */
    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Get the parent reference model (Purchase, ServiceRecord, etc.).
     */
    public function reference()
    {
        return $this->morphTo();
    }
}
