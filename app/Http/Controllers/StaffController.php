<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\User;
use App\Models\WorkPosition;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Staff::with(['workPosition', 'user']);
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%$search%")
                  ->orWhere('nik', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%")
                  ->orWhereHas('workPosition', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%$search%");
                  });
            });
        }
        $staffs = $query->paginate($request->per_page ?? 10);
        return Inertia::render('staffs/index', [
            'staffs' => $staffs
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */

     public function meta()
     {
        $work_positions = WorkPosition::select('id', 'name')->get();
        $users = User::select('id', 'name', 'email')->get();

        return response()->json([
            'work_positions' => $work_positions,
            'users' => $users
        ]);
     }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            $staff = new Staff();
            $staff->nik = $request->nik;
            $staff->first_name = $request->first_name;
            $staff->last_name = $request->last_name;
            $staff->full_name = $request->first_name . ' ' . $request->last_name;
            $staff->phone = $request->phone;
            $staff->work_position_id = $request->work_position_id;
            $staff->user_id = $request->user_id;
            $staff->save();

            DB::commit();

            return redirect()->route('staffs.index')->with('success', 'Staff berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error($e);
            return redirect()->route('staffs.index')->with('error', 'Terjadi kesalahan saat menambahkan staff.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Staff $staff)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Staff $staff)
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
            $staff = Staff::find($id);
            $staff->nik = $request->nik;
            $staff->first_name = $request->first_name;
            $staff->last_name = $request->last_name;
            $staff->full_name = $request->first_name . ' ' . $request->last_name;
            $staff->phone = $request->phone;
            $staff->work_position_id = $request->work_position_id;
            $staff->user_id = $request->user_id;
            $staff->save();

            DB::commit();

            return redirect()->route('staffs.index')->with('success', 'Staff berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error($e);
            return redirect()->route('staffs.index')->with('error', 'Terjadi kesalahan saat memperbarui staff.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Staff $staff)
    {
        //
    }

    public function generateNik($workPositionId)
    {
        $workPosition = WorkPosition::findOrFail($workPositionId);

        $words = explode(' ', $workPosition->name);
        $prefix = '';
        foreach ($words as $word) {
            $prefix .= strtoupper(substr($word, 0, 1));
        }

        $latestNik = Staff::where('nik', 'like', $prefix . '%')
                        ->orderBy('nik', 'desc')
                        ->value('nik');

        $number = 0;
        if ($latestNik) {
            $numberPart = substr($latestNik, strlen($prefix));
            $number = intval($numberPart);
        }
        $number++;

        $formattedNumber = str_pad($number, 3, '0', STR_PAD_LEFT);

        $nik = $prefix . $formattedNumber;

        return response()->json(['nik' => $nik]);
    }

}
