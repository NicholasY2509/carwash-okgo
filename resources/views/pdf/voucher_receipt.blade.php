<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Struk Transaksi #{{ $transaction_id }}</title>
    <style>
        @page {
            size: 576pt 850pt;
            margin: 0;
        }
        body {
            font-family: 'Courier', monospace;
            color: #1e293b;
            margin: 0;
            padding: 35px 40px;
            background-color: #ffffff;
            font-size: 25px;
            line-height: 1.8;
        }
        .receipt-container {
            width: 100%;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            border-bottom: 2px dashed #cbd5e1;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .brand-name {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 48px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .brand-subtitle {
            font-size: 23px;
            color: #64748b;
            margin: 8px 0 0 0;
            font-weight: 500;
        }
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #0f172a;
            margin: 15px 0 0 0;
            letter-spacing: 1px;
        }
        .meta-grid {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        .meta-row {
            display: table-row;
        }
        .meta-label, .meta-value {
            display: table-cell;
            padding: 5px 0;
        }
        .meta-label {
            color: #64748b;
            width: 35%;
        }
        .meta-value {
            font-weight: 600;
            color: #1e293b;
            text-align: right;
        }
        .section-title {
            font-size: 23px;
            font-weight: 700;
            color: #0f172a;
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .details-table th {
            text-align: left;
            color: #64748b;
            font-weight: 600;
            padding: 8px 0;
            border-bottom: 1px solid #cbd5e1;
            font-size: 23px;
            text-transform: uppercase;
        }
        .details-table td {
            padding: 12px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .item-name {
            font-weight: 700;
            color: #0f172a;
        }
        .item-price {
            text-align: right;
            font-weight: 600;
            color: #0f172a;
        }
        .total-section {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 15px 20px;
            margin-top: 15px;
            border: 1px solid #f1f5f9;
        }
        .total-row {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }
        .total-row:last-child {
            margin-bottom: 0;
            border-top: 1px dashed #e2e8f0;
            padding-top: 8px;
            margin-top: 8px;
        }
        .total-label, .total-value {
            display: table-cell;
        }
        .total-label {
            color: #64748b;
        }
        .total-value {
            text-align: right;
            font-weight: 600;
            color: #1e293b;
        }
        .grand-total {
            font-family: 'Courier New', Courier, monospace;
            font-size: 30px;
            font-weight: 800;
            color: #0f172a !important;
        }
        .footer {
            text-align: center;
            margin-top: 25px;
            font-size: 23px;
            color: #94a3b8;
        }
        .footer p {
            margin: 4px 0;
        }
        .thanks {
            font-size: 25px;
            font-weight: 700;
            color: #475569;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>

<div class="receipt-container">
    <div class="header">
        <h1 class="brand-name">KURO AUTO CARE</h1>
        <div class="title">STRUK TRANSAKSI DIGITAL</div>
    </div>

    <!-- Meta Details -->
    <div class="meta-grid">
        <div class="meta-row">
            <div class="meta-label">ID Transaksi</div>
            <div class="meta-value" style="font-family: 'Courier New', Courier, monospace;">#{{ $transaction_id }}</div>
        </div>
        <div class="meta-row">
            <div class="meta-label">Tanggal</div>
            <div class="meta-value" style="font-family: 'Courier New', Courier, monospace;">{{ $transaction_date }}</div>
        </div>
        <div class="meta-row">
            <div class="meta-label">Kasir</div>
            <div class="meta-value" style="font-family: 'Courier New', Courier, monospace;">{{ $staff_name }}</div>
        </div>
    </div>

    <!-- Vehicle Details -->
    <div class="section-title">Informasi Kendaraan</div>
    <div class="meta-grid">
        <div class="meta-row">
            <div class="meta-label">Nama Pelanggan</div>
            <div class="meta-value" style="font-family: 'Courier New', Courier, monospace;">{{ $customer_name }}</div>
        </div>
        <div class="meta-row">
            <div class="meta-label">No. Plat Mobil</div>
            <div class="meta-value" style="color: #0f172a; font-weight: bold;">{{ $plate_number }}</div>
        </div>
    </div>

    <!-- Services Details -->
    <div class="section-title">Rincian Layanan</div>
    <table class="details-table">
        <tbody>
            <tr>
                <td>
                    <div class="item-name">{{ $product_name }}</div>
                </td>
                <td class="item-price" style="font-family: 'Courier New', Courier, monospace;">
                    @if($payment_method === 'Voucher' || $payment_method === 'Garansi' || $payment_method === 'Klaim Garansi')
                        Rp 0
                    @else
                        Rp {{ number_format($total_amount, 0, ',', '.') }}
                    @endif
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Totals Block -->
    <div class="total-section">
        <div class="total-row">
            <div class="total-label">Subtotal</div>
            <div class="total-value" style="font-family: 'Courier New', Courier, monospace;">
                @if($payment_method === 'Voucher' || $payment_method === 'Garansi' || $payment_method === 'Klaim Garansi')
                    Rp 0
                @else
                    Rp {{ number_format($total_amount, 0, ',', '.') }}
                @endif
            </div>
        </div>
        <div class="total-row">
            <div class="total-label">Metode Pembayaran</div>
            <div class="total-value" style="font-family: 'Courier New', Courier, monospace;">{{ $payment_method }}</div>
        </div>

        <div class="total-row">
            <div class="total-label grand-total" style="font-family: 'Courier New', Courier, monospace;">Grand Total</div>
            <div class="total-value grand-total" style="font-family: 'Courier New', Courier, monospace;">
                @if($payment_method === 'Voucher' || $payment_method === 'Garansi' || $payment_method === 'Klaim Garansi')
                    Rp 0
                @else
                    Rp {{ number_format($total_amount, 0, ',', '.') }}
                @endif
            </div>
        </div>
    </div>

    @if(isset($vouchers) && count($vouchers) > 0)
    <!-- Vouchers Barcode Section -->
    <div style="page-break-before: always; padding-top: 20px;">
        <div class="section-title" style="text-align: center; border-bottom: none;">Voucher Anda</div>
        <div style="text-align: center; color: #64748b; font-size: 20px; margin-bottom: 20px;">Tunjukkan barcode ini ke kasir saat akan digunakan</div>
        
        @foreach($vouchers as $voucher)
        <div style="text-align: center; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-weight: bold; font-size: 23px; margin-bottom: 10px; color: #0f172a;">{{ $voucher['serial_number'] }}</div>
            <img src="data:image/png;base64,{{ $voucher['base64_barcode'] }}" alt="Barcode" style="max-width: 100%; height: 60px;">
            @if(isset($voucher['expired_at']) && $voucher['expired_at'] !== '-')
            <div style="font-size: 20px; color: #64748b; margin-top: 10px;">Berlaku s/d: {{ $voucher['expired_at'] }}</div>
            @endif
        </div>
        @endforeach
    </div>
    @endif

    <!-- Thank You Section -->
    <div class="footer">
        <div class="thanks">Terima kasih atas pembelian Anda!</div>
        <p>Struk ini diterbitkan secara digital.</p>
        <p>© KURO AUTO CARE</p>
    </div>
</div>

</body>
</html>
