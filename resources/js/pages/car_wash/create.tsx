import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet";
import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem, PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { CarWashButton } from "./component/car-wash-button";
import CreateCashPurchase, {
    CreateCashPurchaseHandle,
} from "./forms/cash-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import CreateVoucherPurchase from "./forms/voucher-form";
import ReturnForm from "./forms/return-form";
import { Input } from "@/components/ui/input";
import { NumericFormat } from "react-number-format";
import { QrCode, Banknote, CreditCard, Landmark } from "lucide-react";
import { TransactionFooter } from "./forms/transaction-footer";
import { Modal, ModalHeader } from "@/components/ui/modal";
import { Alert } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CreateSpecialProgramPurchase from "./forms/special-program-form";
import CarPlateSearch from "./forms/car-plate-search";
import { formatCurrency } from "@/lib/utils";
import formatRupiah from "@/lib/rupiah-formatter";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Pencucian Mobil",
        href: "/car-wash/create",
    },
];

interface ItemProp {
    id: number;
    name: string;
    stock: number;
    price: number;
}

interface Product {
    id: number;
    name: string;
    price: number;
    items?: ItemProp[];
}

interface Stall {
    id: number;
    name: string;
}

interface FooterData {
    product_id: string;
    stall_id: number;
    payment_method?: string;
    nominal_bayar?: number;
    staff_id?: number;
}

type FormType = "Cash" | "Voucher" | "Return" | "Special Program" | null;

