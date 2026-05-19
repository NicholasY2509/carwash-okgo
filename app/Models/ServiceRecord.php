<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Item;
use App\Models\StockMovement;


class ServiceRecord extends Model
{
    protected $fillable = [
        'service_date',
        'car_id',
        'stall_id',
        'product_id',
        'price',
        'staff_id',
        'payment_id',
        'payment_type',
        'status',
    ];

    protected $casts = [
        'service_date' => 'datetime',
    ];

    protected static function booted()
    {
        static::created(function ($serviceRecord) {
            $serviceRecord->deductInventory();
        });

        static::updated(function ($serviceRecord) {
            if ($serviceRecord->isDirty('status') && $serviceRecord->status === 'cancelled') {
                $serviceRecord->restoreInventory();
            }
        });
    }

    /**
     * Deduct items inventory included in this service (product) or selected manually.
     */
    public function deductInventory()
    {
        if (!$this->product_id) {
            return;
        }

        \Illuminate\Support\Facades\DB::transaction(function () {
            $product = $this->product()->with('items')->first();
            if (!$product) {
                return;
            }

            // Check if the request contains specific selected items
            $hasSelectedItems = request()->has('selected_items');
            $selectedItemIds = request()->input('selected_items', []);
            if (!is_array($selectedItemIds)) {
                $selectedItemIds = [];
            }

            $boundItemIds = $product->items->pluck('id')->toArray();

            // 1. Deduct standard bound items if selected (or deduct all if request doesn't specify selected_items)
            foreach ($product->items as $item) {
                if ($hasSelectedItems && !in_array($item->id, $selectedItemIds)) {
                    continue;
                }

                $qtyToDeduct = $item->pivot->quantity;

                $dbItem = Item::lockForUpdate()->find($item->id);
                if ($dbItem) {
                    $dbItem->stock -= $qtyToDeduct;
                    $dbItem->save();

                    StockMovement::create([
                        'item_id' => $dbItem->id,
                        'quantity' => -$qtyToDeduct,
                        'resulting_stock' => $dbItem->stock,
                        'type' => 'service_usage',
                        'reason' => "Digunakan dalam layanan cuci: " . $product->name . " (Nopol: " . ($this->car?->plate_number ?? 'N/A') . ")",
                        'reference_id' => $this->id,
                        'reference_type' => self::class,
                    ]);
                }
            }

            // 2. Deduct manually selected items that are NOT bound to the service by default
            if ($hasSelectedItems) {
                foreach ($selectedItemIds as $selectedId) {
                    if (!in_array($selectedId, $boundItemIds)) {
                        $dbItem = Item::lockForUpdate()->find($selectedId);
                        if ($dbItem) {
                            $dbItem->stock -= 1; // Default 1 unit for manual add-on items
                            $dbItem->save();

                            StockMovement::create([
                                'item_id' => $dbItem->id,
                                'quantity' => -1,
                                'resulting_stock' => $dbItem->stock,
                                'type' => 'service_usage',
                                'reason' => "Barang tambahan (add-on) digunakan dalam cuci: " . $product->name . " (Nopol: " . ($this->car?->plate_number ?? 'N/A') . ")",
                                'reference_id' => $this->id,
                                'reference_type' => self::class,
                            ]);
                        }
                    }
                }
            }
        });
    }

    /**
     * Restore items inventory if the service is cancelled.
     */
    public function restoreInventory()
    {
        \Illuminate\Support\Facades\DB::transaction(function () {
            // Find all service_usage movements registered for this specific service record
            $movements = StockMovement::where('reference_type', self::class)
                ->where('reference_id', $this->id)
                ->where('type', 'service_usage')
                ->get();

            foreach ($movements as $movement) {
                $dbItem = Item::lockForUpdate()->find($movement->item_id);
                if ($dbItem) {
                    $qtyToRestore = abs($movement->quantity);
                    $dbItem->stock += $qtyToRestore;
                    $dbItem->save();

                    StockMovement::create([
                        'item_id' => $dbItem->id,
                        'quantity' => $qtyToRestore,
                        'resulting_stock' => $dbItem->stock,
                        'type' => 'service_cancellation',
                        'reason' => "Pengembalian stok karena pembatalan layanan cuci (Mutasi ID: " . $movement->id . ")",
                        'reference_id' => $this->id,
                        'reference_type' => self::class,
                    ]);
                }
            }
        });
    }

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

