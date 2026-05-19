<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'email',
        'contact_person',
        'address',
    ];

    /**
     * Get the purchases from this supplier.
     */
    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }
}
