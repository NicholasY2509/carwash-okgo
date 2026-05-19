<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockAdjustmentController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search', '');

        $query = StockMovement::with(['item'])->orderBy('created_at', 'desc');

        if (!empty($search)) {
            $query->whereHas('item', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('sku', 'like', '%' . $search . '%');
            });
        }

        $movements = $query->paginate($perPage)->withQueryString();
        $items = Item::select('id', 'sku', 'name', 'stock')->orderBy('name')->get();

        return Inertia::render('stock_adjustments/index', [
            'movements' => $movements,
            'items' => $items,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:1',
            'type' => 'required|in:addition,subtraction,waste',
            'reason' => 'required|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            $item = Item::lockForUpdate()->findOrFail($validated['item_id']);
            $changeQty = $validated['quantity'];
            $movementType = 'adjustment';
            $reasonPrefix = '';

            if ($validated['type'] === 'addition') {
                $item->stock += $changeQty;
                $netChange = $changeQty;
                $reasonPrefix = '[Penambahan] ';
            } else {
                $item->stock -= $changeQty;
                $netChange = -$changeQty;
                if ($validated['type'] === 'waste') {
                    $movementType = 'waste';
                    $reasonPrefix = '[Pembuangan/Waste] ';
                } else {
                    $reasonPrefix = '[Pengurangan] ';
                }
            }

            // Ensure stock doesn't go below 0 (unless we want to allow negative stock, but it's safer to prevent it)
            if ($item->stock < 0) {
                return back()->with('error', 'Gagal menyesuaikan stok: Stok tidak boleh kurang dari nol.');
            }

            $item->save();

            // Log the movement
            StockMovement::create([
                'item_id' => $item->id,
                'quantity' => $netChange,
                'resulting_stock' => $item->stock,
                'type' => $movementType,
                'reason' => $reasonPrefix . $validated['reason'],
            ]);

            DB::commit();

            return redirect()->route('stock-adjustments.index')->with('success', 'Penyesuaian stok berhasil disimpan.');
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->with('error', 'Gagal memproses penyesuaian stok: ' . $th->getMessage());
        }
    }
}
