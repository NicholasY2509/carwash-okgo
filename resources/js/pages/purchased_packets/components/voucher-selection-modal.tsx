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
import { LoaderCircle } from "lucide-react";
import { useMemo } from "react";

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
    const vouchersPerPacket = selectedVoucherPacket?.quantity || 1;
    const selectionLimit = (packetAmount || 1) * vouchersPerPacket;
    const voucherGroups = useMemo(() => {
        const groups: AvailableVoucher[][] = [];
        for (let i = 0; i < availableVouchers.length; i += vouchersPerPacket) {
            groups.push(availableVouchers.slice(i, i + vouchersPerPacket));
        }
        return groups;
    }, [availableVouchers, vouchersPerPacket]);
    const isGroupSelected = (group: AvailableVoucher[]) =>
        group.every((voucher) => selectedVoucherIds.includes(voucher.id));
    const isGroupIndeterminate = (group: AvailableVoucher[]) =>
        group.some((voucher) => selectedVoucherIds.includes(voucher.id)) &&
        !isGroupSelected(group);
    const getGroupCheckedState = (group: AvailableVoucher[]) => {
        if (isGroupSelected(group)) return true;
        if (isGroupIndeterminate(group)) return "indeterminate";
        return false;
    };
    const canSelectMore = selectedVoucherIds.length < selectionLimit;
    const isVoucherDisabled = (voucherId: string) => {
        return !selectedVoucherIds.includes(voucherId) && !canSelectMore;
    };
    const isGroupDisabled = (group: AvailableVoucher[]) => {
        if (group.every((voucher) => selectedVoucherIds.includes(voucher.id)))
            return false;
        if (selectedVoucherIds.length + group.length > selectionLimit)
            return true;
        return !canSelectMore;
    };
    const handleGroupCheckboxChange = (
        group: AvailableVoucher[],
        checked: boolean,
    ) => {
        if (checked) {
            const availableSlots = selectionLimit - selectedVoucherIds.length;
            const toAdd = group
                .filter((voucher) => !selectedVoucherIds.includes(voucher.id))
                .slice(0, availableSlots);
            toAdd.forEach((voucher) => {
                onVoucherCheckboxChange(voucher.id, true);
            });
        } else {
            group.forEach((voucher) => {
                onVoucherCheckboxChange(voucher.id, false);
            });
        }
    };
    const handleVoucherCheckboxChange = (
        voucherId: string,
        checked: boolean,
    ) => {
        if (checked && !canSelectMore) return;
        onVoucherCheckboxChange(voucherId, checked);
    };
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Pilih Nomor Voucher</AlertDialogTitle>
                    <AlertDialogDescription>
                        Pilih {vouchersPerPacket} nomor voucher per paket.
                        <br />
                        Terpilih: {selectedVoucherIds.length} / {selectionLimit}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto p-2 border rounded-md">
                        <div className="space-y-4">
                            {voucherGroups.map((group, idx) => (
                                <div key={idx} className="border rounded p-2">
                                    <div className="flex items-center mb-2">
                                        <Checkbox
                                            id={`group-${idx}`}
                                            checked={getGroupCheckedState(
                                                group,
                                            )}
                                            onCheckedChange={(checked) =>
                                                handleGroupCheckboxChange(
                                                    group,
                                                    checked === true,
                                                )
                                            }
                                            disabled={isGroupDisabled(group)}
                                        />
                                        <label
                                            htmlFor={`group-${idx}`}
                                            className="ml-2 font-semibold cursor-pointer"
                                        >
                                            Group {idx + 1} (Vouchers{" "}
                                            {group[0]?.serial_number} -{" "}
                                            {
                                                group[group.length - 1]
                                                    ?.serial_number
                                            }
                                            )
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {group.map((voucher) => (
                                            <div
                                                key={voucher.id}
                                                className="flex items-center space-x-2"
                                            >
                                                <Checkbox
                                                    id={`voucher-${voucher.id}`}
                                                    checked={selectedVoucherIds.includes(
                                                        voucher.id,
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
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
                                        ))}
                                    </div>
                                </div>
                            ))}
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
