<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TrialBalanceExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    private $accounts;
    private $totalDebit;
    private $totalCredit;

    public function __construct($accounts, $totalDebit, $totalCredit)
    {
        $this->accounts = $accounts;
        $this->totalDebit = $totalDebit;
        $this->totalCredit = $totalCredit;
    }

    public function collection()
    {
        $data = collect();

        // Add title
        $data->push(['NERACA SALDO', '', '', date('d-m-Y')]);
        $data->push([]);

        // Add header
        $data->push(['KODE', 'NAMA AKUN', 'DEBIT', 'KREDIT']);

        // Add account data
        foreach ($this->accounts as $account) {
            $data->push([
                $account['code'],
                $account['name'],
                $account['debit'] > 0 ? $account['debit'] : '',
                $account['credit'] > 0 ? $account['credit'] : '',
            ]);
        }

        // Add totals
        $data->push([]); // Empty row
        $data->push([
            'TOTAL',
            '',
            $this->totalDebit,
            $this->totalCredit,
        ]);

        return $data;
    }

    public function headings(): array
    {
        return ['KODE', 'NAMA AKUN', 'DEBIT', 'KREDIT'];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            3 => ['font' => ['bold' => true], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'D3D3D3']]],
        ];
    }
}
