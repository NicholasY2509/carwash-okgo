<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::all();

        return Inertia::render('products/index', [
            'products' => $products
        ]);
    }

    public function store(CreateProductRequest $request)
    {
        DB::beginTransaction();

        try {
            $product = Product::create([
                'name' => $request->name,
                'price' => $request->price,
                'description' => $request->description,
            ]);

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
        DB::beginTransaction();

        try {
            $product = Product::find($id);
            $product->update([
                'name' => $request->name,
                'price' => $request->price,
                'description' => $request->description,
            ]);

            DB::commit();

            Cache::forget('products_list');

            return redirect()->route('products.index');
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }
}
