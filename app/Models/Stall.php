<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stall extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    public function activeStaffs()
    {
        return $this->belongsToMany(Staff::class, 'stall_assignments')
                    ->withPivot('id', 'start_time', 'end_time', 'is_active', 'position')
                    ->wherePivot('is_active', true)
                    ->orderByPivot('start_time', 'desc');
    }

    public function activeTeams()
    {
        return $this->belongsToMany(Staff::class, 'stall_assignments')
                    ->withPivot('id', 'start_time', 'end_time', 'is_active', 'position')
                    ->wherePivot('is_active', true)
                    ->wherePivotIn('position', ['WASH', 'DRYER'])
                    ->orderByPivot('start_time', 'desc');
    }

    public function assignments()
    {
        return $this->belongsToMany(Staff::class, 'stall_assignments')
                    ->withPivot('id', 'start_time', 'end_time', 'is_active')
                    ->orderByPivot('start_time', 'desc');
    }
}
