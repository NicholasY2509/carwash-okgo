<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Struk Transaksi #{{ $transaction_id }}</title>
    <style>
        @page {
            size: 8.0in 8.5in;
            margin: 0;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 35px 40px;
            background-color: #ffffff;
            font-size: 13px;
            line-height: 1.5;
        }
        .receipt-container {
            width: 100%;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            border-bottom: 2px dashed #cbd5e1;
            padding-bottom: 15px;
            margin-bottom: 18px;
        }
        .brand-name {
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .brand-subtitle {
            font-size: 11px;
            color: #64748b;
            margin: 5px 0 0 0;
            font-weight: 500;
        }
        .title {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
            margin: 12px 0 0 0;
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
            padding: 3px 0;
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
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 8px;
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
            padding: 6px 0;
            border-bottom: 1px solid #cbd5e1;
            font-size: 11px;
            text-transform: uppercase;
        }
        .details-table td {
            padding: 10px 0;
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
            padding: 12px 15px;
            margin-top: 10px;
            border: 1px solid #f1f5f9;
        }
        .total-row {
            display: table;
            width: 100%;
            margin-bottom: 6px;
        }
        .total-row:last-child {
            margin-bottom: 0;
            border-top: 1px dashed #e2e8f0;
            padding-top: 6px;
            margin-top: 4px;
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
            font-size: 15px;
            font-weight: 800;
            color: #0f172a !important;
        }
        .footer {
            text-align: center;
            margin-top: 25px;
            font-size: 11px;
            color: #94a3b8;
        }
        .footer p {
            margin: 3px 0;
        }
        .thanks {
            font-size: 12px;
            font-weight: 700;
            color: #475569;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>

<div class="receipt-container">
    <div class="header">
        <h1 class="brand-name">KURO CAR WASH</h1>
        <p class="brand-subtitle">Premium Clean, Express Service & Trusted • kurocarwash.co.id</p>
        <div class="title">STRUK TRANSAKSI DIGITAL</div>
    </div>

    <!-- Meta Details -->
    <div class="meta-grid">
        <div class="meta-row">
            <div class="meta-label">ID Transaksi</div>
            <div class="meta-value">#{{ $transaction_id }}</div>
        </div>
        <div class="meta-row">
            <div class="meta-label">Tanggal</div>
            <div class="meta-value">{{ $transaction_date }}</div>
        </div>
        <div class="meta-row">
            <div class="meta-label">Kasir</div>
            <div class="meta-value">{{ $staff_name }}</div>
        </div>
    </div>

    <!-- Vehicle Details -->
    <div class="section-title">Informasi Kendaraan</div>
    <div class="meta-grid" style="margin-bottom: 12px;">
        <div class="meta-row">
            <div class="meta-label">Nama Pelanggan</div>
            <div class="meta-value">{{ $customer_name }}</div>
        </div>
        <div class="meta-row">
            <div class="meta-label">No. Plat Mobil</div>
            <div class="meta-value" style="color: #0f172a; font-weight: bold;">{{ $plate_number }}</div>
        </div>
        <div class="meta-row">
            <div class="meta-label">Tipe/Warna</div>
            <div class="meta-value">{{ $car_model }} ({{ $car_color }})</div>
        </div>
    </div>

    <!-- Services Details -->
    <div class="section-title">Rincian Layanan</div>
    <table class="details-table">
        <thead>
            <tr>
                <th>Item / Deskripsi</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <div class="item-name">{{ $product_name }}</div>
                </td>
                <td class="item-price">
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
            <div class="total-value">
                @if($payment_method === 'Voucher' || $payment_method === 'Garansi' || $payment_method === 'Klaim Garansi')
                    Rp 0
                @else
                    Rp {{ number_format($total_amount, 0, ',', '.') }}
                @endif
            </div>
        </div>
        <div class="total-row">
            <div class="total-label">Metode Pembayaran</div>
            <div class="total-value">{{ $payment_method }}</div>
        </div>
        
        @if($payment_method === 'Cash' && isset($paid_amount))
            <div class="total-row">
                <div class="total-label">Nominal Bayar</div>
                <div class="total-value">Rp {{ number_format($paid_amount, 0, ',', '.') }}</div>
            </div>
            <div class="total-row">
                <div class="total-label">Kembalian</div>
                <div class="total-value">Rp {{ number_format($change_amount, 0, ',', '.') }}</div>
            </div>
        @endif

        <div class="total-row">
            <div class="total-label grand-total">Grand Total</div>
            <div class="total-value grand-total">
                @if($payment_method === 'Voucher' || $payment_method === 'Garansi' || $payment_method === 'Klaim Garansi')
                    Rp 0
                @else
                    Rp {{ number_format($total_amount, 0, ',', '.') }}
                @endif
            </div>
        </div>
    </div>

    <!-- Thank You Section -->
    <div class="footer">
        <div class="thanks">Terima kasih atas kunjungan Anda!</div>
        <p>Struk ini sah dan diterbitkan secara digital.</p>
        <p>© KURO CAR WASH System</p>
    </div>
</div>

</body>
</html>
