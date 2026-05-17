import Heading from "@/components/heading";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { Wrench } from "lucide-react";
import StallCard from "./components/stall-card";
import AssignmentCard from "./components/assignment-card";
interface Stall {
    id: number;
    name: string;
    active_staffs: Staff[];
    active_teams: Staff[];
}

interface Staff {
    id: string;
    full_name: string;
    pivot: {
        id: number;
        start_time: string;
        end_time: string | null;
        is_active: boolean;
        position: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Jadwal Stall",
        href: "/stall-assignments",
    },
];

export default function StallAssignmentIndex() {
    const { props } =
        usePage<PageProps<{ stalls: Stall[]; staffs: Staff[] }>>();
    const stalls = props.stalls;
    const staffs = props.staffs;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jadwal Stall" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex justify-between">
                    <Heading
                        title="Jadwal Stall"
                        description="Atur jadwal rotasi pekerja stall."
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {stalls.length > 0 ? (
                        stalls.map((stall: Stall) => (
                            <AssignmentCard
                                key={stall.id}
                                stall={stall}
                                staffs={staffs}
                            />
                        ))
                    ) : (
                        <div className="col-span-2 flex flex-col items-center justify-center rounded-md border-2 border-dashed p-10 text-center">
                            <Wrench className="text-muted-foreground h-10 w-10" />
                            <h3 className="mt-4 text-lg font-semibold">
                                Belum Ada Stall Terdaftar
                            </h3>
                            <p className="text-muted-foreground mt-2 text-sm">
                                Tambahkan data stall terlebih dahulu untuk
                                memulai.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
