<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductSplit;
use App\Models\Party;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with('splits.party')->get();
        $parties = Party::orderBy('name')->get();

        return Inertia::render('products/index', [
            'products' => $products,
            'parties' => $parties,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'is_split_profits' => 'boolean',
            'splits' => 'required_if:is_split_profits,true|array',
            'splits.*.party_id' => 'required_with:splits|exists:parties,id',
            'splits.*.percentage' => 'required_with:splits|numeric|min:0|max:100',
        ]);

        if ($request->input('is_split_profits')) {
            $splits = $request->input('splits', []);
            $totalPercentage = array_sum(array_column($splits, 'percentage'));
            if (abs($totalPercentage - 100.0) > 0.01) {
                return redirect()->back()->withErrors([
                    'splits' => 'Total persentase bagi hasil harus berjumlah tepat 100% (saat ini ' . $totalPercentage . '%).'
                ])->withInput();
            }
        }

        DB::beginTransaction();

        try {
            $product = Product::create([
                'name' => $request->name,
                'price' => $request->price,
                'description' => $request->description,
                'is_active' => $request->boolean('is_active', true),
                'is_split_profits' => (bool)$request->is_split_profits,
            ]);

            if ($request->input('is_split_profits')) {
                foreach ($request->input('splits') as $split) {
                    ProductSplit::create([
                        'product_id' => $product->id,
                        'party_id' => $split['party_id'],
                        'percentage' => $split['percentage'],
                    ]);
                }
            }

            DB::commit();

            Cache::forget('products_list');

            return redirect()->route('products.index');
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }

    public function update(Request $request, String $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'is_split_profits' => 'boolean',
            'splits' => 'required_if:is_split_profits,true|array',
            'splits.*.party_id' => 'required_with:splits|exists:parties,id',
            'splits.*.percentage' => 'required_with:splits|numeric|min:0|max:100',
        ]);

        if ($request->input('is_split_profits')) {
            $splits = $request->input('splits', []);
            $totalPercentage = array_sum(array_column($splits, 'percentage'));
            if (abs($totalPercentage - 100.0) > 0.01) {
                return redirect()->back()->withErrors([
                    'splits' => 'Total persentase bagi hasil harus berjumlah tepat 100% (saat ini ' . $totalPercentage . '%).'
                ])->withInput();
            }
        }

        DB::beginTransaction();

        try {
            $product = Product::findOrFail($id);
            $product->update([
                'name' => $request->name,
                'price' => $request->price,
                'description' => $request->description,
                'is_active' => $request->boolean('is_active', true),
                'is_split_profits' => (bool)$request->is_split_profits,
            ]);

            // Always delete existing splits first
            ProductSplit::where('product_id', $product->id)->delete();

            if ($request->input('is_split_profits')) {
                foreach ($request->input('splits') as $split) {
                    ProductSplit::create([
                        'product_id' => $product->id,
                        'party_id' => $split['party_id'],
                        'percentage' => $split['percentage'],
                    ]);
                }
            }

            DB::commit();

            Cache::forget('products_list');

            return redirect()->route('products.index');
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }

    public function destroy(String $id)
    {
        DB::beginTransaction();

        try {
            $product = Product::findOrFail($id);
            $product->delete();

            DB::commit();

            Cache::forget('products_list');

            return redirect()->route('products.index');
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }
}
