import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useMemo, memo, useCallback } from "react";
import { currencyFormatter } from "@/lib/currency-formatter";

interface TransactionFooterProps {
    totalHarga: number;
    servicePrice?: number;
    itemsPrice?: number;
    onFinalSubmit: () => void;
    onClose: () => void;
    footerError: string | null;
    canSubmit?: boolean;
    isSubmitting?: boolean;
}

export const TransactionFooter = memo(function TransactionFooter({
    totalHarga,
    servicePrice,
    itemsPrice,
    onFinalSubmit,
    onClose,
    footerError,
    canSubmit = true,
    isSubmitting = false,
}: TransactionFooterProps) {
    const formattedTotalHarga = useMemo(
        () => currencyFormatter.format(totalHarga),
        [totalHarga],
    );

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleFinalSubmit = useCallback(() => {
        onFinalSubmit();
    }, [onFinalSubmit]);

    return (
        <div className="flex-col px-6 py-4 border-t bg-card text-card-foreground shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col w-full sm:w-auto">
                    <div className="flex items-center gap-4 justify-between sm:justify-start">
                        <span className="text-muted-foreground text-sm font-medium">Total Harga:</span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                            {formattedTotalHarga}
                        </span>
                    </div>
                    {((servicePrice !== undefined && servicePrice > 0) || (itemsPrice !== undefined && itemsPrice > 0)) && (
                        <div className="text-xs text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            {servicePrice !== undefined && servicePrice > 0 && (
                                <div className="flex items-center gap-1">
                                    <span>Layanan:</span>
                                    <span className="font-semibold text-foreground">{currencyFormatter.format(servicePrice)}</span>
                                </div>
                            )}
                            {itemsPrice !== undefined && itemsPrice > 0 && (
                                <div className="flex items-center gap-1">
                                    <span>Barang Tambahan:</span>
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{currencyFormatter.format(itemsPrice)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {footerError && (
                    <div className="text-sm text-red-600 font-medium">
                        {footerError}
                    </div>
                )}

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <Button
                        variant={"outline"}
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none px-6"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={"default"}
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting || !canSubmit}
                        className="flex-1 sm:flex-none px-8 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isSubmitting ? "Memproses..." : "Buat Pembayaran"}
                    </Button>
                </div>
            </div>
        </div>
    );
});
