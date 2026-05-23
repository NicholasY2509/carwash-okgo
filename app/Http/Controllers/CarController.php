<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CarController extends Controller
{
    public function index(Request $request)
    {
        $query = Car::with(['customer', 'carType']);
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('plate_number', 'like', "%$search%")
                  ->orWhere('model', 'like', "%$search%")
                  ->orWhere('color', 'like', "%$search%")
                  ->orWhereHas('customer', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%$search%");
                  });
            });
        }
        $cars = $query->paginate($request->per_page ?? 10);
        return Inertia::render('cars/index', [
            'cars' => $cars
        ]);
    }

    public function show(Request $request, string $id)
    {
        $car = Car::with(['customer', 'carType'])->findOrFail($id);
        
        $salesTransactionsQuery = $car->salesTransactions()->with('staff')->latest();
        
        if ($request->filled('start_date')) {
            $salesTransactionsQuery->whereDate('transaction_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $salesTransactionsQuery->whereDate('transaction_date', '<=', $request->end_date);
        }
        
        $salesTransactions = $salesTransactionsQuery->paginate($request->per_page ?? 10)->withQueryString();

        $carTypes = \App\Models\CarType::all();

        return Inertia::render('cars/show', [
            'car' => $car,
            'salesTransactions' => $salesTransactions,
            'carTypes' => $carTypes,
            'filters' => $request->only(['start_date', 'end_date'])
        ]);
    }

    public function search(Request $request)
    {
        $plate = $request->input('plate');
        if (!$plate) {
            return response()->json([]);
        }
        $cars = Car::with('customer', 'carType')
            ->where('plate_number', 'LIKE', '%' . strtoupper($plate) . '%')
            ->limit(10)
            ->get();

        $results = $cars->map(function ($car) {
            return [
                'car' => [
                    'id' => $car->id,
                    'plate_number' => $car->plate_number,
                    'model' => $car->model,
                    'color' => $car->color,
                    'photo' => $car->photo,
                    'car_type' => $car->carType ? [
                        'id' => $car->carType->id,
                        'name' => $car->carType->name,
                    ] : null,
                ],
                'customer' => $car->customer ? [
                    'id' => $car->customer->id,
                    'name' => $car->customer->name,
                    'phone' => $car->customer->phone,
                    'email' => $car->customer->email,
                    'cars' => $car->customer->cars->map(function ($c) {
                        return [
                            'id' => $c->id,
                            'plate_number' => $c->plate_number,
                            'model' => $c->model,
                            'color' => $c->color,
                            'photo' => $c->photo,
                        ];
                    }),
                ] : null,
            ];
        });

        return response()->json($results);
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

    public function update(Request $request, Car $car)
    {
        $validated = $request->validate([
            'plate_number' => ['required', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
            'car_type_id' => ['nullable', 'exists:car_types,id'],
        ]);

        $car->update($validated);

        return back()->with('success', 'Car updated successfully.');
    }
}
