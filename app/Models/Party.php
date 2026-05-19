<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Party extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    public function splits()
    {
        return $this->hasMany(ProductSplit::class);
    }
}
