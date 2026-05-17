<?php

namespace App\Http\Controllers;

use App\Exports\VouchersReportExport;
use App\Http\Requests\CreateVoucherRequest;
use App\Models\Car;
use App\Models\Customer;
use App\Models\PurchasedPacket;
use App\Models\Voucher;
use App\Models\VoucherType;
use App\Services\StorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        $voucherTypes = VoucherType::all();
        $perPage = $request->input('per_page', 10);
        $voucherTypeFilter = $request->input('voucher_type', '');
        $statusFilter = $request->input('status', '');
        $search = $request->input('search', '');

        $query = Voucher::with(['voucherType', 'purchasedPacket:id,expired_at']);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('serial_number', 'like', '%' . $search . '%')
                  ->orWhere('sales_code', 'like', '%' . $search . '%');
            });
        }

        if (!empty($voucherTypeFilter) && $voucherTypeFilter !== 'all') {
            $query->where('voucher_type_id', $voucherTypeFilter);
        }

        if (!empty($statusFilter) && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $vouchers = $query
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('voucher/index', [
            'vouchers' => $vouchers,
            'voucherTypes' => $voucherTypes
        ]);
    }

    public function store(CreateVoucherRequest $request)
    {
        DB::beginTransaction();

        try {
            if($request->voucher_type === "regular") {
                foreach ($request->serial_number as $item) {
                    $voucher = new Voucher();
                    $voucher->serial_number = $item;
                    $voucher->sales_code = $request->sales_code;
                    $voucher->voucher_type_id = $request->voucher_type_id;
                    $voucher->expired_at = $request->expired_at;
                    $voucher->save();
                }
            } elseif($request->voucher_type === "special") {
                if ($request->filled('customer_id')) {
                    $customer = Customer::findOrFail($request->input('customer_id'));
                } else {
                    $ktpPhotoPath = null;
                    if ($request->hasFile('customer_ktp_photo')) {
                        $ktpPhotoPath = StorageService::store($request->file('customer_ktp_photo'), 'customer_ktp_photos');
                    }
                    $customer = Customer::create([
                        'name' => $request->input('customer_name'),
                        'phone' => $request->input('customer_phone'),
                        'email' => $request->input('customer_email'),
                        'ktp_photo' => $ktpPhotoPath,
                    ]);
                }
                $purchasedPacket = PurchasedPacket::create([
                    'customer_id' => $customer->id,
                    'purchased_at' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
                    'expired_at' => $request->expiration_date,
                ]);

                foreach ($request->serial_number as $item) {
                    $voucher = new Voucher();
                    $voucher->serial_number = $item;
                    $voucher->sales_code = $request->sales_code;
                    $voucher->voucher_type_id = $request->voucher_type_id;
                    $voucher->purchased_packet_id = $purchasedPacket->id;
                    $voucher->save();
                }
            }
            DB::commit();
            return redirect()->route('vouchers.index');
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }

    public function checkValidity(Request $request)
    {
        $request->validate([
            'serial_number' => 'required|string',
            'plate_number'  => 'nullable|string',
        ]);

        $voucher = Voucher::with(['voucherType', 'purchasedPacket.voucherPacket', 'purchasedPacket.car', 'purchasedPacket.customer'])
            ->where('serial_number', $request->serial_number)
            ->first();

        if (!$voucher) {
            return response()->json(['message' => 'Nomor Seri Tidak Ditemukan.'], 404);
        }

        $responseData = [
            'foundVoucher' => [
                'id'            => $voucher->id,
                'serial_number' => $voucher->serial_number,
                'status'        => $voucher->status,
                'voucher_type'  => [
                    'id'   => $voucher->voucher_type_id,
                    'name' => $voucher->voucherType->name,
                ],
                'expired_at'       => $voucher->expired_at ? $voucher->expired_at->format('Y-m-d') : null,
                'purchased_packet' => null,
            ]
        ];

        $assignOnSale = $voucher->purchasedPacket && $voucher->purchasedPacket->voucherPacket
            ? $voucher->purchasedPacket->voucherPacket->assign_on_sale
            : false;

        $activePacket = null;

        if ($assignOnSale) {
            if ($voucher->purchased_packet_id && $voucher->purchasedPacket) {
                $packet = $voucher->purchasedPacket;
                $activePacket = $packet;
                $responseData['foundVoucher']['purchased_packet'] = [
                    'id'           => $packet->id,
                    'name'         => $packet->voucherPacket?->name ?? 'N/A',
                    'purchased_at' => $packet->purchased_at->format('d F Y'),
                    'expired_at'   => $packet->expired_at ? $packet->expired_at->format('d F Y') : '-',
                    'car'          => $packet->car ? [
                        'id'           => $packet->car_id,
                        'plate_number' => $packet->car->plate_number,
                    ] : null,
                    'customer'     => $packet->customer ? [
                        'id'   => $packet->customer_id,
                        'name' => $packet->customer->name,
                    ] : null,
                ];
            }
        } else {
            if($voucher->purchased_packet_id) {
                $packet = $voucher->purchasedPacket;
                $activePacket = $packet;

                $responseData['foundVoucher']['purchased_packet'] = [
                    'id'           => $packet->id,
                    'name'         => $packet->voucherPacket?->name ?? 'N/A',
                    'purchased_at' => $packet->purchased_at->format('d F Y'),
                    'expired_at'   => $packet->expired_at ? $packet->expired_at->format('d F Y') : '-',
                    'car'          => $packet->car ? [
                        'id'           => $packet->car_id,
                        'plate_number' => $packet->car->plate_number,
                    ] : null,
                    'customer'     => $packet->customer ? [
                        'id'   => $packet->customer_id,
                        'name' => $packet->customer->name,
                    ] : null,
                ];
            } elseif ($request->filled('plate_number')) {
                $car = Car::where('plate_number', $request->plate_number)->first();
                if ($car) {
                    $packet = PurchasedPacket::with(['voucherPacket', 'car', 'customer'])
                        ->where('car_id', $car->id)
                        ->whereHas('voucherPacket', function ($query) use ($voucher) {
                            $query->where('voucher_type_id', $voucher->voucher_type_id);
                        })
                        ->latest('purchased_at')
                        ->first();
                    if ($packet) {
                        $activePacket = $packet;
                        $responseData['foundVoucher']['purchased_packet'] = [
                            'id'           => $packet->id,
                            'name'         => $packet->voucherPacket->name,
                            'purchased_at' => $packet->purchased_at->format('d F Y'),
                            'expired_at'   => $packet->expired_at ? $packet->expired_at->format('d F Y') : '-',
                            'car'          => $packet->car ? [
                                'id'           => $packet->car_id,
                                'plate_number' => $packet->car->plate_number,
                            ] : null,
                            'customer'     => $packet->customer ? [
                                'id'   => $packet->customer_id,
                                'name' => $packet->customer->name,
                            ] : null,
                        ];
                    }
                }
            }
        }

        $isExpired = false;
        $expiryDate = $activePacket ? $activePacket->expired_at : $voucher->expired_at;
        
        if ($expiryDate && now()->startOfDay()->gt($expiryDate->startOfDay())) {
            $isExpired = true;
        }

        $responseData['foundVoucher']['is_expired'] = $isExpired;

        return response()->json($responseData, 200);
    }

    public function getAvailableVouchers(Request $request)
    {
        $request->validate([
            'voucher_type_id' => 'required|integer|exists:voucher_types,id',
        ]);

        $vouchers = Voucher::where('status', 'Active')
            ->where('voucher_type_id', $request->voucher_type_id)
            ->get();

        return response()->json($vouchers, 200);
    }

    public function batchUpdate(Request $request)
    {
        $request->validate([
            'serial_numbers' => 'required|array',
            'serial_numbers.*' => 'string',
            'voucher_type_id' => 'nullable|exists:voucher_types,id',
            'status' => 'nullable|string',
        ]);

        $serialNumbers = $request->input('serial_numbers');
        $voucherTypeId = $request->input('voucher_type_id');
        $status = $request->input('status');

        if (empty($voucherTypeId) && empty($status)) {
            return response()->json(['serial_numbers' => 'Tidak ada perubahan yang diberikan.'], 422);
        }

        $vouchers = Voucher::whereIn('serial_number', $serialNumbers)->get();
        if ($vouchers->isEmpty()) {
            return response()->json(['serial_numbers' => 'Voucher tidak ditemukan.'], 404);
        }

        if ($status) {
            foreach ($vouchers as $voucher) {
                if ($voucher->status === 'Redeemed' && $status !== 'Redeemed') {
                    $errorMsg = "Voucher dengan nomor seri {$voucher->serial_number} sudah Redeemed dan tidak bisa diubah ke status lain.";
                    if ($request->expectsJson() || $request->ajax()) {
                        return response()->json(['status' => $errorMsg], 422);
                    } else {
                        return redirect()->back()->withErrors(['status' => $errorMsg]);
                    }
                }
                if ($voucher->status !== 'Redeemed' && $status === 'Redeemed') {
                } elseif ($voucher->status === 'Redeemed' && $status === 'Redeemed') {
                } elseif ($voucher->status !== 'Redeemed' && $status !== 'Redeemed') {
                } else {
                }
            }
        }

        \DB::beginTransaction();
        try {
            foreach ($vouchers as $voucher) {
                $updateData = [];
                if ($voucherTypeId) {
                    $updateData['voucher_type_id'] = (int) $voucherTypeId;
                }
                if ($status) {
                    if ($voucher->status !== 'Redeemed' && $status === 'Redeemed') {
                        $updateData['status'] = $status;
                        $updateData['redeemed_at'] = now();
                    } elseif ($voucher->status !== 'Redeemed' && $status !== 'Redeemed') {
                        $updateData['status'] = $status;
                        $updateData['redeemed_at'] = null;
                    }
                }
                if (!empty($updateData)) {
                    \Log::info('Updating voucher', [
                        'serial' => $voucher->serial_number,
                        'updateData' => $updateData,
                        'voucherTypeId' => $voucherTypeId,
                    ]);
                    $voucher->update($updateData);
                }
            }
            \DB::commit();
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('success', 'Voucher berhasil diperbarui.');
            } elseif ($request->expectsJson() || $request->ajax()) {
                return response()->json(['updated' => $vouchers->count()], 200);
            } else {
                return redirect()->route('vouchers.index')->with('success', 'Voucher berhasil diperbarui.');
            }
        } catch (\Throwable $e) {
            \DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateExpiration(Request $request)
    {
        $request->validate([
            'voucher_ids'  => 'required|array|min:1',
            'voucher_ids.*'=> 'integer|exists:vouchers,id',
            'expired_at'   => 'required|date',
        ]);

        DB::beginTransaction();
        try {
            Voucher::whereIn('id', $request->voucher_ids)
                ->update(['expired_at' => $request->expired_at]);
            DB::commit();
            return back()->with('success', 'Tanggal kadaluarsa voucher berhasil diperbarui.');
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function searchJson(Request $request)
    {
        $search       = $request->input('search', '');
        $voucherType  = $request->input('voucher_type', '');
        $perPage      = (int) $request->input('per_page', 50);

        $query = Voucher::with(['voucherType:id,name', 'purchasedPacket:id,expired_at'])
            ->select('id', 'serial_number', 'status', 'expired_at', 'voucher_type_id', 'purchased_packet_id');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('serial_number', 'like', '%' . $search . '%')
                  ->orWhere('sales_code', 'like', '%' . $search . '%');
            });
        }

        if (!empty($voucherType) && $voucherType !== 'all') {
            $query->where('voucher_type_id', $voucherType);
        }

        $vouchers = $query->orderBy('serial_number')->limit($perPage)->get();

        return response()->json($vouchers);
    }

    public function show()
    {
        $serials = Voucher::pluck('serial_number');
        return response()->json($serials);
    }

    public function getAllSerialNumbers()
    {
        $serials = Voucher::pluck('serial_number');
        return response()->json($serials);
    }

    public function generateReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'voucher_type' => 'required'
        ]);

        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = Carbon::parse($request->end_date)->endOfDay();
        $voucher_type = $request->voucher_type;

        return Excel::download(new VouchersReportExport($startDate, $endDate, $voucher_type), 'vouchers-report.xlsx');
    }
}
