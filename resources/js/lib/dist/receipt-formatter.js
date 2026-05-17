"use strict";
// File ini berisi semua yang berhubungan dengan format dan pencetakan struk.
exports.__esModule = true;
exports.printPacketPurchaseReceipt = exports.printTransactionReceipt = void 0;
var LINE_WIDTH = 48;
var centerText = function (text, width) {
    if (width === void 0) { width = LINE_WIDTH; }
    var padding = Math.floor((width - text.length) / 2);
    return " ".repeat(Math.max(0, padding)) + text;
};
var leftRightText = function (leftText, rightText, width) {
    if (width === void 0) { width = LINE_WIDTH; }
    var spaceCount = width - leftText.length - rightText.length;
    var spaces = " ".repeat(Math.max(0, spaceCount));
    return leftText + spaces + rightText;
};
var drawLine = function (char, width) {
    if (char === void 0) { char = "="; }
    if (width === void 0) { width = LINE_WIDTH; }
    return char.repeat(width);
};
exports.printTransactionReceipt = function (transaction) {
    var _a, _b, _c;
    if (!((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.service_records) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.product)) {
        console.error("Data transaksi tidak lengkap untuk dicetak.");
        return;
    }
    var product = transaction.service_records[0].product;
    var transactionDate = new Date(transaction.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    var transactionTime = new Date(transaction.created_at).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
    });
    var formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(transaction.total_amount);
    var formattedPaid = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(transaction.paid_amount);
    var formattedChange = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(transaction.change_amount);
    var strukText = "";
    strukText += centerText("*** D+Robotic Car Wash & Coffee ***") + "\n";
    strukText += centerText("Jl. M.H Thamrin No.16A, Sidodadi") + "\n";
    strukText += centerText("Kec. Medan Tim., Kota Medan") + "\n";
    strukText += centerText("Sumatera Utara 20232") + "\n";
    strukText += centerText("Telp: 0821-6024-6588") + "\n\n";
    strukText += drawLine("=") + "\n";
    strukText +=
        leftRightText("No. Struk: " + transaction.id, "" + transactionDate) +
            "\n";
    strukText += leftRightText("", "" + transactionTime) + "\n";
    strukText += drawLine("-") + "\n";
    strukText += "Customer : " + transaction.customer.name + "\n";
    strukText += "Kendaraan: " + (((_c = transaction.car) === null || _c === void 0 ? void 0 : _c.plate_number) || "N/A") + " \n";
    strukText += drawLine("-") + "\n";
    strukText += "LAYANAN:\n";
    strukText += leftRightText(product.name, formattedPrice) + "\n";
    strukText += drawLine("=") + "\n";
    strukText += leftRightText("TOTAL", formattedPrice) + "\n";
    if (transaction.payment_method == "Cash") {
        strukText += leftRightText("BAYAR", formattedPaid) + "\n";
        strukText += leftRightText("KEMBALIAN", formattedChange) + "\n\n";
    }
    strukText +=
        leftRightText("Bayar Via: " + transaction.payment_method, "") + "\n\n";
    strukText += centerText("Terima Kasih!") + "\n";
    strukText += centerText("Atas kunjungan Anda") + "\n\n";
    strukText += "*Struk wajib disimpan untuk garansi 1x24 jam" + "\n\n";
    var encodedText = encodeURIComponent(strukText);
    window.open("rawbt:" + encodedText);
};
exports.printPacketPurchaseReceipt = function (transaction) {
    var _a;
    if (!(transaction === null || transaction === void 0 ? void 0 : transaction.purchased_packets) ||
        transaction.purchased_packets.length === 0) {
        console.error("Data pembelian paket tidak lengkap untuk dicetak.");
        return;
    }
    // Group by voucher_packet.id and count
    var packetMap = {};
    transaction.purchased_packets.forEach(function (pp) {
        var vp = pp.voucher_packet;
        if (!vp)
            return;
        if (!packetMap[vp.id]) {
            packetMap[vp.id] = { name: vp.name, count: 0 };
        }
        packetMap[vp.id].count += 1;
    });
    var transactionDate = new Date(transaction.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
    var transactionTime = new Date(transaction.created_at).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
    });
    var formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(transaction.total_amount);
    var formattedPaid = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(transaction.paid_amount);
    var formattedChange = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(transaction.change_amount);
    var strukText = "";
    strukText += centerText("*** D+Robotic Car Wash & Coffee ***") + "\n";
    strukText += centerText("Jl. M.H Thamrin No.16A, Sidodadi") + "\n";
    strukText += centerText("Kec. Medan Tim., Kota Medan") + "\n";
    strukText += centerText("Sumatera Utara 20232") + "\n";
    strukText += centerText("Telp: 0821-6024-6588") + "\n\n";
    strukText += drawLine("=") + "\n";
    strukText +=
        leftRightText("No. Struk: " + transaction.id, "" + transactionDate) +
            "\n";
    strukText += leftRightText("", "" + transactionTime) + "\n";
    strukText += drawLine("-") + "\n";
    strukText += "Customer : " + transaction.customer.name + "\n";
    strukText += "Kendaraan: " + (((_a = transaction.car) === null || _a === void 0 ? void 0 : _a.plate_number) || "N/A") + "\n";
    strukText += drawLine("-") + "\n";
    strukText += "PEMBELIAN PAKET:\n";
    Object.values(packetMap).forEach(function (_a) {
        var name = _a.name, count = _a.count;
        strukText += leftRightText(count + " x " + name, "") + "\n";
    });
    strukText += drawLine("=") + "\n";
    strukText += leftRightText("TOTAL", formattedPrice) + "\n";
    if (transaction.payment_method == "Cash") {
        strukText += leftRightText("BAYAR", formattedPaid) + "\n";
        strukText += leftRightText("KEMBALIAN", formattedChange) + "\n\n";
    }
    strukText +=
        leftRightText("Bayar Via: " + transaction.payment_method, "") + "\n\n";
    strukText += centerText("Terima Kasih!") + "\n";
    strukText += centerText("Atas kunjungan Anda") + "\n\n";
    var encodedText = encodeURIComponent(strukText);
    window.open("rawbt:" + encodedText);
};
