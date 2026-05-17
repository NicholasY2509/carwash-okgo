<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\VoucherType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\CreateVoucherTypeRequest;
use App\Http\Requests\UpdateVoucherTypeRequest;

class VoucherTypeController extends Controller
{
    public function index(){
        $voucherTypes = VoucherType::all();

        return Inertia::render('voucher_types/index', [
            'voucherTypes' => $voucherTypes
        ]);
    }

    public function store(CreateVoucherTypeRequest $request){
        DB::beginTransaction();

        try {
            $voucher_type = new VoucherType();
            $voucher_type->name = $request->name;
            $voucher_type->description = $request->description;
            $voucher_type->is_free = $request->is_free;
            $voucher_type->only_one_car = $request->only_one_car == 'on' ? false : true;
            $voucher_type->save();

            DB::commit();

            return redirect()->route('voucher-types.index');
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }

    public function update(UpdateVoucherTypeRequest $request, $id){
        DB::beginTransaction();

        try {
            $voucher_type = VoucherType::find($id);
            $voucher_type->name = $request->name;
            $voucher_type->description = $request->description;
            $voucher_type->is_free = $request->is_free;
            $voucher_type->only_one_car = $request->only_one_car == 'on' ? false : true;
            $voucher_type->save();

            DB::commit();

            return redirect()->route('voucher-types.index');
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }
}