export default function CarWashCreate() {
    const { props } = usePage<
        PageProps<{
            products: Product[];
            stalls: Stall[];
            staffs: { id: number; full_name: string }[];
            items: ItemProp[];
        }>
    >();
    const products = props.products || [];
    const stalls = props.stalls || [];
    const staffs = props.staffs || [];

    const paymentOptions: { label: string; type: FormType }[] = [
        { label: "Langsung", type: "Cash" },
        { label: "Voucher", type: "Voucher" },
        // { label: "Garansi Hujan", type: "Return" },
    ];

    const formRef = useRef<CreateCashPurchaseHandle>(null);

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [activeForm, setActiveForm] = useState<FormType>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );
    const [selectedStallId, setSelectedStallId] = useState("");
    const [selectedStaffId, setSelectedStaffId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [nominalBayar, setNominalBayar] = useState("");
    const [footerError, setFooterError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

    const servicePrice = Number(selectedProduct?.price || 0);
    const boundItemIds = selectedProduct?.items?.map((i) => i.id) || [];
    const itemsPrice = (props.items || [])
        .filter(
            (item: ItemProp) =>
                selectedItemIds.includes(item.id) &&
                !boundItemIds.includes(item.id),
        )
        .reduce(
            (sum: number, item: ItemProp) => sum + Number(item.price || 0),
            0,
        );

    const totalHarga = servicePrice + itemsPrice;
    const nilaiBayar = parseFloat(nominalBayar) || 0;
    const kembalian = nilaiBayar > totalHarga ? nilaiBayar - totalHarga : 0;

    const handleFinalSubmit = () => {
        setIsSubmitting(true);
        if (activeForm === "Cash" && !paymentMethod) {
            setFooterError("Pilih metode pembayaran.");
            setIsSubmitting(false);
            return;
        }
        if (activeForm === "Voucher" && itemsPrice > 0 && !paymentMethod) {
            setFooterError("Pilih metode pembayaran untuk barang tambahan.");
            setIsSubmitting(false);
            return;
        }
        setFooterError(null);

        const footerData: FooterData = {
            stall_id: selectedStallId
                ? parseInt(selectedStallId)
                : stalls.length > 0
                  ? stalls[0].id
                  : 1,
            product_id: String(selectedProduct?.id || ""),
            payment_method: paymentMethod,
            nominal_bayar: nilaiBayar,
            staff_id: selectedStaffId ? parseInt(selectedStaffId) : undefined,
        };
        formRef.current?.submit(footerData);
        setTimeout(() => setIsSubmitting(false), 500);
    };

    const openSheet = (formType: FormType) => {
        setActiveForm(formType);
        setIsSheetOpen(true);
    };

    useEffect(() => {
        if (isSheetOpen) {
            const defaultProduct = products.find((p: Product) => p.id === 1);
            if (activeForm) setSelectedProduct(defaultProduct || null);
            if (stalls.length > 0) {
                setSelectedStallId(String(stalls[0].id));
            }
        } else {
            setSelectedProduct(null);
            setSelectedStallId("");
            setNominalBayar("");
            setFooterError(null);
            setPaymentMethod("");
            setIsSubmitting(false);
            setSelectedItemIds([]);
        }
    }, [isSheetOpen, products, activeForm, stalls]);

    useEffect(() => {
        if (selectedProduct && selectedProduct.items) {
            const defaultItemIds = selectedProduct.items.map((item) => item.id);
            setSelectedItemIds(defaultItemIds);
        } else {
            setSelectedItemIds([]);
        }
    }, [selectedProduct]);

    useEffect(() => {
        if (paymentMethod !== "Cash") {
            setNominalBayar("");
        }
    }, [paymentMethod]);

    const renderForm = () => {
        switch (activeForm) {
            case "Cash":
                return (
                    <CreateCashPurchase
                        ref={formRef as React.Ref<CreateCashPurchaseHandle>}
                        onSuccess={() => setIsSheetOpen(false)}
                        items={props.items || []}
                        selectedProduct={selectedProduct}
                        selectedItems={selectedItemIds}
                        setSelectedItems={setSelectedItemIds}
                    />
                );
            case "Voucher":
                return (
                    <CreateVoucherPurchase
                        ref={formRef as any}
                        onSuccess={() => setIsSheetOpen(false)}
                        items={props.items || []}
                        selectedProduct={selectedProduct}
                        selectedItems={selectedItemIds}
                        setSelectedItems={setSelectedItemIds}
                    />
                );
            case "Return":
                return (
                    <ReturnForm
                        ref={formRef as any}
                        onSuccess={() => setIsSheetOpen(false)}
                        onCancel={() => setIsSheetOpen(false)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pencucian Mobil" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min md:grid-cols-1 lg:grid-cols-2 gap-4">
                    {paymentOptions.map((option) => (
                        <CarWashButton
                            key={option.type}
                            label={option.label}
                            onClick={() => openSheet(option.type)}
                        />
                    ))}
                </div>

                {activeForm && (
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetContent
                            side="bottom"
                            className="flex flex-col h-screen w-screen sm:max-w-none border-none p-0"
                        >
                            <SheetHeader className="px-6 py-4 border-b">
                                <SheetTitle>Pembayaran {activeForm}</SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 overflow-y-auto  px-6 space-y-6">
                                {renderForm()}

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="product-select"
                                                required
                                            >
                                                Produk / Layanan
                                            </Label>
                                            <Select
                                                value={String(
                                                    selectedProduct?.id || "",
                                                )}
                                                onValueChange={(productId) => {
                                                    const product =
                                                        products.find(
                                                            (p: Product) =>
                                                                String(p.id) ===
                                                                productId,
                                                        ) || null;
                                                    setSelectedProduct(product);
                                                }}
                                            >
                                                <SelectTrigger
                                                    id="product-select"
                                                    className="w-full"
                                                >
                                                    <SelectValue placeholder="Pilih produk..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map(
                                                        (product: Product) => (
                                                            <SelectItem
                                                                key={product.id}
                                                                value={String(
                                                                    product.id,
                                                                )}
                                                            >
                                                                {product.name} -
                                                                Rp{" "}
                                                                {formatRupiah(
                                                                    product.price,
                                                                )}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="staff-select">
                                                Staff Washer
                                            </Label>
                                            <Select
                                                value={selectedStaffId}
                                                onValueChange={
                                                    setSelectedStaffId
                                                }
                                            >
                                                <SelectTrigger
                                                    id="staff-select"
                                                    className="w-full"
                                                >
                                                    <SelectValue placeholder="Pilih staff washer..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {staffs.map(
                                                        (st: {
                                                            id: number;
                                                            full_name: string;
                                                        }) => (
                                                            <SelectItem
                                                                key={st.id}
                                                                value={String(
                                                                    st.id,
                                                                )}
                                                            >
                                                                {st.full_name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {(activeForm === "Cash" ||
                                        (activeForm === "Voucher" &&
                                            itemsPrice > 0)) && (
                                        <div className="space-y-3">
                                            <Label required>
                                                Metode Pembayaran
                                            </Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {[
                                                    {
                                                        value: "Cash",
                                                        label: "Cash",
                                                        icon: Banknote,
                                                    },
                                                    {
                                                        value: "Debit/Credit",
                                                        label: "Card",
                                                        icon: CreditCard,
                                                    },
                                                    {
                                                        value: "Transfer",
                                                        label: "Transfer",
                                                        icon: Landmark,
                                                    },
                                                    {
                                                        value: "QRIS",
                                                        label: "QRIS",
                                                        icon: QrCode,
                                                    },
                                                ].map((method) => {
                                                    const isSelected =
                                                        paymentMethod ===
                                                        method.value;
                                                    const IconComponent =
                                                        method.icon;
                                                    return (
                                                        <button
                                                            key={method.value}
                                                            type="button"
                                                            onClick={() =>
                                                                setPaymentMethod(
                                                                    method.value,
                                                                )
                                                            }
                                                            className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                                                                isSelected
                                                                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm font-semibold"
                                                                    : "border-muted bg-card hover:bg-accent text-card-foreground"
                                                            }`}
                                                        >
                                                            <IconComponent
                                                                className={`w-5 h-5 ${isSelected ? "text-blue-600" : "text-muted-foreground"}`}
                                                            />
                                                            <span className="text-sm">
                                                                {method.label}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <TransactionFooter
                                totalHarga={totalHarga}
                                servicePrice={servicePrice}
                                itemsPrice={itemsPrice}
                                onFinalSubmit={handleFinalSubmit}
                                onClose={() => setIsSheetOpen(false)}
                                footerError={footerError}
                                isSubmitting={isSubmitting}
                            />
                        </SheetContent>
                    </Sheet>
                )}
            </div>
        </AppLayout>
    );
}
