<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    public function index()
    {
        $purchases = Purchase::with(['items.item', 'supplier'])->orderBy('purchase_date', 'desc')->paginate(10);
        $items = Item::select('id', 'sku', 'name', 'price', 'stock')->orderBy('name')->get();
        $suppliers = Supplier::select('id', 'name', 'contact_person')->orderBy('name')->get();

        return Inertia::render('purchases/index', [
            'purchases' => $purchases,
            'items' => $items,
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchase_date' => 'required|date',
            'invoice_number' => 'nullable|string|max:255|unique:purchases,invoice_number',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.cost_price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            // Create purchase header
            $purchase = Purchase::create([
                'purchase_date' => Carbon::parse($validated['purchase_date']),
                'invoice_number' => $validated['invoice_number'] ?? null,
                'supplier_id' => $validated['supplier_id'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'total_amount' => 0, // Will update below
            ]);

            $totalAmount = 0;
            $supplierName = null;
            if ($purchase->supplier_id) {
                $supplierName = Supplier::where('id', $purchase->supplier_id)->value('name');
            }

            foreach ($validated['items'] as $purchaseLine) {
                $subtotal = $purchaseLine['quantity'] * $purchaseLine['cost_price'];
                $totalAmount += $subtotal;

                // Create purchase item detail
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'item_id' => $purchaseLine['item_id'],
                    'quantity' => $purchaseLine['quantity'],
                    'cost_price' => $purchaseLine['cost_price'],
                    'subtotal' => $subtotal,
                ]);

                // Update stock and write movement log
                $item = Item::lockForUpdate()->find($purchaseLine['item_id']);
                if ($item) {
                    $item->stock += $purchaseLine['quantity'];
                    $item->save();

                    $movementReason = "Pembelian stok" . ($supplierName ? " dari " . $supplierName : "") . " (Invoice: " . ($validated['invoice_number'] ?? '-') . ")";

                    StockMovement::create([
                        'item_id' => $item->id,
                        'quantity' => $purchaseLine['quantity'],
                        'resulting_stock' => $item->stock,
                        'type' => 'purchase',
                        'reason' => $movementReason,
                        'reference_id' => $purchase->id,
                        'reference_type' => Purchase::class,
                    ]);
                }
            }

            // Update total amount on purchase header
            $purchase->update([
                'total_amount' => $totalAmount,
            ]);

            DB::commit();

            return redirect()->route('purchases.index')->with('success', 'Pembelian stok berhasil disimpan.');
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->with('error', 'Gagal memproses pembelian: ' . $th->getMessage());
        }
    }
}
