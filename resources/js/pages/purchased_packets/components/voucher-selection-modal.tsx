import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { LoaderCircle, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface AvailableVoucher {
    id: string;
    serial_number: string;
}

interface VoucherPackageProp {
    quantity: number;
}

interface VoucherSelectionModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    isLoading: boolean;
    availableVouchers: AvailableVoucher[];
    selectedVoucherIds: string[];
    onVoucherCheckboxChange: (voucherId: string, checked: boolean) => void;
    onSave: () => void;
    selectedVoucherPacket: VoucherPackageProp | null;
    packetAmount: number;
}

export function VoucherSelectionModal({
    isOpen,
    onOpenChange,
    isLoading,
    availableVouchers,
    selectedVoucherIds,
    onVoucherCheckboxChange,
    onSave,
    selectedVoucherPacket,
    packetAmount,
}: VoucherSelectionModalProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const vouchersPerPacket = selectedVoucherPacket?.quantity || 1;
    const selectionLimit = (packetAmount || 1) * vouchersPerPacket;

    const canSelectMore = selectedVoucherIds.length < selectionLimit;
    const isVoucherDisabled = (voucherId: string) => {
        return !selectedVoucherIds.includes(voucherId) && !canSelectMore;
    };

    const handleVoucherCheckboxChange = (
        voucherId: string,
        checked: boolean,
    ) => {
        if (checked && !canSelectMore) return;
        onVoucherCheckboxChange(voucherId, checked);
    };

    const filteredVouchers = availableVouchers.filter((voucher) =>
        voucher.serial_number.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) setSearchQuery("");
                onOpenChange(open);
            }}
        >
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Pilih Nomor Voucher</AlertDialogTitle>
                    <AlertDialogDescription>
                        Pilih {vouchersPerPacket} nomor voucher per paket.
                        <br />
                        Terpilih: {selectedVoucherIds.length} / {selectionLimit}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Cari serial number voucher..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto p-4 border rounded-md">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredVouchers.length > 0 ? (
                                filteredVouchers.map((voucher) => (
                                    <div
                                        key={voucher.id}
                                        className="flex items-center space-x-2 border rounded p-2"
                                    >
                                        <Checkbox
                                            id={`voucher-${voucher.id}`}
                                            checked={selectedVoucherIds.includes(
                                                voucher.id,
                                            )}
                                            onCheckedChange={(checked) =>
                                                handleVoucherCheckboxChange(
                                                    voucher.id,
                                                    !!checked,
                                                )
                                            }
                                            disabled={isVoucherDisabled(
                                                voucher.id,
                                            )}
                                        />
                                        <label
                                            htmlFor={`voucher-${voucher.id}`}
                                            className="text-sm font-medium leading-none cursor-pointer"
                                        >
                                            {voucher.serial_number}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-sm text-muted-foreground p-4">
                                    Voucher tidak ditemukan.
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {!canSelectMore && (
                    <div className="text-xs text-red-500 mt-2">
                        Maksimal {selectionLimit} voucher dapat dipilih sesuai
                        jumlah paket yang dibeli.
                    </div>
                )}
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={onSave}>
                        Simpan Pilihan
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
