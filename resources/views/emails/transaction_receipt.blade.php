<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Struk Transaksi</title>
</head>
<body style="font-family: sans-serif; line-height: 1.5; color: #333;">
    <p>Halo <strong>{{ $customerName }}</strong>,</p>
    <p>Terima kasih telah melakukan transaksi di <strong>KURO AUTO CARE</strong>!</p>
    
    @if($plateNumber && $plateNumber !== '-')
        <p>Berikut dilampirkan struk pembayaran digital resmi Anda untuk kendaraan dengan Plat Nomor <strong>{{ $plateNumber }}</strong>.</p>
    @else
        <p>Berikut dilampirkan struk pembayaran digital resmi Anda.</p>
    @endif

    <p>
        Enjoy your clean ride ✨<br>
        See you on your next wash 🙏
    </p>

    <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
        Untuk Kritik dan Saran hubungi 0851-7800-8988
    </p>
</body>
</html>
