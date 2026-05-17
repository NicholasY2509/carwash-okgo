<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class IncomeStatementExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    private $revenues;
    private $expenses;
    private $totalRevenue;
    private $totalExpense;
    private $netIncome;

    public function __construct($revenues, $expenses, $totalRevenue, $totalExpense, $netIncome)
    {
        $this->revenues = $revenues;
        $this->expenses = $expenses;
        $this->totalRevenue = $totalRevenue;
        $this->totalExpense = $totalExpense;
        $this->netIncome = $netIncome;
    }

    public function collection()
    {
        $data = collect();

        // Add title
        $data->push(['LAPORAN LABA RUGI', '', date('d-m-Y')]);
        $data->push([]);

        // Revenues section
        $data->push(['PENDAPATAN', '']);
        foreach ($this->revenues as $revenue) {
            $data->push([
                $revenue['code'],
                $revenue['name'],
                $revenue['amount'],
            ]);
        }
        $data->push(['Total Pendapatan', '', $this->totalRevenue]);
        $data->push([]);

        // Expenses section
        $data->push(['BEBAN', '']);
        foreach ($this->expenses as $expense) {
            $data->push([
                $expense['code'],
                $expense['name'],
                $expense['amount'],
            ]);
        }
        $data->push(['Total Beban', '', $this->totalExpense]);
        $data->push([]);

        // Net income
        $data->push(['LABA BERSIH', '', $this->netIncome]);

        return $data;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
        ];
    }
}
