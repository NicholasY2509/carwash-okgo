import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import VoucherPacketCard from "./components/voucher-packet-card";
import { Ticket } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectContent,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { NumericFormat } from "react-number-format";
import { QrCode, Banknote, CreditCard, Landmark } from "lucide-react";
import CreatePurchasedPacketForm, {
    CreatePurchasedPacketHandle,
} from "./forms/create-purchased-packets";
import Swal from "sweetalert2";
import axios from "axios";
import Heading from "@/components/heading";
import { VoucherSelectionModal } from "./components/voucher-selection-modal";
import { toast } from "sonner";
import { TransactionFooter } from "@/pages/car_wash/forms/transaction-footer";

export interface AvailableVoucher {
    id: string;
    serial_number: string;
}

interface FooterData {
    payment_method: string;
    nominal_pembayaran?: number;
    voucher_ids?: string[];
    quantity: number;
}

interface VoucherPackageProp {
    voucher_type: { id: number; name: string; only_one_car: boolean };
    id: string;
    name: string;
    price: number;
    quantity: number;
    valid_period_months: number;
    has_unlimited_issuance: boolean;
    assign_on_sale: boolean;
    description: string;
}

export default function CreatePurchasedPacket() {
    const { props } =
        usePage<PageProps<{ voucherPackets: VoucherPackageProp[] }>>();
    console.log(props);
    const voucherPackets = props.voucherPackets;

    const [selectedVoucherPacket, setSelectedVoucherPacket] =
        useState<VoucherPackageProp | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const purchasedPacketFormRef = useRef<CreatePurchasedPacketHandle>(null);
    const [selectedMetodePembayaran, setSelectedMetodePembayaran] = useState<
        string | null
    >(null);
    const [footerError, setFooterError] = useState<string | null>(null);

    const [isAlertOpen, setAlertOpen] = useState(false);
    const [availableVouchers, setAvailableVouchers] = useState<
        AvailableVoucher[]
    >([]);
    const [selectedVoucherIds, setSelectedVoucherIds] = useState<string[]>([]);
    const [isVoucherLoading, setIsVoucherLoading] = useState(false);

    const [quantity, setQuantity] = useState(1);
    const [isFormSubmitting, setIsFormSubmitting] = useState(false);

    const totalHarga = (selectedVoucherPacket?.price || 0) * quantity;

    const requiredVoucherCount =
        (selectedVoucherPacket?.quantity || 0) * quantity;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Pembelian Packet Voucher",
            href: "/purchased-packets/create",
        },
    ];

    useEffect(() => {
        if (isAlertOpen && selectedVoucherPacket) {
            setIsVoucherLoading(true);
            axios
                .get(
                    `/api/vouchers/available?voucher_type_id=${selectedVoucherPacket.voucher_type.id}`,
                )
                .then((response) => {
                    setAvailableVouchers(response.data);
                })
                .catch((error) => {
                    console.error("Gagal mengambil voucher:", error);
                    toast.error("Gagal memuat voucher.");
                })
                .finally(() => {
                    setIsVoucherLoading(false);
                });
        }
    }, [isAlertOpen, selectedVoucherPacket]);

    const handleCardClick = (packet: VoucherPackageProp) => {
        setSelectedVoucherPacket(packet);
        setIsSheetOpen(true);
    };

    const handleSheetOpenChange = (open: boolean) => {
        setIsSheetOpen(open);
        if (!open) {
            setSelectedVoucherPacket(null);
            setSelectedMetodePembayaran(null);
            setFooterError(null);
            setSelectedVoucherIds([]);
            setIsFormSubmitting(false);
        }
    };

    const handleFinalSubmit = () => {
        if (!selectedMetodePembayaran) {
            setFooterError("Pilih metode pembayaran terlebih dahulu.");
            return;
        }
        if (
            selectedVoucherPacket?.assign_on_sale &&
            selectedVoucherIds.length !== requiredVoucherCount
        ) {
            setFooterError(
                `Anda harus memilih tepat ${requiredVoucherCount} voucher.`,
            );
            return;
        }

        setFooterError(null);

        const footerData: FooterData = {
            payment_method: selectedMetodePembayaran,
            voucher_ids: selectedVoucherIds,
            quantity: quantity,
        };

        if (purchasedPacketFormRef.current) {
            setIsFormSubmitting(true);
            purchasedPacketFormRef.current.submit(footerData);
        }
    };

    const handleVoucherCheckboxChange = (
        voucherId: string,
        checked: boolean,
    ) => {
        setSelectedVoucherIds((prevIds) => {
            if (checked) {
                if (prevIds.length >= requiredVoucherCount) {
                    toast.error(
                        `Anda hanya dapat memilih ${requiredVoucherCount} voucher.`,
                    );
                    return prevIds;
                }
                return [...prevIds, voucherId];
            } else {
                return prevIds.filter((id) => id !== voucherId);
            }
        });
    };

    const handleSaveSelectedVouchers = () => {
        if (selectedVoucherIds.length !== requiredVoucherCount) {
            toast.error(
                `Anda harus memilih tepat ${requiredVoucherCount} voucher.`,
            );
            return;
        }
        setAlertOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Beli Packet Voucher" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Pembelian Voucher"
                        description="Pilih Paket Voucher yang akan dibeli."
                    />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {voucherPackets.length > 0 ? (
                        voucherPackets.map(
                            (voucherPackage: VoucherPackageProp) => (
                                <VoucherPacketCard
                                    key={voucherPackage.id}
                                    voucherPacket={voucherPackage}
                                    onClick={() =>
                                        handleCardClick(voucherPackage)
                                    }
                                />
                            ),
                        )
                    ) : (
                        <div className="col-span-3 flex flex-col items-center justify-center rounded-md border-2 border-dashed p-10 text-center">
                            <Ticket className="text-muted-foreground h-10 w-10" />
                            <h3 className="mt-4 text-lg font-semibold">
                                Belum Ada Packet Voucher Terdaftar
                            </h3>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Tambahkan Packet voucher terlebih dahulu untuk
                                memulai.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
                {selectedVoucherPacket && (
                    <SheetContent side="bottom" className="flex flex-col h-screen w-screen sm:max-w-none border-none p-0">
                        <SheetHeader className="px-6 py-4 border-b">
                            <SheetTitle>
                                {selectedVoucherPacket.name}
                            </SheetTitle>
                            <SheetDescription>
                                {selectedVoucherPacket.description}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-6 pt-4">
                            <CreatePurchasedPacketForm
                                ref={purchasedPacketFormRef}
                                voucherPacketId={selectedVoucherPacket.id}
                                onSuccess={() => handleSheetOpenChange(false)}
                            />

                            <div className="space-y-6">
                                <div className="flex items-center justify-between gap-2 border-t pt-6">
                                    <Label className="text-base">
                                        Jumlah Paket
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                setQuantity((q) =>
                                                    Math.max(1, q - 1),
                                                )
                                            }
                                            disabled={quantity <= 1}
                                        >
                                            -
                                        </Button>
                                        <span className="px-3 text-lg font-semibold">
                                            {quantity}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                setQuantity(
                                                    (q) => q + 1,
                                                )
                                            }
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label required className="text-base">Metode Pembayaran</Label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { value: "Cash", label: "Cash", icon: Banknote },
                                            { value: "Debit/Credit", label: "Card", icon: CreditCard },
                                            { value: "Transfer", label: "Transfer", icon: Landmark },
                                            { value: "QRIS", label: "QRIS", icon: QrCode },
                                        ].map((method) => {
                                            const isSelected = selectedMetodePembayaran === method.value;
                                            const IconComponent = method.icon;
                                            return (
                                                <button
                                                    key={method.value}
                                                    type="button"
                                                    onClick={() => setSelectedMetodePembayaran(method.value)}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-200 ${isSelected
                                                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm font-semibold"
                                                        : "border-muted bg-card hover:bg-accent text-card-foreground"
                                                        }`}
                                                >
                                                    <IconComponent className={`w-5 h-5 ${isSelected ? "text-blue-600" : "text-muted-foreground"}`} />
                                                    <span className="text-sm">{method.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>


                                {!!selectedVoucherPacket.assign_on_sale && (
                                    <div className="pt-2">
                                        <Button
                                            variant="secondary"
                                            className="w-full sm:w-auto"
                                            onClick={() =>
                                                setAlertOpen(true)
                                            }
                                        >
                                            Pilih Voucher (
                                            {selectedVoucherIds.length}/
                                            {requiredVoucherCount})
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <TransactionFooter
                            totalHarga={totalHarga}
                            onFinalSubmit={handleFinalSubmit}
                            onClose={() => handleSheetOpenChange(false)}
                            footerError={footerError}
                            isSubmitting={isFormSubmitting}
                        />
                    </SheetContent>
                )}
            </Sheet>

            <VoucherSelectionModal
                isOpen={isAlertOpen}
                onOpenChange={setAlertOpen}
                isLoading={isVoucherLoading}
                availableVouchers={availableVouchers}
                selectedVoucherIds={selectedVoucherIds}
                onVoucherCheckboxChange={handleVoucherCheckboxChange}
                onSave={handleSaveSelectedVouchers}
                selectedVoucherPacket={selectedVoucherPacket}
                packetAmount={quantity}
            />
        </AppLayout>
    );
}
