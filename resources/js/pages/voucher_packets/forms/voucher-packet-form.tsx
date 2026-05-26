import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "@inertiajs/react";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import Swal from "sweetalert2";
import { NumericFormat } from "react-number-format";
import { Description } from "@radix-ui/react-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import { toast } from "sonner";

export interface CreateVoucherPacketHandle {
    submit: () => void;
}

interface VoucherType {
    id: number;
    name: string;
}

interface VoucherPacket {
    id: number;
    name: string;
    price: number;
    quantity: number;
    valid_period_months: number;
    has_unlimited_issuance: boolean;
    assign_on_sale: boolean;
    until_year_end: boolean;
    voucher_type: {
        id: number;
        name: string;
    };
    voucher_type_id: number;
    description: string;
    expired_date?: string;
    autogenerate_vouchers: boolean;
}

interface CreateVoucherPacketProps {
    voucherTypes: VoucherType[];
    voucherPacket?: VoucherPacket | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const VoucherPacketForm = forwardRef<
    CreateVoucherPacketHandle,
    CreateVoucherPacketProps
>(({ voucherTypes, onSuccess, voucherPacket }, ref) => {
    const formRef = useRef<HTMLFormElement>(null);

    const isEditMode = !!voucherPacket;

    const { setData, data, post, patch, processing, errors, reset } = useForm({
        name: voucherPacket?.name ?? "",
        price: voucherPacket?.price?.toString() ?? "",
        quantity: voucherPacket?.quantity?.toString() ?? "",
        valid_period_months:
            voucherPacket?.valid_period_months?.toString() ?? "",
        until_year_end: voucherPacket?.until_year_end ?? false,
        has_unlimited_issuance: voucherPacket?.has_unlimited_issuance ?? false,
        assign_on_sale: voucherPacket?.assign_on_sale ?? false,
        autogenerate_vouchers: voucherPacket?.autogenerate_vouchers ?? false,
        voucher_type_id: voucherPacket?.voucher_type_id.toString() ?? "",
        description: voucherPacket?.description ?? "",
        expired_date: voucherPacket?.expired_date ?? "",
    });

    useImperativeHandle(ref, () => ({
        submit: () => {
            formRef.current?.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true }),
            );
        },
    }));

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const handleSuccess = () => {
            reset();
            toast.success(
                `Packet voucher telah berhasil ${
                    isEditMode ? "diperbarui" : "ditambahkan"
                }.`,
            );
            onSuccess();
        };

        if (isEditMode) {
            patch(route("voucher-packets.update", voucherPacket?.id || ""), {
                onSuccess: handleSuccess,
                onError: () => {},
            });
            return;
        } else {
            post(route("voucher-packets.store"), {
                onSuccess: handleSuccess,
                onError: (errors) => {
                    console.error("Form submission error:", errors);
                },
                preserveScroll: true,
            });
        }
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="h-full px-4">
            <fieldset disabled={processing} className="space-y-2">
                <div>
                    <Label htmlFor="name">Nama Packet</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        autoComplete="off"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="voucher_type_id">Tipe Voucher</Label>
                    <Select
                        value={data.voucher_type_id}
                        onValueChange={(value) =>
                            setData("voucher_type_id", value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe voucher" />
                        </SelectTrigger>
                        <SelectContent>
                            {voucherTypes.map((type) => (
                                <SelectItem
                                    key={type.id}
                                    value={String(type.id)}
                                >
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.voucher_type_id && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.voucher_type_id}
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="price">Harga</Label>
                    <NumericFormat
                        id="price"
                        customInput={Input}
                        prefix={"Rp "}
                        thousandSeparator="."
                        decimalSeparator=","
                        value={data.price}
                        onValueChange={(values) => {
                            setData(
                                "price",
                                values.floatValue?.toString() || "",
                            );
                        }}
                        className="mt-1"
                    />
                    {errors.price && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.price}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="quantity">Jumlah Voucher</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={data.quantity}
                            onChange={(e) =>
                                setData("quantity", e.target.value)
                            }
                            min="1"
                        />
                        {errors.quantity && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.quantity}
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        <Label htmlFor="valid_period_months">
                            Masa Aktif(Bulan)
                        </Label>
                        <Input
                            id="valid_period_months"
                            type="number"
                            value={data.valid_period_months}
                            onChange={(e) =>
                                setData("valid_period_months", e.target.value)
                            }
                            className=""
                            min="1"
                        />
                        <div className="flex flex-row items-center gap-1 mt-1">
                            <Checkbox
                                id="until_year_end"
                                checked={data.until_year_end}
                                onCheckedChange={(checked) =>
                                    setData("until_year_end", !!checked)
                                }
                            />
                            <Label
                                htmlFor="until_year_end"
                                className="text-xs text-muted-foreground"
                            >
                                Sampai Akhir Tahun
                            </Label>
                        </div>

                        {errors.valid_period_months && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.valid_period_months}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="expired_date">
                            Tanggal Kadaluarsa (Opsional)
                        </Label>
                        <Input
                            id="expired_date"
                            type="date"
                            value={data.expired_date}
                            onChange={(e) =>
                                setData("expired_date", e.target.value)
                            }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Jika diisi, akan mengabaikan masa aktif bulan
                        </p>
                        {errors.expired_date && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.expired_date}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData("description", e.target.value)}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="has_unlimited_issuance"
                        checked={data.has_unlimited_issuance}
                        onCheckedChange={(checked) =>
                            setData("has_unlimited_issuance", !!checked)
                        }
                    />
                    <Label
                        htmlFor="has_unlimited_issuance"
                        className="leading-snug"
                    >
                        Dapat Diperbarui
                        <p className="text-xs text-muted-foreground">
                            Customer dapat mengambil voucher baru jika masa
                            aktif masih berlaku
                        </p>
                    </Label>
                </div>
                {errors.has_unlimited_issuance && (
                    <p className="text-sm text-red-600">
                        {errors.has_unlimited_issuance}
                    </p>
                )}
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="assign_on_sale"
                        checked={data.assign_on_sale}
                        onCheckedChange={(checked) =>
                            setData("assign_on_sale", !!checked)
                        }
                    />
                    <Label htmlFor="assign_on_sale" className="leading-snug">
                        Assign on Sale
                        <p className="text-xs text-muted-foreground">
                            Ketika dijual, maka harus memilih nomor voucher
                        </p>
                    </Label>
                </div>
                {errors.has_unlimited_issuance && (
                    <p className="text-sm text-red-600">
                        {errors.has_unlimited_issuance}
                    </p>
                )}
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="autogenerate_vouchers"
                        checked={data.autogenerate_vouchers}
                        onCheckedChange={(checked) =>
                            setData("autogenerate_vouchers", !!checked)
                        }
                    />
                    <Label
                        htmlFor="autogenerate_vouchers"
                        className="leading-snug"
                    >
                        Autogenerate Vouchers
                        <p className="text-xs text-muted-foreground">
                            Otomatis membuat voucher saat paket terjual (tidak
                            perlu pilih manual)
                        </p>
                    </Label>
                </div>
                {errors.autogenerate_vouchers && (
                    <p className="text-sm text-red-600">
                        {errors.autogenerate_vouchers}
                    </p>
                )}
            </fieldset>
        </form>
    );
});

export default VoucherPacketForm;
