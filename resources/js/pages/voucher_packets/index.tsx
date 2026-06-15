import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Edit, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import VoucherPacketForm from "./forms/voucher-packet-form";

interface VoucherPacketProp {
    id: number;
    name: string;
    price: number;
    incentive_amount: number;
    quantity: number;
    valid_period_months: number;
    has_unlimited_issuance: boolean;
    assign_on_sale: boolean;
    until_year_end: boolean;
    autogenerate_vouchers: boolean;
    voucher_type: {
        id: number;
        name: string;
    };
    voucher_type_id: number;
    description: string;
}

interface VoucherType {
    id: number;
    name: string;
}

export default function VoucherPacketIndex() {
    const { props } = usePage<
        PageProps<{
            voucherPackets: VoucherPacketProp[];
            voucherTypes: VoucherType[];
        }>
    >();
    const voucherPackets = props.voucherPackets;
    const voucherTypes = props.voucherTypes;

    const voucherPacketFormRef = useRef<{ submit: () => void }>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [selectedVoucherPacket, setSelectedVoucherPacket] =
        useState<VoucherPacketProp | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Packet Voucher",
            href: "/voucher-packets",
        },
    ];

    const renderSubComponent = ({ row }: { row: Row<VoucherPacketProp> }) => {
        return (
            <div className="bg-muted/50 p-4">
                <p className="text-sm text-foreground">
                    <span className="font-semibold">Deskripsi:</span>{" "}
                    {row.original.description || "Tidak ada deskripsi."}
                </p>
            </div>
        );
    };

    const columns: ColumnDef<VoucherPacketProp>[] = [
        {
            accessorKey: "index",
            header: "No",
            cell: (row) => row.row.index + 1,
        },
        { accessorKey: "name", header: "Nama Packet" },
        {
            accessorKey: "price",
            header: "Harga",
            cell: (info) =>
                new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                }).format(info.getValue() as number),
        },
        {
            accessorKey: "incentive_amount",
            header: "Insentif",
            cell: (info) =>
                new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                }).format(info.getValue() as number),
        },
        { accessorKey: "quantity", header: "Jumlah/Packet" },
        { accessorKey: "voucher_type.name", header: "Tipe Voucher" },
        { accessorKey: "valid_period_months", header: "Lama Berlaku" },
        {
            accessorKey: "has_unlimited_issuance",
            header: "Dapat Diperbarui",
            cell: (info) => (info.getValue() ? "Iya" : "Tidak"),
        },
        {
            accessorKey: "assign_on_sale",
            header: "Assign on Sale",
            cell: (info) => (info.getValue() ? "Iya" : "Tidak"),
        },
        { accessorKey: "voucher_type.name", header: "Tipe Voucher" },
        {
            id: "expander",
            header: () => null,
            cell: ({ row }) => {
                return row.getCanExpand() ? (
                    <button
                        className="cursor-pointer"
                        onClick={row.getToggleExpandedHandler()}
                    >
                        {row.getIsExpanded() ? (
                            <ChevronDown size={16} />
                        ) : (
                            <ChevronRight size={16} />
                        )}
                    </button>
                ) : null;
            },
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: (row) => (
                <Button
                    size="icon"
                    variant={"outline"}
                    onClick={() => {
                        setIsEditSheetOpen(true);
                        setSelectedVoucherPacket(row.row.original);
                    }}
                >
                    <Edit />
                </Button>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Packet Voucher" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Packet Voucher"
                        description="Tambahkan, ubah, dan hapus packet voucher."
                    />
                    <Button
                        variant="default"
                        onClick={() => setIsSheetOpen(true)}
                    >
                        Tambah Packet Voucher <Plus />
                    </Button>
                </div>
                <DataTable
                    columns={columns}
                    data={voucherPackets}
                    renderSubComponent={renderSubComponent}
                    getRowCanExpand={() => true}
                />
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Tambah Packet Voucher</SheetTitle>
                        <SheetDescription>
                            Masukkan data packet voucher
                        </SheetDescription>
                    </SheetHeader>
                    <VoucherPacketForm
                        ref={voucherPacketFormRef}
                        voucherTypes={voucherTypes}
                        onSuccess={() => setIsSheetOpen(false)}
                        onCancel={() => setIsSheetOpen(false)}
                    />
                    <SheetFooter>
                        <Button
                            variant={"default"}
                            onClick={() =>
                                voucherPacketFormRef.current?.submit()
                            }
                        >
                            Tambah Packet Voucher
                        </Button>

                        <SheetClose asChild>
                            <Button
                                variant={"secondary"}
                                onClick={() => setIsSheetOpen(false)}
                            >
                                Cancel
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
            <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Edit Packet Voucher</SheetTitle>
                        <SheetDescription>
                            Masukkan data packet voucher
                        </SheetDescription>
                    </SheetHeader>
                    <VoucherPacketForm
                        ref={voucherPacketFormRef}
                        voucherTypes={voucherTypes}
                        voucherPacket={selectedVoucherPacket}
                        onSuccess={() => setIsEditSheetOpen(false)}
                        onCancel={() => setIsEditSheetOpen(false)}
                    />
                    <SheetFooter>
                        <Button
                            variant={"default"}
                            onClick={() =>
                                voucherPacketFormRef.current?.submit()
                            }
                        >
                            Edit Packet Voucher
                        </Button>

                        <SheetClose asChild>
                            <Button
                                variant={"secondary"}
                                onClick={() => setIsEditSheetOpen(false)}
                            >
                                Cancel
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}
