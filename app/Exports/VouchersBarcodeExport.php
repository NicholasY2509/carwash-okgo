<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithDrawings;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use Picqer\Barcode\BarcodeGeneratorPNG;

class VouchersBarcodeExport implements FromCollection, WithDrawings, WithEvents
{
    private $vouchers;
    private $drawings = [];

    public function __construct($vouchers)
    {
        $this->vouchers = $vouchers;
        $this->generateDrawings();
    }

    public function collection()
    {
        $data = [];
        foreach ($this->vouchers as $index => $voucher) {
            $data[] = ['']; // Row for barcode
            $data[] = [$voucher->serial_number]; // Row for text
            $data[] = ['']; // Spacer
        }

        return collect($data);
    }

    private function generateDrawings()
    {
        $generator = new BarcodeGeneratorPNG();
        
        foreach ($this->vouchers as $index => $voucher) {
            $row = ($index * 3) + 1;
            
            $barcodeData = $generator->getBarcode($voucher->serial_number, $generator::TYPE_CODE_128, 2, 60);
            
            $filename = sys_get_temp_dir() . '/barcode_' . $voucher->serial_number . '_' . uniqid() . '.png';
            file_put_contents($filename, $barcodeData);

            $drawing = new Drawing();
            $drawing->setName('Barcode');
            $drawing->setDescription('Barcode');
            $drawing->setPath($filename);
            $drawing->setCoordinates('A' . $row);
            $drawing->setHeight(60); 
            $drawing->setOffsetY(10);
            $drawing->setOffsetX(10);
            
            $this->drawings[] = $drawing;
        }
    }

    public function drawings()
    {
        return $this->drawings;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                
                $sheet->getColumnDimension('A')->setWidth(30);

                foreach ($this->vouchers as $index => $voucher) {
                    $rowBarcode = ($index * 3) + 1;
                    $rowText = ($index * 3) + 2;
                    
                    $sheet->getRowDimension($rowBarcode)->setRowHeight(60);
                    $sheet->getStyle('A' . $rowText)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                }
            },
        ];
    }
}
