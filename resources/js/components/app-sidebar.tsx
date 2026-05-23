import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { type NavItem } from "@/types";
import { Link } from "@inertiajs/react";
import {
    Box,
    Package,
    Car,
    Home,
    IdCard,
    ReceiptText,
    Settings2,
    Ticket,
    User2,
    Wrench,
    FileBarChart2,
    Tv,
} from "lucide-react";
import AppLogo from "./app-logo";
import { url } from "inspector";
import { permission, title } from "process";
import { usePermission } from "@/hooks/use-permission";
import { useMemo } from "react";

const footerNavItems: NavItem[] = [];

const allNavItems = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: Home,
        },
        {
            title: "Pencucian Mobil",
            url: "/car-washes/create",
            icon: Car,
        },
        {
            title: "Pembelian Voucher",
            url: "/purchased-packets/create",
            icon: Ticket,
        },
        {
            title: "Antrian",
            url: "/queue",
            icon: Tv,
        },
        {
            title: "Produk",
            icon: Box,
            items: [
                {
                    title: "Daftar Produk",
                    url: "/products",
                },
                {
                    title: "Pihak Bagi Hasil",
                    url: "/parties",
                },
            ],
        },
        {
            title: "Stok & Barang",
            icon: Package,
            items: [
                {
                    title: "Daftar Barang",
                    url: "/items",
                },
                {
                    title: "Daftar Supplier",
                    url: "/suppliers",
                },
                {
                    title: "Pembelian Stok",
                    url: "/purchases",
                },
                {
                    title: "Pergerakan Stok",
                    url: "/stock-adjustments",
                },
            ],
        },
        {
            title: "Transaksi",
            icon: ReceiptText,
            items: [
                {
                    title: "Packet Voucher",
                    url: "/purchased-packets",
                },
                {
                    title: "Pencucian Mobil",
                    url: "/car-washes",
                },
                {
                    title: "Riwayat Penjualan",
                    url: "/sales-transactions",
                },
            ],
        },
        {
            title: "Customer",
            icon: User2,
            items: [
                {
                    title: "Daftar Customer",
                    url: "/customers",
                },
                {
                    title: "Daftar Mobil Customer",
                    url: "/cars",
                },
                {
                    title: "Tipe Mobil",
                    url: "/car-types",
                },
            ],
        },
        {
            title: "Stall",
            icon: Wrench,
            items: [
                {
                    title: "Jadwal Stall",
                    url: "/stall-assignments",
                },
                {
                    title: "Daftar Stall",
                    url: "/stalls",
                },
            ],
        },
        {
            title: "Staff",
            icon: IdCard,
            items: [
                {
                    title: "Insentif Staf",
                    url: "/staff-incentives/summary",
                },
                {
                    title: "Insentif Staf (SPV)",
                    url: "/staff-incentives",
                },
                {
                    title: "Daftar Staff",
                    url: "/staffs",
                },
                {
                    title: "Posisi Kerja",
                    url: "/work-positions",
                },
            ],
        },
        {
            title: "Laporan",
            icon: FileBarChart2,
            items: [
                {
                    title: "Omset Cuci Mobil",
                    url: "/reports/car-wash-revenue",
                },
                {
                    title: "Penjualan Voucher",
                    url: "/reports/voucher-sales",
                },
                {
                    title: "Stok Barang",
                    url: "/reports/stock",
                },
                {
                    title: "Bagi Hasil",
                    url: "/reports/split-profit",
                },
            ],
        },
        {
            title: "Voucher",
            icon: Ticket,
            items: [
                {
                    title: "Daftar Voucher",
                    url: "/vouchers",
                },
                {
                    title: "Paket Voucher",
                    url: "/voucher-packets",
                },
                {
                    title: "Tipe Voucher",
                    url: "/voucher-types",
                },
            ],
        },
        {
            title: "Settings",
            icon: Settings2,
            items: [
                {
                    title: "Daftar User",
                    url: "/users",
                },
                {
                    title: "Role List",
                    url: "/roles",
                },
                {
                    title: "Permission List",
                    url: "/permissions",
                },
                {
                    title: "Master Insentif",
                    url: "/settings/incentive-tiers",
                },
                {
                    title: "Pengaturan Whatsapp",
                    url: "/settings/whatsapp",
                },
            ],
        },
    ],
};

export function AppSidebar() {
    const { hasPermission } = usePermission();

    const filteredNavItems = useMemo(() => {
        const checkPermission = (item: NavItem) => {
            if (!item.permission) return true;
            return hasPermission(item.permission);
        };

        return allNavItems.navMain
            .filter(checkPermission)
            .map((item) => {
                if (item.items) {
                    return {
                        ...item,
                        items: item.items.filter(checkPermission),
                    };
                }
                return item;
            })
            .filter((item) => !item.items || item.items.length > 0);
    }, [hasPermission]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
