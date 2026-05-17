// File ini berisi semua yang berhubungan dengan format dan pencetakan struk.

// Definisikan tipe data yang akan kita gunakan di banyak tempat
interface car {
    id: string;
    plate_number: string;
    model: string;
    color: string;
}
interface Product {
    id: number;
    name: string;
    price: number;
}
interface Customer {
    id: string;
    name: string;
}
interface ServiceRecord {
    id: number;
    product: Product;
}
export interface Transaction {
    id: number;
    customer: Customer;
    car: car;
    service_records: ServiceRecord[];
    created_at: string;
    payment_method: string;
    total_amount: number;
    paid_amount: number;
    change_amount: number;
}

const LINE_WIDTH = 48;

const centerText = (text: string, width: number = LINE_WIDTH): string => {
    const padding = Math.floor((width - text.length) / 2);
    return " ".repeat(Math.max(0, padding)) + text;
};

const leftRightText = (
    leftText: string,
    rightText: string,
    width: number = LINE_WIDTH,
): string => {
    const spaceCount = width - leftText.length - rightText.length;
    const spaces = " ".repeat(Math.max(0, spaceCount));
    return leftText + spaces + rightText;
};

const drawLine = (char: string = "=", width: number = LINE_WIDTH): string => {
    return char.repeat(width);
};

export const printTransactionReceipt = (transaction: Transaction) => {
    if (!transaction?.service_records?.[0]?.product) {
        console.error("Data transaksi tidak lengkap untuk dicetak.");
        return;
    }
    const product = transaction.service_records[0].product;
    const transactionDate = new Date(transaction.created_at).toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        },
    );
    const transactionTime = new Date(transaction.created_at).toLocaleTimeString(
        "id-ID",
        {
            hour: "2-digit",
            minute: "2-digit",
        },
    );
    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(transaction.total_amount);

    const formattedPaid = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(transaction.paid_amount);

    const formattedChange = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(transaction.change_amount);

    let strukText = "";
    strukText += centerText("*** D+Robotic Car Wash & Coffee ***") + "\n";
    strukText += centerText("Jl. M.H Thamrin No.16A, Sidodadi") + "\n";
    strukText += centerText("Kec. Medan Tim., Kota Medan") + "\n";
    strukText += centerText("Sumatera Utara 20232") + "\n";
    strukText += centerText("Telp: 0821-6024-6588") + "\n\n";
    strukText += drawLine("=") + "\n";
    strukText +=
        leftRightText(`No. Struk: ${transaction.id}`, `${transactionDate}`) +
        "\n";
    strukText += leftRightText(``, `${transactionTime}`) + "\n";
    strukText += drawLine("-") + "\n";
    strukText += `Customer : ${transaction.customer.name}\n`;
    strukText += `Kendaraan: ${transaction.car?.plate_number || "N/A"} ${transaction.car?.model || ""} \n`;
    strukText += drawLine("-") + "\n";
    strukText += "LAYANAN:\n";
    strukText += leftRightText(product.name, formattedPrice) + "\n";
    strukText += drawLine("=") + "\n";
    strukText += leftRightText("TOTAL", formattedPrice) + "\n";
    if (transaction.payment_method == "Cash") {
        strukText += leftRightText(`BAYAR`, formattedPaid) + "\n";
        strukText += leftRightText(`KEMBALIAN`, formattedChange) + "\n\n";
    }
    strukText +=
        leftRightText(`Bayar Via: ${transaction.payment_method}`, "") + "\n\n";
    strukText += centerText("Terima Kasih!") + "\n";
    strukText += centerText("Atas kunjungan Anda") + "\n\n";
    strukText += `*Struk wajib disimpan untuk garansi 1x24 jam` + "\n\n\n\n\n\n";

    const encodedText = encodeURIComponent(strukText);
    window.open(`rawbt:${encodedText}`);
};

interface VoucherPacket {
    id: string;
    name: string;
}
interface PurchasedPacket {
    voucher_packet: VoucherPacket;
}
export interface PacketPurchaseTransaction extends Transaction {
    purchased_packets: PurchasedPacket[];
}

