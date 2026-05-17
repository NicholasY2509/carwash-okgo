<?php

namespace App\Services;

use Carbon\Carbon;

class StorageService
{
   public static function store($file, string $path): string
    {
        $directory = 'uploads/' . $path . '/' . Carbon::now()->format('Y/m/d');

        $originalName = $file->getClientOriginalName();
        $fileName = time() . '_' . $originalName;
        $storedPath = $file->storeAs($directory, $fileName, 'public');

        return "/storage/" . $storedPath;
    }
}
