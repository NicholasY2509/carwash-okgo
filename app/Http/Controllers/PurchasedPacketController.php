<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreatePurchasedPackageRequest;
use App\Models\Car;
use App\Models\Customer;
use App\Models\PurchasedPacket;
use App\Models\SalesTransaction;
use App\Models\Voucher;
use App\Models\VoucherPacket;
use App\Services\StorageService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class PurchasedPacketController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = SalesTransaction::with([
            'customer:id,name',
            'car:id,plate_number',
            'staff:id,full_name',
            'purchasedPackets.voucherPacket:id,name,price',
            'purchasedPackets.customer:id,name',
            'purchasedPackets.car:id,plate_number',
            'purchasedPackets.vouchers',
        ])
        ->where('transaction_type', 'Paket Voucher')
        ->when($request->filled('staff_id'), function ($q) use ($request) {
            $q->where('staff_id', $request->staff_id);
        });

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($customerQuery) use ($search) {
                    $customerQuery->where('name', 'like', '%' . $search . '%');
                })
                ->orWhereHas('car', function ($carQuery) use ($search) {
                    $carQuery->where('plate_number', 'like', '%' . $search . '%');
                })
                ->orWhereHas('purchasedPackets.vouchers', function ($voucherQuery) use ($search) {
                    $voucherQuery->where('serial_number', 'like', '%' . $search . '%');
                });
            });
        }

        $salesTransactions = $query
            ->orderBy('transaction_date', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        if ($salesTransactions->count() > 0) {
            $firstTransaction = $salesTransactions->first();
            if ($firstTransaction->purchasedPackets->count() > 0) {
                $firstPacket = $firstTransaction->purchasedPackets->first();
                \Log::info('First packet vouchers:', [
                    'packet_id' => $firstPacket->id,
                    'vouchers_count' => $firstPacket->vouchers->count(),
                    'vouchers' => $firstPacket->vouchers->toArray(),
                    'packet_loaded' => $firstPacket->relationLoaded('vouchers'),
                    'voucher_packet_id' => $firstPacket->voucher_packet_id
                ]);
                
                // Also check if vouchers exist in database
                $vouchersInDb = \App\Models\Voucher::where('purchased_packet_id', $firstPacket->id)->get();
                \Log::info('Vouchers in database for this packet:', [
                    'count' => $vouchersInDb->count(),
                    'vouchers' => $vouchersInDb->toArray()
                ]);
            }
        }

        $staffList = \App\Models\Staff::where('work_position_id', 2)->get(['id', 'full_name as name']);

        return Inertia::render('purchased_packets/index', [
            'salesTransactions' => $salesTransactions,
            'staffList' => $staffList,
            'filters' => [
                'staff_id' => $request->input('staff_id'),
                'search' => $search,
            ]
        ]);
    }

    public function create()
    {
        $voucherPackets = VoucherPacket::select(['id', 'name', 'price', 'quantity', 'voucher_type_id', 'assign_on_sale', 'until_year_end', 'valid_period_months'])
            ->with(['voucherType:id,name,only_one_car'])
            ->orderBy('name')
            ->limit(30)
            ->get();

        return Inertia::render('purchased_packets/create', [
            'voucherPackets' => $voucherPackets
        ]);
    }

    /**
     * Store a newly created purchased packet in storage.
     *
     * @param  \App\Http\Requests\CreatePurchasedPackageRequest  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(CreatePurchasedPackageRequest $request)
    {
        DB::beginTransaction();

        try {
            $voucher_packet = VoucherPacket::with('voucherType')->findOrFail($request->input('voucher_packet_id'));
            $onlyOneCar = $voucher_packet->voucherType->only_one_car ?? true;
            $quantity = (int) $request->input('quantity', 1);

            if ($request->filled('customer_id')) {
                $customer = Customer::findOrFail($request->input('customer_id'));
            } else {
                $customer = Customer::create([
                    'name' => $request->input('customer_name') ?? 'Walk in ' . $voucher_packet->name,
                    'phone' => $request->input('customer_phone'),
                ]);
            }

            $car = null;

            $purchasedPackets = [];
            $voucherIds = $request->voucher_ids ?? [];
            $vouchersPerPacket = $voucher_packet->quantity;

            $autogeneratePrefix = $voucher_packet->voucherType->voucher_suffix ?? 'VOUCHER-';
            $lastNumber = 0;
            
            if ($voucher_packet->autogenerate_vouchers) {
                $latestVoucher = Voucher::where('serial_number', 'like', $autogeneratePrefix . '%')
                    ->orderByRaw('LENGTH(serial_number) DESC')
                    ->orderBy('serial_number', 'desc')
                    ->first();
                if ($latestVoucher) {
                    $lastNumberStr = str_replace($autogeneratePrefix, '', $latestVoucher->serial_number);
                    if (is_numeric($lastNumberStr)) {
                        $lastNumber = (int) $lastNumberStr;
                    }
                }
            }

            for ($i = 0; $i < $quantity; $i++) {
                $purchased_packet = PurchasedPacket::create([
                    'customer_id' => $customer->id,
                    'car_id' => $car?->id,
                    'voucher_packet_id' => $voucher_packet->id,
                    'price' => $voucher_packet->price,
                    'purchased_at' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
                    'expired_at' => $voucher_packet->expired_date
                        ? Carbon::parse($voucher_packet->expired_date)->endOfDay()->toDateTimeString()
                        : ($voucher_packet->until_year_end
                            ? Carbon::now('Asia/Jakarta')->endOfYear()->toDateTimeString()
                            : Carbon::now('Asia/Jakarta')->addMonths($voucher_packet->valid_period_months)->toDateTimeString()),
                ]);
                $purchasedPackets[] = $purchased_packet;
                
                if ($voucher_packet->autogenerate_vouchers) {
                    for ($j = 0; $j < $vouchersPerPacket; $j++) {
                        $lastNumber++;
                        $serialNumber = $autogeneratePrefix . str_pad($lastNumber, 4, '0', STR_PAD_LEFT);
                        
                        while(Voucher::where('serial_number', $serialNumber)->exists()) {
                            $lastNumber++;
                            $serialNumber = $autogeneratePrefix . str_pad($lastNumber, 4, '0', STR_PAD_LEFT);
                        }
                        
                        Voucher::create([
                            'serial_number' => $serialNumber,
                            'voucher_type_id' => $voucher_packet->voucher_type_id,
                            'status' => 'Sold',
                            'purchased_packet_id' => $purchased_packet->id,
                        ]);
                    }
                } elseif ($voucher_packet->assign_on_sale) {
                    $start = $i * $vouchersPerPacket;
                    $packetVoucherIds = array_slice($voucherIds, $start, $vouchersPerPacket);

                    foreach ($packetVoucherIds as $voucher_id) {
                        $voucher = Voucher::findOrFail($voucher_id);
                        $voucher->status = "Sold";
                        $voucher->purchased_packet_id = $purchased_packet->id;
                        $voucher->save();
                    }
                }
            }
            $totalPrice = $voucher_packet->price * $quantity;
            $sales_transaction = SalesTransaction::create([
                'transaction_date' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
                'customer_id' => $customer->id,
                'car_id' => $car?->id,
                'staff_id' => Auth::user()->staff?->id ?: (\App\Models\Staff::value('id') ?: 1),
                'total_amount' => $totalPrice,
                'payment_method' => $request->input('payment_method'),
                'paid_amount' => $request->input('payment_method') === 'Cash' ? $request->input('nominal_pembayaran') : null,
                'change_amount' => $request->input('payment_method') === 'Cash' ? $request->input('nominal_pembayaran') - $totalPrice : null,
                'transaction_type' => 'Paket Voucher',
                'status' => $request->input('payment_method') === 'QRIS' ? 'pending' : 'completed',
            ]);

            foreach ($purchasedPackets as $packet) {
                $packet->sales_transaction_id = $sales_transaction->id;
                $packet->save();
            }

            DB::commit();

            $sales_transaction->load(['customer', 'car', 'purchasedPackets.voucherPacket', 'purchasedPackets.vouchers:id,serial_number']);

            $midtransResponse = null;
            if ($request->input('payment_method') === 'QRIS') {
                $itemsDetails = [
                    [
                        'id' => 'pack_' . $voucher_packet->id,
                        'price' => (float)$voucher_packet->price,
                        'quantity' => $quantity,
                        'name' => substr($voucher_packet->name, 0, 50)
                    ]
                ];

                $customerDetails = [
                    'first_name' => substr($customer->name, 0, 50),
                    'phone' => $customer->phone,
                ];

                $midtransResponse = \App\Services\MidtransService::generateQris(
                    'VP-' . $sales_transaction->id . '-' . time(),
                    (float)$totalPrice,
                    $itemsDetails,
                    $customerDetails
                );
            }

            if ($request->input('payment_method') !== 'QRIS') {
                \App\Jobs\SendWhatsAppReceiptJob::dispatch($sales_transaction)->afterResponse();
            }

            if ($midtransResponse) {
                return redirect()->back()->with('transaction', $sales_transaction)->with('midtrans', $midtransResponse);
            }

            return redirect()->back()->with('transaction', $sales_transaction);
        } catch (Throwable $th) {
            DB::rollBack();
            Log::error($th);
            report($th);
            return back()->with('error', 'Terjadi kesalahan: ' . $th->getMessage());
        }
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'expired_at' => 'required|date',
        ]);

        try {
            $purchasedPacket = PurchasedPacket::findOrFail($id);
            $purchasedPacket->expired_at = Carbon::parse($request->expired_at)->endOfDay();
            $purchasedPacket->save();

            return back()->with('success', 'Tanggal kedaluwarsa berhasil diperbarui.');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal memperbarui tanggal kedaluwarsa: ' . $e->getMessage());
        }
    }

    public function cancel(string $id)
    {
        DB::beginTransaction();
        try {
            $transaction = SalesTransaction::with('purchasedPackets')->findOrFail($id);
            $transaction->update(['status' => 'cancelled']);
            $transaction->purchasedPackets()->update(['status' => 'cancelled']);
            DB::commit();
            return back()->with('success', 'Transaksi berhasil dibatalkan.');
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th);
            return back()->with('error', 'Gagal membatalkan transaksi: ' . $th->getMessage());
        }
    }
}
