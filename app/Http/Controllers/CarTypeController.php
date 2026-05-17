<?php

namespace App\Http\Controllers;

use App\Models\CarType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CarTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $query = CarType::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        $carTypes = $query->orderBy('name')
                          ->paginate($perPage)
                          ->withQueryString();

        return Inertia::render('car_types/index', [
            'carTypes' => $carTypes,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:car_types,name',
            'description' => 'nullable|string|max:1000',
        ]);

        CarType::create($validated);

        return redirect()->back()->with('success', 'Tipe mobil berhasil ditambahkan!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CarType $carType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:car_types,name,' . $carType->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $carType->update($validated);

        return redirect()->back()->with('success', 'Tipe mobil berhasil diperbarui!');
    }

    /**
     * Remove the specified resource in storage.
     */
    public function destroy(CarType $carType)
    {
        $carType->delete();

        return redirect()->back()->with('success', 'Tipe mobil berhasil dihapus!');
    }
}