export const printPacketPurchaseReceipt = (
    transaction: PacketPurchaseTransaction,
) => {
    if (
        !transaction?.purchased_packets ||
        transaction.purchased_packets.length === 0
    ) {
        console.error("Data pembelian paket tidak lengkap untuk dicetak.");
        return;
    }

    // Group by voucher_packet.id and count
    const packetMap: Record<string, { name: string; count: number }> = {};
    transaction.purchased_packets.forEach((pp) => {
        const vp = pp.voucher_packet;
        if (!vp) return;
        if (!packetMap[vp.id]) {
            packetMap[vp.id] = { name: vp.name, count: 0 };
        }
        packetMap[vp.id].count += 1;
    });

    const transactionDate = new Date(transaction.created_at).toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        },
    );
    const transactionTime = new Date(transaction.created_at).toLocaleTimeString(
        "id-ID",
        {
            hour: "2-digit",
            minute: "2-digit",
        },
    );
    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(transaction.total_amount);

    const formattedPaid = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(transaction.paid_amount);

    const formattedChange = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(transaction.change_amount);

    let strukText = "";
    strukText += centerText("*** D+Robotic Car Wash & Coffee ***") + "\n";
    strukText += centerText("Jl. M.H Thamrin No.16A, Sidodadi") + "\n";
    strukText += centerText("Kec. Medan Tim., Kota Medan") + "\n";
    strukText += centerText("Sumatera Utara 20232") + "\n";
    strukText += centerText("Telp: 0821-6024-6588") + "\n\n";
    strukText += drawLine("=") + "\n";
    strukText +=
        leftRightText(`No. Struk: ${transaction.id}`, `${transactionDate}`) +
        "\n";
    strukText += leftRightText(``, `${transactionTime}`) + "\n";
    strukText += drawLine("-") + "\n";
    strukText += `Customer : ${transaction.customer.name}\n`;
    strukText += `Kendaraan: ${transaction.car?.plate_number || "N/A"}\n`;
    strukText += drawLine("-") + "\n";
    strukText += "PEMBELIAN PAKET:\n";

    Object.values(packetMap).forEach(({ name, count }) => {
        strukText += leftRightText(`${count} x ${name}`, "") + "\n";
    });
    strukText += drawLine("=") + "\n";
    strukText += leftRightText("TOTAL", formattedPrice) + "\n";
    if (transaction.payment_method == "Cash") {
        strukText += leftRightText(`BAYAR`, formattedPaid) + "\n";
        strukText += leftRightText(`KEMBALIAN`, formattedChange) + "\n\n";
    }
    strukText +=
        leftRightText(`Bayar Via: ${transaction.payment_method}`, "") + "\n\n";
    strukText += centerText("Terima Kasih!") + "\n";
    strukText += centerText("Atas kunjungan Anda") + "\n\n\n\n\n\n";

    const encodedText = encodeURIComponent(strukText);
    window.open(`rawbt:${encodedText}`);
};

export const printSpecialProgramReceipt = (transaction: Transaction) => {
    const transactionDate = new Date(transaction.created_at).toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        },
    );
    const transactionTime = new Date(transaction.created_at).toLocaleTimeString(
        "id-ID",
        {
            hour: "2-digit",
            minute: "2-digit",
        },
    );
    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(transaction.total_amount);

    const formattedPaid = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(transaction.paid_amount);

    const formattedChange = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(transaction.change_amount);

    let strukText = "";
    strukText += centerText("*** D+Robotic Car Wash & Coffee ***") + "\n";
    strukText += centerText("Jl. M.H Thamrin No.16A, Sidodadi") + "\n";
    strukText += centerText("Kec. Medan Tim., Kota Medan") + "\n";
    strukText += centerText("Sumatera Utara 20232") + "\n";
    strukText += centerText("Telp: 0821-6024-6588") + "\n\n";
    strukText += drawLine("=") + "\n";
    strukText +=
        leftRightText(`No. Struk: ${transaction.id}`, `${transactionDate}`) +
        "\n";
    strukText += leftRightText(``, `${transactionTime}`) + "\n";
    strukText += drawLine("-") + "\n";
    strukText += `Customer : ${transaction.customer.name}\n`;
    strukText += `Kendaraan: ${transaction.car?.plate_number || "N/A"}\n`;
    strukText += drawLine("-") + "\n";
    strukText += "LAYANAN:\n";
    strukText += leftRightText("Special Program", formattedPrice) + "\n";
    strukText += drawLine("=") + "\n";
    strukText += leftRightText("TOTAL", formattedPrice) + "\n";
    if (transaction.payment_method == "Cash") {
        strukText += leftRightText(`BAYAR`, formattedPaid) + "\n";
        strukText += leftRightText(`KEMBALIAN`, formattedChange) + "\n\n";
    }
    strukText +=
        leftRightText(`Bayar Via: ${transaction.payment_method}`, "") + "\n\n";
    strukText += centerText("Terima Kasih!") + "\n";
    strukText += centerText("Atas kunjungan Anda") + "\n\n\n\n\n\n";

    const encodedText = encodeURIComponent(strukText);
    window.open(`rawbt:${encodedText}`);
};
