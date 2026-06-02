import { useState, useEffect } from "react";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import { X } from "lucide-react";

interface VoucherType {
    id: string;
    name: string;
}

interface EditVoucherModalProps {
    open: boolean;
    onClose: () => void;
    voucherTypes: VoucherType[];
    onSuccess: () => void;
}

const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Sold", label: "Sold" },
    { value: "Redeemed", label: "Redeemed" },
    { value: "Expired", label: "Expired" },
    { value: "Void", label: "Void" },
];

export default function EditVoucherModal({ open, onClose, voucherTypes, onSuccess }: EditVoucherModalProps) {
    const [currentSerial, setCurrentSerial] = useState("");
    const [serials, setSerials] = useState<string[]>([]);
    const [allSerials, setAllSerials] = useState<string[]>([]);
    const [voucherTypeId, setVoucherTypeId] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/vouchers/serials")
            .then(res => res.json())
            .then(data => setAllSerials(data));
    }, []);

    const handleAddSerial = () => {
        const code = currentSerial.trim();
        if (!code) return;
        if (serials.includes(code)) {
            setError(`Nomor seri \"${code}\" sudah ada.`);
            return;
        }
        if (!allSerials.includes(code)) {
            setError(`Nomor seri \"${code}\" tidak ditemukan di database.`);
            return;
        }
        setError(null);
        setSerials([...serials, code]);
        setCurrentSerial("");
    };

    const handleRemoveSerial = (codeToRemove: string) => {
        setSerials(serials.filter((code) => code !== codeToRemove));
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddSerial();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (serials.length === 0) {
            setError("Masukkan minimal satu nomor seri voucher.");
            return;
        }
        if (!voucherTypeId && !status) {
            setError("Pilih tipe voucher atau status untuk diubah.");
            return;
        }
        setError(null);
        setProcessing(true);
        router.post(route("vouchers.batch_update"), {
            serial_numbers: serials,
            voucher_type_id: voucherTypeId,
            status,
        }, {
            onSuccess: () => {
                toast.success("Voucher berhasil diperbarui.");
                setSerials([]);
                setCurrentSerial("");
                setVoucherTypeId(undefined);
                setStatus(undefined);
                onSuccess();
            },
            onError: (errors) => {
                setError(
                    errors.status ||
                    errors.serial_numbers ||
                    errors.message ||
                    Object.values(errors)[0]
                );
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader title="Edit Voucher (Batch)" />
            <form onSubmit={handleSubmit} className="space-y-6 p-4">
                <div>
                    <Label required>Nomor Seri Voucher</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="e.g., 2015"
                            value={currentSerial}
                            onChange={e => setCurrentSerial(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                        />
                        <Button type="button" onClick={handleAddSerial}>
                            Tambah
                        </Button>
                    </div>
                    <div className="flex min-h-[60px] flex-wrap gap-2 rounded-md border p-2 mt-2">
                        {serials.length === 0 ? (
                            <span className="p-2 text-sm text-muted-foreground">
                                Nomor seri yang dipilih akan muncul di sini...
                            </span>
                        ) : (
                            serials.map((code) => (
                                <span key={code} className="inline-flex items-center bg-muted px-3 py-1 rounded-md text-sm">
                                    {code}
                                    <button
                                        type="button"
                                        className="ml-2 rounded-full p-0.5 hover:bg-destructive/80"
                                        onClick={() => handleRemoveSerial(code)}
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))
                        )}
                    </div>
                </div>
                <div>
                    <Label>Tipe Voucher</Label>
                    <Select value={voucherTypeId} onValueChange={v => {
                        console.log("Selected voucherTypeId:", v);
                        setVoucherTypeId(v);
                    }}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih tipe voucher" />
                        </SelectTrigger>
                        <SelectContent>
                            {voucherTypes.map(type => (
                                <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="text-xs text-muted-foreground">
                    Catatan: Status voucher hanya bisa diubah menjadi <b>Redeemed</b> jika status saat ini bukan Redeemed. Voucher yang sudah Redeemed tidak bisa diubah ke status lain.
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={processing}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={processing}>
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
        </Modal>
    );
} 