<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateWorkPositionRequest;
use App\Models\WorkPosition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WorkPositionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = WorkPosition::query();
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%");
            });
        }
        $workPositions = $query->paginate($request->per_page ?? 10);
        return Inertia::render('work_position/index', [
            'workPositions' => $workPositions
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateWorkPositionRequest $request)
    {
        DB::beginTransaction();

        try {
            $work_position = new WorkPosition();
            $work_position->name = $request->name;
            $work_position->description = $request->description;
            $work_position->save();

            DB::commit();

            return redirect()->route('work-positions.index')->with('success', 'Posisi kerja berhasil ditambahkan.');
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th);
            return back()->withErrors(['error' => 'Gagal menambahkan Posisi Kerja. Mohon Coba Lagi.']);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(WorkPosition $workPosition)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(WorkPosition $workPosition)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, String $id)
    {
        DB::beginTransaction();

        try {
            $workPosition = WorkPosition::find($id);
            $workPosition->update([
                'name' => $request->name,
                'description' => $request->description,
            ]);

            DB::commit();

            return redirect()->route('work-positions.index')->with('success', 'Posisi kerja berhasil diubah.');
        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th);
            return back()->withErrors(['error' => 'Gagal mengubah Posisi Kerja. Mohon Coba Lagi.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WorkPosition $workPosition)
    {
        //
    }
}
