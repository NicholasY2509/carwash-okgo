<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateStallRequest;
use App\Models\Stall;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class StallController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stalls = Stall::all();

        return Inertia::render('stall/index', [
            'stalls' => $stalls
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateStallRequest $request)
    {
        DB::beginTransaction();

        try {
            $stall = Stall::create($request->validated());

            DB::commit();

            return redirect()->route('stalls.index')->with('success', 'Stall berhasil ditambahkan.');
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th);
            return back()->withErrors(['error' => 'Gagal menambahkan stall. Mohon Coba Lagi.']);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(Stall $stall)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Stall $stall)
    {

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, String $id)
    {
        $stall = Stall::find($id);
        $stall->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->route('stalls.index')->with('success', 'Stall berhasil diubah.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Stall $stall)
    {
        //
    }
}
