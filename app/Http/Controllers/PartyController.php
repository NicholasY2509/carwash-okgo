<?php

namespace App\Http\Controllers;

use App\Models\Party;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PartyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $query = Party::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        $parties = $query->orderBy('name')
                          ->paginate($perPage)
                          ->withQueryString();

        return Inertia::render('parties/index', [
            'parties' => $parties,
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
            'name' => 'required|string|max:255|unique:parties,name',
            'description' => 'nullable|string|max:1000',
        ]);

        Party::create($validated);

        return redirect()->back()->with('success', 'Pihak bagi hasil berhasil ditambahkan!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Party $party)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:parties,name,' . $party->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $party->update($validated);

        return redirect()->back()->with('success', 'Pihak bagi hasil berhasil diperbarui!');
    }

    /**
     * Remove the specified resource in storage.
     */
    public function destroy(Party $party)
    {
        $party->delete();

        return redirect()->back()->with('success', 'Pihak bagi hasil berhasil dihapus!');
    }
}
