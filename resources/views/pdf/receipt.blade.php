<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Struk Transaksi #{{ $transaction_id }}</title>
    <style>
        @page {
            margin: 0;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            margin: 0;
            padding: 30px;
            background-color: #ffffff;
            font-size: 13px;
            line-height: 1.5;
        }
        .receipt-card {
            max-width: 500px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            border-bottom: 2px dashed #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .brand-name {
            font-size: 24px;
            font-weight: 800;
            color: #1e3a8a;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .brand-subtitle {
            font-size: 11px;
            color: #64748b;
            margin: 4px 0 0 0;
        }
        .title {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin: 15px 0 5px 0;
        }
        .meta-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        .meta-row {
            display: table-row;
        }
        .meta-label, .meta-value {
            display: table-cell;
            padding: 4px 0;
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
            font-size: 12px;
            font-weight: 700;
            color: #1e3a8a;
            text-transform: uppercase;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 6px;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
        }
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .details-table th {
            text-align: left;
            color: #64748b;
            font-weight: 600;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
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
            padding: 15px;
            margin-top: 15px;
        }
        .total-row {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }
        .total-row:last-child {
            margin-bottom: 0;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
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
            font-size: 16px;
            font-weight: 800;
            color: #1e3a8a !important;
        }
        .footer {
            text-align: center;
            margin-top: 25px;
            font-size: 11px;
            color: #94a3b8;
        }
        .footer p {
            margin: 4px 0;
        }
        .thanks {
            font-size: 12px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>

<div class="receipt-card">
    <div class="header">
        <h1 class="brand-name">OKGO Car Wash</h1>
        <p class="brand-subtitle">Cuci Bersih, Cepat, & Terpercaya • carwash.okgo.co.id</p>
        <div class="title">STRUK TRANSAKSI</div>
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
    <div class="meta-grid" style="margin-bottom: 15px;">
        <div class="meta-row">
            <div class="meta-label">Nama Pelanggan</div>
            <div class="meta-value">{{ $customer_name }}</div>
        </div>
        <div class="meta-row">
            <div class="meta-label">No. Plat Mobil</div>
            <div class="meta-value" style="color: #1e3a8a; font-weight: bold;">{{ $plate_number }}</div>
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
        <p>© OKGO Car Wash System</p>
    </div>
</div>

</body>
</html>
