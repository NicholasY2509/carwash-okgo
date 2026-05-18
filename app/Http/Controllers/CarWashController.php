<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\Customer;
use App\Models\Product;
use App\Models\PurchasedPacket;
use App\Models\SalesTransaction;
use App\Models\ServiceRecord;
use App\Models\Stall;
use App\Models\Voucher;
use App\Services\StorageService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Jobs\SendWhatsAppReceiptJob;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class CarWashController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $carWashTransactionTypes = ['Cuci Mobil', 'Cuci Mobil Voucher', 'Klaim Garansi'];
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = SalesTransaction::with([
            'car:id,plate_number,customer_id',
            'car.customer:id,name',
            'staff:id,full_name',
            'serviceRecords.stall:id,name',
            'voucher:id,serial_number,sales_transaction_id'
        ])
            ->whereIn('transaction_type', $carWashTransactionTypes);

        // Add search functionality
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('car.customer', function ($customerQuery) use ($search) {
                    $customerQuery->where('name', 'like', '%' . $search . '%');
                })
                ->orWhereHas('car', function ($carQuery) use ($search) {
                    $carQuery->where('plate_number', 'like', '%' . $search . '%');
                })
                ->orWhereHas('voucher', function ($voucherQuery) use ($search) {
                    $voucherQuery->where('serial_number', 'like', '%' . $search . '%');
                });
            });
        }

        $salesTransactions = $query
            ->orderBy('transaction_date', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $mappedTransactions = $salesTransactions->getCollection()->map(function ($tx) {
            $stallName = $tx->serviceRecords->first()?->stall?->name ?? 'N/A';

            return [
                'id' => $tx->id,
                'car' => [
                    'plate_number' => $tx->car?->plate_number ?? 'N/A',
                    'customer' => [
                        'name' => $tx->car?->customer?->name ?? 'N/A'
                    ]
                ],
                'stall' => [
                    'name' => $stallName
                ],
                'staff' => [
                    'full_name' => $tx->staff?->full_name ?? 'N/A'
                ],
                'total_amount' => $tx->total_amount,
                'service_date' => $tx->transaction_date,
                'payment_type' => $tx->payment_method,
                'status'       => $tx->status,
                'voucher' => $tx->voucher ? [
                    'serial_number' => $tx->voucher->serial_number
                ] : null,
            ];
        });
        $paginated = $salesTransactions->toArray();
        $paginated['data'] = $mappedTransactions->values();

        return Inertia::render('car_wash/index', [
            'service_records' => $paginated
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Only load essential data to prevent large headers
        $products = Product::select(['id', 'name', 'price'])
            ->orderBy('name')
            ->limit(50) // Limit to 50 products max
            ->get();

        $stalls = Stall::select(['id', 'name'])
            ->orderBy('name')
            ->limit(20) // Limit to 20 stalls max
            ->get();

        $carTypes = \App\Models\CarType::select(['id', 'name'])
            ->orderBy('name')
            ->get();

        $staffs = \App\Models\Staff::select(['id', 'full_name'])
            ->orderBy('full_name')
            ->get();

        return Inertia::render('car_wash/create', [
            'products' => $products,
            'stalls' => $stalls,
            'car_types' => $carTypes,
            'staffs' => $staffs
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $product = Product::find($request->product_id);

            if ($request->filled('customer_id')) {
                $customer = Customer::findOrFail($request->customer_id);
            } else {
                $ktpPhotoPath = null;
                if ($request->hasFile('customer_ktp_photo')) {
                    $ktpPhotoPath = StorageService::store($request->file('customer_ktp_photo'), 'customer_ktp_photos');
                }
                $customer = Customer::create([
                    'name' => $request->customer_name ?? 'Walk in ' . $request->car_plate_number,
                    'phone' => $request->customer_phone,
                    'email' => $request->customer_email,
                    'ktp_photo' => $ktpPhotoPath,
                ]);
            }

            if ($request->filled('car_id')) {
                $car = Car::findOrFail($request->car_id);
            } else {
                $carPhotoPath = null;
                if ($request->hasFile('car_photo')) {
                    $carPhotoPath = StorageService::store($request->file('car_photo'), 'car_photos');
                }
                $car = $customer->cars()->create([
                    'plate_number' => $request->car_plate_number,
                    'car_type_id' => $request->car_type_id,
                    'model' => $request->car_model,
                    'color' => $request->car_color,
                    'photo' => $carPhotoPath,
                ]);
            }

            $sales_transaction = SalesTransaction::create([
                'transaction_date' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
                'customer_id' => $customer->id,
                'car_id' => $car->id,
                'staff_id' => Auth::user()->staff?->id ?: (\App\Models\Staff::value('id') ?: 1),
                'total_amount' => $product->price,
                'payment_method' => $request->payment_method,
                'paid_amount' => $request->payment_method === 'Cash' ? ($request->filled('nominal_bayar') ? $request->nominal_bayar : $product->price) : null,
                'change_amount' => $request->payment_method === 'Cash' ? ($request->filled('nominal_bayar') ? $request->nominal_bayar - $product->price : 0) : null,
                'transaction_type' => 'Cuci Mobil',
            ]);

            $services_records = $sales_transaction->serviceRecords()->create([
                'service_date' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
                'car_id' => $car->id,
                'product_id' => $product->id,
                'staff_id' => $request->staff_id ?: (Auth::user()->staff?->id ?: (\App\Models\Staff::value('id') ?: 1)),
                'stall_id' => $request->stall_id ?: (\App\Models\Stall::value('id') ?: 1),
            ]);

            DB::commit();

            $sales_transaction->load(['customer', 'car', 'serviceRecords.product']);

            SendWhatsAppReceiptJob::dispatch($sales_transaction)->afterResponse();

            return redirect()->back()->with('transaction', $sales_transaction);
        } catch (Throwable $th) {
            DB::rollBack();
            Log::error($th);
            report($th);
            return back()->with('error', 'Terjadi kesalahan: ' . $th->getMessage());
        }
    }

    public function voucherPayment(Request $request)
    {
        DB::beginTransaction();

        try {
            $product = Product::find($request->product_id);
            $voucher = Voucher::find($request->voucher_id);

            if ($request->filled('customer_id')) {
                $customer = Customer::findOrFail($request->customer_id);
            } else {
                $ktpPhotoPath = null;
                if ($request->hasFile('customer_ktp_photo')) {
                    $ktpPhotoPath = StorageService::store($request->file('customer_ktp_photo'), 'customer_ktp_photos');
                }
                $customer = Customer::create([
                    'name' => $request->customer_name ?? 'Walk in ' . $voucher->voucherType->name,
                    'phone' => $request->customer_phone ?? null,
                    'email' => $request->customer_email ?? null,
                    'ktp_photo' => $ktpPhotoPath ?? null,
                ]);
            }

            if ($request->filled('car_id')) {
                $car = Car::findOrFail($request->car_id);
            } else {
                $carPhotoPath = null;
                if ($request->hasFile('car_photo')) {
                    $carPhotoPath = StorageService::store($request->file('car_photo'), 'car_photos');
                }
                $car = $customer->cars()->create([
                    'plate_number' => $request->plate_number,
                    'car_type_id' => $request->car_type_id,
                    'model' => $request->car_model,
                    'color' => $request->car_color,
                    'photo' => $carPhotoPath,
                ]);
            }

            $sales_transaction = SalesTransaction::create([
                'transaction_date' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
                'customer_id' => $customer->id,
                'car_id' => $car->id,
                'staff_id' => Auth::user()->staff?->id ?: (\App\Models\Staff::value('id') ?: 1),
                'total_amount' => 0,
                'payment_method' => 'Voucher',
                'transaction_type' => 'Cuci Mobil',
            ]);

            $services_record = $sales_transaction->serviceRecords()->create([
                'service_date' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
                'car_id' => $car->id,
                'product_id' => $product->id,
                'staff_id' => $request->staff_id ?: (Auth::user()->staff?->id ?: (\App\Models\Staff::value('id') ?: 1)),
                'stall_id' => $request->stall_id ?: (\App\Models\Stall::value('id') ?: 1),
            ]);

            $voucher->update([
                'status' => 'Redeemed',
                'purchased_packet_id' => $request->purchased_packet_id,
                'sales_transaction_id' => $sales_transaction->id ?? null,
                'redeemed_at' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
            ]);

            DB::commit();

            $sales_transaction->load(['customer', 'car', 'serviceRecords.product']);

            SendWhatsAppReceiptJob::dispatch($sales_transaction)->afterResponse();

            return redirect()->back()->with('transaction', $sales_transaction);
        } catch (Throwable $th) {
            DB::rollBack();
            Log::error($th);
            report($th);
            return back()->with('error', 'Terjadi kesalahan: ' . $th->getMessage());
        }
    }
    public function returnPayment(Request $request)
    {
        $request->validate([
            'service_record_id' => 'required|integer|exists:service_records,id',
            'stall_id' => 'nullable|integer|exists:stalls,id',
        ]);

        DB::beginTransaction();

        try {
            $original_service_record = ServiceRecord::with('payment')->findOrFail($request->service_record_id);

            $original_transaction = $original_service_record->payment;

            // Update only the warranty_claimed_at field to prevent transaction_date from being modified
            $original_transaction->warranty_claimed_at = Carbon::now('Asia/Jakarta');
            $original_transaction->save();

            $return_transaction = SalesTransaction::create([
                'transaction_date' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
                'customer_id' => $original_transaction->customer_id,
                'car_id' => $original_transaction->car_id,
                'staff_id' => Auth::user()->staff?->id ?: (\App\Models\Staff::value('id') ?: 1),
                'total_amount' => 0,
                'payment_method' => 'Garansi',
                'transaction_type' => 'Klaim Garansi',
            ]);

            $new_service_record = $return_transaction->serviceRecords()->create([
                'service_date' => $return_transaction->transaction_date,
                'car_id' => $original_transaction->car_id,
                'product_id' => $original_service_record->product_id, // Gunakan produk yang sama dengan cuci sebelumnya
                'staff_id' => $request->staff_id ?: (Auth::user()->staff?->id ?: (\App\Models\Staff::value('id') ?: 1)),
                'stall_id' => $request->stall_id ?: (\App\Models\Stall::value('id') ?: 1),
            ]);

            DB::commit();

            $return_transaction->load(['customer', 'car', 'serviceRecords.product']);

            SendWhatsAppReceiptJob::dispatch($return_transaction)->afterResponse();

            return redirect()->back()->with('transaction', $return_transaction);
        } catch (Throwable $th) {
            DB::rollBack();
            Log::error($th);
            report($th);
            return back()->with('error', 'Terjadi kesalahan: ' . $th->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function cancel(string $id)
    {
        DB::beginTransaction();
        try {
            $transaction = SalesTransaction::with('serviceRecords')->findOrFail($id);
            $transaction->update(['status' => 'cancelled']);
            $transaction->serviceRecords()->update(['status' => 'cancelled']);
            DB::commit();
            return back()->with('success', 'Transaksi berhasil dibatalkan.');
        } catch (Throwable $th) {
            DB::rollBack();
            Log::error($th);
            return back()->with('error', 'Gagal membatalkan transaksi: ' . $th->getMessage());
        }
    }

    public function specialProgramPayment(Request $request)
    {
        DB::beginTransaction();

        try {
            $product = Product::findOrFail($request->product_id);
            $program = \App\Models\SpecialProgram::findOrFail($request->special_program_id);

            if ($program->status !== 'active' || $program->expiry_date->isPast()) {
                throw new \Exception('Special Program is not valid.');
            }

            $customer = $program->customer;
            $carId = $request->car_id;

            if (!$program->cars()->where('cars.id', $carId)->exists()) {
                throw new \Exception('Kendaraan yang dipilih tidak terdaftar dalam program ini.');
            }

            $sales_transaction = SalesTransaction::create([
                'transaction_date' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
                'customer_id' => $customer->id,
                'car_id' => $carId,
                'staff_id' => Auth::user()->staff?->id ?: (\App\Models\Staff::value('id') ?: 1),
                'total_amount' => 0,
                'payment_method' => 'Special Program',
                'transaction_type' => 'Cuci Mobil',
            ]);

            $services_record = $sales_transaction->serviceRecords()->create([
                'service_date' => Carbon::now('Asia/Jakarta')->toDateTimeString(),
                'car_id' => $carId,
                'product_id' => $product->id,
                'staff_id' => $request->staff_id ?: (Auth::user()->staff?->id ?: (\App\Models\Staff::value('id') ?: 1)),
                'stall_id' => $request->stall_id ?: (\App\Models\Stall::value('id') ?: 1),
            ]);

            DB::commit();

            $sales_transaction->load(['customer', 'car', 'serviceRecords.product']);

            SendWhatsAppReceiptJob::dispatch($sales_transaction)->afterResponse();

            return redirect()->back()->with('transaction', $sales_transaction);
        } catch (Throwable $th) {
            DB::rollBack();
            Log::error($th);
            report($th);
            return back()->with('error', 'Terjadi kesalahan: ' . $th->getMessage());
        }
    }

    private function getPaymentMethodString(string $paymentType): string
    {
        if (str_contains($paymentType, 'SalesTransaction')) {
            return 'Cash';
        }
        if (str_contains($paymentType, 'Voucher')) {
            return 'Voucher';
        }
        if (str_contains($paymentType, 'ServiceRecord')) {
            return 'Garansi (Return)';
        }
        return 'Tidak Diketahui';
    }
}
