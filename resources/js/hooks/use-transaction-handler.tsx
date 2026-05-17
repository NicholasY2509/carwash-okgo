import Swal from "sweetalert2";
import { toast } from "sonner";

interface UseTransactionHandlerProps {
    onSuccess: () => void;
    reset: () => void;
}

export const useTransactionHandler = ({
    onSuccess,
    reset,
}: UseTransactionHandlerProps) => {
    const handleSuccess = (
        page: any,
        printFunction?: (transaction: any) => void,
    ) => {
        const newTransaction = (page.props.flash as any)?.transaction;

        if (newTransaction) {
            onSuccess();
            Swal.fire({
                icon: "success",
                title: "Proses Berhasil",
                html: `
                    <div>
                        <p>Transaksi untuk <strong>${newTransaction.customer.name
                    }</strong> berhasil.</p>
                        <p>No. Referensi: <strong>${newTransaction.id}</strong></p>
                    </div>
                `,
                showConfirmButton: true,
                confirmButtonText: "Tutup",
                // showCancelButton: true,
                // cancelButtonText: "Kirim WhatsApp",
                // cancelButtonColor: "#25D366",
            }).then((result) => {
                if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
                    // Format phone number: replace leading '0' with '62'
                    let phone = newTransaction.customer.phone || "";
                    if (phone.startsWith("0")) {
                        phone = "62" + phone.substring(1);
                    }

                    const amount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(newTransaction.total_amount || 0);
                    const product = newTransaction.serviceRecords?.[0]?.product?.name || "Cuci Mobil";

                    const message = `Halo ${newTransaction.customer.name},\n\nTerima kasih telah menggunakan layanan kami!\n\n*Detail Transaksi:*\nNo. Referensi: ${newTransaction.id}\nLayanan: ${product}\nTotal: ${amount}\n\nSemoga harimu menyenangkan!`;

                    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                    window.open(waUrl, "_blank");
                }
                reset();
            });
        } else {
            console.error(
                "Data transaksi tidak ditemukan di dalam flash props!",
            );
            Swal.fire({
                icon: "success",
                title: "Proses Berhasil",
                text: "Berhasil Mneyelesaikan Transaksi.",
                showConfirmButton: true,
            });
            onSuccess();
            reset();
        }
    };

    const handleError = () => {
        Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Terjadi kesalahan saat menyimpan data.",
        });
    };

    return { handleSuccess, handleError };
};
