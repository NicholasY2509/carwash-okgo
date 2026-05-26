<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateVoucherPacketRequest;
use App\Models\VoucherPacket;
use App\Models\VoucherType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VoucherPacketController extends Controller
{
    public function index(){
        $voucherPackets = VoucherPacket::with('voucherType')->get();
        $voucherTypes = VoucherType::all();

        return Inertia::render('voucher_packets/index', [
            'voucherPackets' => $voucherPackets,
            'voucherTypes' => $voucherTypes
        ]);
    }

    public function store(CreateVoucherPacketRequest $request){
        DB::beginTransaction();

        try {
            $voucher_packet = new VoucherPacket();
            $voucher_packet->name = $request->name;
            $voucher_packet->price = $request->price;
            $voucher_packet->quantity = $request->quantity;
            $voucher_packet->valid_period_months = $request->valid_period_months;
            $voucher_packet->has_unlimited_issuance = $request->has_unlimited_issuance;
            $voucher_packet->assign_on_sale = $request->assign_on_sale;
            $voucher_packet->until_year_end = $request->until_year_end;
            $voucher_packet->autogenerate_vouchers = $request->autogenerate_vouchers;
            $voucher_packet->expired_date = $request->expired_date;
            $voucher_packet->voucher_type_id = $request->voucher_type_id;
            $voucher_packet->description = $request->description;
            $voucher_packet->save();

            DB::commit();

            return redirect()->route('voucher-packets.index');
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }


    public function update(Request $request, String $id){
        DB::beginTransaction();
        try {
             $voucher_packet = VoucherPacket::with('voucherType')->findOrFail($id);
             $voucher_packet->name = $request->name;
             $voucher_packet->price = $request->price;
             $voucher_packet->quantity = $request->quantity;
             $voucher_packet->valid_period_months = $request->valid_period_months;
             $voucher_packet->has_unlimited_issuance = $request->has_unlimited_issuance;
             $voucher_packet->assign_on_sale = $request->assign_on_sale;
             $voucher_packet->until_year_end = $request->until_year_end;
             $voucher_packet->autogenerate_vouchers = $request->autogenerate_vouchers;
             $voucher_packet->expired_date = $request->expired_date;
             $voucher_packet->voucher_type_id = $request->voucher_type_id;
             $voucher_packet->description = $request->description;
             $voucher_packet->save();

             DB::commit();

             return redirect()->route('voucher-packets.index');
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }

    }
}
