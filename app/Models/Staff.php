<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;
    protected $table = 'staffs';
    /**
     * Relation to the WorkPosition model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function workPosition()
    {
        return $this->belongsTo(WorkPosition::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function stall(){
        return $this->belongsToMany(Stall::class, 'stall_assignments');
    }

    public function assignments(){
        return $this->hasMany(StallAssignment::class, 'staff_id');
    }
}
