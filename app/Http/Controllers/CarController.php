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

    public function show(string $id)
    {
        $car = Car::with(['customer', 'carType', 'salesTransactions.staff'])->find($id);

        return Inertia::render('cars/show', [
            'car' => $car
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
}
