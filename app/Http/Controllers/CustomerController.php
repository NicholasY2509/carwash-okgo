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

    public function show(String $id){
        $customer = Customer::with('cars', 'salesTransactions.staff')->find($id);

        return Inertia::render('customers/show',[
            'customer' => $customer
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

    public function export()
    {
        $filename = 'customers_' . now()->format('Ymd_His') . '.xlsx';
        return Excel::download(new CustomerExport(), $filename);
    }
}
