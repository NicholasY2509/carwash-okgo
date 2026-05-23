<?php

namespace App\Http\Controllers;

use App\Exports\CustomerExport;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class CustomerController extends Controller
{
    public function index(Request $request){
        $query = Customer::with('cars');
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }
        $customers = $query->paginate($request->per_page ?? 10);
        return Inertia::render('customers/index', [
            'customers' => $customers
        ]);
    }

    public function show(Request $request, String $id){
        $customer = Customer::with('cars.carType')->findOrFail($id);
        
        $salesTransactionsQuery = $customer->salesTransactions()->with('staff')->latest();
        
        if ($request->filled('start_date')) {
            $salesTransactionsQuery->whereDate('transaction_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $salesTransactionsQuery->whereDate('transaction_date', '<=', $request->end_date);
        }
        
        $salesTransactions = $salesTransactionsQuery->paginate($request->per_page ?? 10)->withQueryString();

        return Inertia::render('customers/show',[
            'customer' => $customer,
            'salesTransactions' => $salesTransactions,
            'filters' => $request->only(['start_date', 'end_date'])
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->input('query');

        if (!$query) {
            return response()->json([]);
        }

        $customers = Customer::where('name', 'LIKE', "%{$query}%")
            ->with('cars')
            ->limit(10)
            ->get();

        return response()->json($customers);
    }

    public function verifyEditPassword(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $setting = \App\Models\Setting::where('key', 'customer_edit_password')->first();

        if (!$setting || empty($setting->value)) {
            return response()->json(['message' => 'Password not set by administrator.'], 403);
        }

        if (!\Illuminate\Support\Facades\Hash::check($request->password, $setting->value)) {
            return response()->json([
                'errors' => [
                    'password' => ['Password yang diberikan salah.']
                ]
            ], 422);
        }

        return response()->json(['message' => 'Password verified.']);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        $customer->update($validated);

        return back()->with('success', 'Customer updated successfully.');
    }

    public function export()
    {
        $filename = 'customers_' . now()->format('Ymd_His') . '.xlsx';
        return Excel::download(new CustomerExport(), $filename);
    }
}
