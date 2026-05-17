<?php

namespace App\Http\Controllers;

use App\Http\Requests\SetStallHeadRequest;
use App\Models\Staff;
use App\Models\Stall;
use App\Models\StallAssignment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class StallAssignmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stalls = Stall::with([
            'activeStaffs',
            'activeTeams'
        ])->get();

        $staffs = Staff::all();

        return Inertia::render('stall_assignments/index', [
            'stalls' => $stalls,
            'staffs'=> $staffs
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
     public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $activeAssignment = StallAssignment::query()
                ->where('staff_id', $request->staff_id)
                ->where('is_active', true)
                ->first();

            if ($activeAssignment) {
                if ($activeAssignment->stall_id == $request->stall_id) {
                    throw ValidationException::withMessages([
                        'staff_id' => 'Staff ini sudah aktif di stall yang sama.',
                    ]);
                } else {
                    $otherStallName = $activeAssignment->stall->name;
                    throw ValidationException::withMessages([
                        'staff_id' => "Staff ini sudah aktif di stall lain ({$otherStallName}).",
                    ]);
                }
            }

            $stall_assignment = new StallAssignment();
            $stall_assignment->stall_id = $request->stall_id;
            $stall_assignment->staff_id = $request->staff_id;
            $stall_assignment->position = $request->position;
            $stall_assignment->start_time = Carbon::now('Asia/Jakarta')->toDateTimeString();
            $stall_assignment->assigned_by = Auth::user()->staff->id;
            $stall_assignment->is_active = true;
            $stall_assignment->save();

            DB::commit();

            return redirect()->route('stall-assignments.index')->with('success', 'Staff berhasil ditambahkan.');

        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th);
            if ($th instanceof ValidationException) {
                throw $th;
            }
            return back()->with('error', 'Gagal menambahkan staff. Mohon Coba Lagi.');
        }
    }

    /**
     * Replace an existing assignment.
     */
    public function replace(Request $request, String $id)
    {
        DB::beginTransaction();
        try {
            $existing = StallAssignment::where('stall_id', $request->stall_id)
                ->where('staff_id', $request->staff_id)
                ->where('is_active', true)
                ->first();

            if ($existing) {
                throw ValidationException::withMessages([
                    'staff_id' => 'Staff ini sudah aktif di stall yang sama.',
                ]);
            }

            $assignment = StallAssignment::find($id);
            $assignment->is_active = false;
            $assignment->end_time = Carbon::now('Asia/Jakarta')->toDateTimeString();
            $assignment->save();

            $new_assignment = new StallAssignment();
            $new_assignment->stall_id = $assignment->stall_id;
            $new_assignment->staff_id = $request->staff_id;
            $new_assignment->start_time = Carbon::now('Asia/Jakarta')->toDateTimeString();
            $new_assignment->assigned_by = Auth::user()->staff->id;
            $new_assignment->is_active = true;
            $new_assignment->save();

            DB::commit();

            return redirect()->route('stall-assignments.edit', $assignment->stall_id)->with('success', 'Staff berhasil diganti.');

        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th);
            if ($th instanceof ValidationException) {
                throw $th;
            }
            return back()->with('error', 'Gagal mengganti staff. Mohon Coba Lagi.');
        }
    }
    /**
     * Display the specified resource.
     */
    public function show(StallAssignment $stallAssignment)
    {

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, String $id)
    {
        $filters = $request->validate([
            'search' => 'nullable|string|max:100',
            'date_from' => 'nullable|date_format:Y-m-d',
            'date_to' => 'nullable|date_format:Y-m-d|after_or_equal:date_from',
        ]);

        $stall = Stall::with('activeStaffs')->findOrFail($id);

        $historyQuery = $stall->assignments()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('full_name', 'like', "%{$search}%");
            })
            ->when($filters['date_from'] ?? null, function ($query, $dateFrom) {
                $query->where('start_time', '>=', $dateFrom . ' 00:00:00');
            })
            ->when($filters['date_to'] ?? null, function ($query, $dateTo) {
                $query->where('start_time', '<=', $dateTo . ' 23:59:59');
            });

        $assignmentHistory = $historyQuery->paginate(5)->withQueryString();

        $assignmentHistory->getCollection()->transform(function ($staff) {
            return [
                'id' => $staff->id,
                'full_name' => $staff->full_name,
                'pivot' => [
                    'id' => $staff->pivot->id,
                    'start_time' => $staff->pivot->start_time,
                    'end_time' => $staff->pivot->end_time,
                    'is_active' => $staff->pivot->is_active,
                ]
            ];
        });

        return Inertia::render('stall_assignments/edit', [
            'stall' => $stall,
            'activeStaffs' => $stall->activeStaffs->map(fn($staff) => [
                'id' => $staff->id,
                'full_name' => $staff->full_name,
                'pivot' => $staff->pivot,
            ]),
            'assignmentHistory' => $assignmentHistory,
            'filters' => $filters,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, StallAssignment $stallAssignment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(String $id)
    {
        $stall_assignment = StallAssignment::findOrFail($id);
        $stall_assignment->is_active = false;
        $stall_assignment->end_time = Carbon::now('Asia/Jakarta')->toDateTimeString();
        $stall_assignment->save();
    }

    public function getWasherStaff(){
        return response()->json([
            'staff' => Staff::get(['id', 'full_name'])
        ]);
    }

    public function setStallHead(SetStallHeadRequest $request)
    {
        DB::beginTransaction();

        try {
            $now = Carbon::now('Asia/Jakarta');
            $commonAssignmentData = [
                'stall_id' => $request->stall_id,
                'start_time' => $now->toDateTimeString(),
                'assigned_by' => Auth::user()->staff->id,
                'is_active' => true,
            ];

            $activeDriver = StallAssignment::where('stall_id', $request->stall_id)
                ->where('position', 'DRIVER')
                ->where('is_active', true)
                ->first();

            if ($activeDriver?->staff_id != $request->driver_id) {
                if ($activeDriver) {
                    $activeDriver->update([
                        'is_active' => false,
                        'end_time' => $now->toDateTimeString(),
                    ]);
                }

                if ($request->filled('driver_id')) {
                    StallAssignment::create(array_merge($commonAssignmentData, [
                        'staff_id' => $request->driver_id,
                        'position' => 'DRIVER',
                    ]));
                }
            }

            $activeQc = StallAssignment::where('stall_id', $request->stall_id)
                ->where('position', 'QC')
                ->where('is_active', true)
                ->first();

            if ($activeQc?->staff_id != $request->qc_id) {
                if ($activeQc) {
                    $activeQc->update([
                        'is_active' => false,
                        'end_time' => $now->toDateTimeString(),
                    ]);
                }

                if ($request->filled('qc_id')) {
                    StallAssignment::create(array_merge($commonAssignmentData, [
                        'staff_id' => $request->qc_id,
                        'position' => 'QC',
                    ]));
                }
            }

            DB::commit();

            return Redirect::back()->with('success', 'Staff berhasil diganti.');

        } catch (\Throwable $th) {
            DB::rollBack();
            Log::error($th);
            if ($th instanceof ValidationException) {
                throw $th;
            }
            return Redirect::back()->with('error', 'Gagal mengganti staff. Mohon Coba Lagi.');
        }
    }

}
