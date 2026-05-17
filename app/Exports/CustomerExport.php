<?php

namespace App\Exports;

use App\Models\Customer;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CustomerExport implements FromCollection, WithHeadings, ShouldAutoSize, WithStyles
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return Customer::with('cars')->get()->map(function ($customer, $index) {
            $cars = $customer->cars->map(fn($car) => "{$car->plate_number} ({$car->model})")->implode(', ');

            return [
                'No' => $index + 1,
                'Nama' => $customer->name,
                'Email' => $customer->email,
                'Telepon' => $customer->phone,
                'Kendaraan' => $cars ?: '-',
            ];
        });
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return ['No', 'Nama', 'Email', 'Telepon', 'Kendaraan'];
    }

    /**
     * @param Worksheet $sheet
     */
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
