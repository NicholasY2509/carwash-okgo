<?php

namespace App\Http\Controllers;

use App\Models\ServiceRecord;
use Inertia\Inertia;
use Illuminate\Http\Request;

class QueueController extends Controller
{
    public function index(Request $request){
        $date = $request->input('date', \Carbon\Carbon::today()->toDateString());

        $serviceRecords = ServiceRecord::with('car.carType')
            ->whereIn('queue_status', ['pending', 'ongoing', 'finished'])
            ->whereDate('created_at', $date)
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('queue/index', [
            'serviceRecords' => $serviceRecords,
            'filters' => [
                'date' => $date
            ]
        ]);
    }

    public function updateStatus(Request $request, $id){
        $request->validate([
            'status' => 'required|in:pending,ongoing,finished,settled'
        ]);

        $serviceRecord = ServiceRecord::findOrFail($id);
        $serviceRecord->queue_status = $request->status;
        $serviceRecord->save();

        return redirect()->back()->with('success', 'Status updated successfully');
    }
}
