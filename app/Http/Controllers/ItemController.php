<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $items = Item::with('products')->orderBy('name')->paginate(10);
        $products = Product::select('id', 'name', 'price')->orderBy('name')->get();

        return Inertia::render('items/index', [
            'items' => $items,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sku' => 'nullable|string|unique:items,sku',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'services' => 'nullable|array',
            'services.*.id' => 'required|exists:products,id',
            'services.*.quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            $initialStock = $validated['stock'] ?? 0;

            $item = Item::create([
                'sku' => $validated['sku'] ?? null,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'stock' => $initialStock,
            ]);

            // If there's initial stock, log it in stock movements
            if ($initialStock > 0) {
                StockMovement::create([
                    'item_id' => $item->id,
                    'quantity' => $initialStock,
                    'resulting_stock' => $initialStock,
                    'type' => 'adjustment',
                    'reason' => 'Stok awal barang',
                ]);
            }

            // Sync services with pivot quantity
            if (!empty($validated['services'])) {
                $syncData = [];
                foreach ($validated['services'] as $svc) {
                    $syncData[$svc['id']] = ['quantity' => $svc['quantity']];
                }
                $item->products()->sync($syncData);
            }

            DB::commit();

            return redirect()->route('items.index')->with('success', 'Barang berhasil ditambahkan.');
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->with('error', 'Gagal menambahkan barang: ' . $th->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $item = Item::findOrFail($id);

        $validated = $request->validate([
            'sku' => 'nullable|string|unique:items,sku,' . $item->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'services' => 'nullable|array',
            'services.*.id' => 'required|exists:products,id',
            'services.*.quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();

        try {
            $item->update([
                'sku' => $validated['sku'] ?? null,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
            ]);

            // Sync services with pivot quantity
            $syncData = [];
            if (!empty($validated['services'])) {
                foreach ($validated['services'] as $svc) {
                    $syncData[$svc['id']] = ['quantity' => $svc['quantity']];
                }
            }
            $item->products()->sync($syncData);

            DB::commit();

            return redirect()->route('items.index')->with('success', 'Barang berhasil diupdate.');
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->with('error', 'Gagal mengupdate barang: ' . $th->getMessage());
        }
    }

    public function destroy($id)
    {
        $item = Item::findOrFail($id);

        DB::beginTransaction();
        try {
            $item->delete();
            DB::commit();
            return redirect()->route('items.index')->with('success', 'Barang berhasil dihapus.');
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->with('error', 'Gagal menghapus barang: ' . $th->getMessage());
        }
    }
}
