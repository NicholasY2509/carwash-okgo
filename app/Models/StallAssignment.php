<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StallAssignment extends Model
{
    protected $fillable = [
        'stall_id',
        'staff_id',
        'position',
        'start_time',
        'end_time',
        'is_active',
        'assigned_by',
    ];

    public function stall(){
        return $this->belongsTo(Stall::class);
    }

    public function staff(){
        return $this->belongsTo(Staff::class);
    }
}
