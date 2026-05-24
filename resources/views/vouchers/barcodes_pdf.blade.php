<!DOCTYPE html>
<html>
<head>
    <title>Barcodes</title>
    <style>
        @page {
            margin: 20px;
            size: a4;
        }
        body {
            font-family: sans-serif;
            margin: 0;
            padding: 0;
        }
        .page {
            page-break-after: always;
            width: 100%;
        }
        .page:last-child {
            page-break-after: avoid;
        }
        .grid {
            width: 100%;
            border-collapse: collapse;
        }
        .grid td {
            width: 33.33%;
            height: 220px;
            text-align: center;
            vertical-align: middle;
            border: none;
            padding: 10px;
        }
        .barcode-container {
            text-align: center;
        }
        .barcode-image {
            max-width: 100%;
            height: 60px;
        }
        .barcode-text {
            margin-top: 10px;
            font-size: 14px;
            letter-spacing: 2px;
        }
    </style>
</head>
<body>
    @php
        $generator = new Picqer\Barcode\BarcodeGeneratorPNG();
        $chunks = $vouchers->chunk(12);
    @endphp

    @foreach($chunks as $pageVouchers)
        <div class="page">
            <table class="grid">
                @foreach($pageVouchers->chunk(3) as $rowVouchers)
                    <tr>
                        @foreach($rowVouchers as $voucher)
                            <td>
                                <div class="barcode-container">
                                    @php
                                        $barcode = base64_encode($generator->getBarcode($voucher->serial_number, $generator::TYPE_CODE_128, 2, 60));
                                    @endphp
                                    <img src="data:image/png;base64,{{ $barcode }}" class="barcode-image">
                                    <div class="barcode-text">{{ $voucher->serial_number }}</div>
                                </div>
                            </td>
                        @endforeach
                        
                        @for($i = $rowVouchers->count(); $i < 3; $i++)
                            <td></td>
                        @endfor
                    </tr>
                @endforeach
            </table>
        </div>
    @endforeach
</body>
</html>
