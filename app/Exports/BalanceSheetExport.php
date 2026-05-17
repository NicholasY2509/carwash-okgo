<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class BalanceSheetExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    private $assets;
    private $liabilities;
    private $equity;
    private $totalAssets;
    private $totalLiabilities;
    private $totalEquity;

    public function __construct($assets, $liabilities, $equity, $totalAssets, $totalLiabilities, $totalEquity)
    {
        $this->assets = $assets;
        $this->liabilities = $liabilities;
        $this->equity = $equity;
        $this->totalAssets = $totalAssets;
        $this->totalLiabilities = $totalLiabilities;
        $this->totalEquity = $totalEquity;
    }

    public function collection()
    {
        $data = collect();

        // Add title
        $data->push(['NERACA', '', date('d-m-Y')]);
        $data->push([]);

        // Assets
        $data->push(['ASET', '']);
        foreach ($this->assets as $asset) {
            $data->push([
                $asset['code'],
                $asset['name'],
                $asset['amount'],
            ]);
        }
        $data->push(['Total Aset', '', $this->totalAssets]);
        $data->push([]);

        // Liabilities
        $data->push(['KEWAJIBAN', '']);
        foreach ($this->liabilities as $liability) {
            $data->push([
                $liability['code'],
                $liability['name'],
                $liability['amount'],
            ]);
        }
        $data->push(['Total Kewajiban', '', $this->totalLiabilities]);
        $data->push([]);

        // Equity
        $data->push(['EKUITAS', '']);
        foreach ($this->equity as $eq) {
            $data->push([
                $eq['code'],
                $eq['name'],
                $eq['amount'],
            ]);
        }
        $data->push(['Total Ekuitas', '', $this->totalEquity]);
        $data->push([]);

        // Total Liabilities + Equity
        $data->push(['Total Kewajiban + Ekuitas', '', $this->totalLiabilities + $this->totalEquity]);

        return $data;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
        ];
    }
}
