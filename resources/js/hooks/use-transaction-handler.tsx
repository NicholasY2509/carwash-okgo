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
        const midtrans = (page.props.flash as any)?.midtrans;

        if (midtrans) {
            const qrAction = midtrans.actions?.find(
                (a: any) => a.name === "generate-qr-code",
            );
            if (qrAction) {
                onSuccess();
                let pollInterval: any;
                Swal.fire({
                    title: "Scan QRIS",
                    html: `
                        <div class="flex flex-col items-center justify-center gap-4">
                            <p class="text-sm text-gray-600">Scan QR Code di bawah ini untuk menyelesaikan pembayaran</p>
                            <img src="${qrAction.url}" alt="QRIS" class="w-64 h-64 object-contain mx-auto border rounded-lg p-2" />
                            <p class="font-semibold text-lg mt-2">Total: Rp ${new Intl.NumberFormat("id-ID").format(newTransaction?.total_amount || 0)}</p>
                        </div>
                    `,
                    showConfirmButton: true,
                    confirmButtonText: "Tutup",
                    allowOutsideClick: false,
                    didOpen: () => {
                        pollInterval = setInterval(() => {
                            fetch(
                                `/api/transactions/${newTransaction.id}/status`,
                            )
                                .then((res) => res.json())
                                .then((data) => {
                                    if (data.status === "completed") {
                                        clearInterval(pollInterval);
                                        Swal.close();
                                        Swal.fire({
                                            icon: "success",
                                            title: "Pembayaran Berhasil!",
                                            text: "Pembayaran QRIS telah diterima.",
                                            timer: 3000,
                                        });
                                    }
                                })
                                .catch((err) =>
                                    console.error("Polling error:", err),
                                );
                        }, 5000);
                    },
                    willClose: () => {
                        if (pollInterval) {
                            clearInterval(pollInterval);
                        }
                    },
                }).then(() => {
                    reset();
                });
                return;
            }
        }

        if (newTransaction) {
            onSuccess();
            Swal.fire({
                icon: "success",
                title: "Proses Berhasil",
                html: `
                    <div>
                        <p>Transaksi untuk <strong>${
                            newTransaction.customer.name
                        }</strong> berhasil.</p>
                    </div>
                `,
                showConfirmButton: true,
                confirmButtonText: "Tutup",
                // showCancelButton: true,
                // cancelButtonText: "Kirim WhatsApp",
                // cancelButtonColor: "#25D366",
            }).then((result) => {
                if (
                    result.isDismissed &&
                    result.dismiss === Swal.DismissReason.cancel
                ) {
                    // Format phone number: replace leading '0' with '62'
                    let phone = newTransaction.customer.phone || "";
                    if (phone.startsWith("0")) {
                        phone = "62" + phone.substring(1);
                    }

                    const amount = new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                    }).format(newTransaction.total_amount || 0);
                    const product =
                        newTransaction.serviceRecords?.[0]?.product?.name ||
                        "Cuci Mobil";

                    const message = `Halo ${newTransaction.customer.name},\n\nTerima kasih telah menggunakan layanan kami!\n\n*Detail Transaksi:*\nLayanan: ${product}\nTotal: ${amount}\n\nSemoga harimu menyenangkan!`;

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
                text: "Berhasil Menyelesaikan Transaksi.",
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
