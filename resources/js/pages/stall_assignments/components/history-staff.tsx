import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Paginated } from "@/types";
import { Link } from "@inertiajs/react";
import { Clock, History as HistoryIcon } from "lucide-react";
import HistoryFilterControls from "./history-filter-controls";
import { Pagination } from "@/components/ui/pagination";
interface Staff {
    id: number;
    full_name: string;
    pivot: {
        id: number;
        start_time: string;
        end_time: string | null;
        is_active: boolean;
    };
}
interface HistoryCardProps {
    assignmentHistory: Paginated<Staff>;
    filters: { search?: string; date_from?: string; date_to?: string };
    onFilterChange: (
        key: "search" | "date_from" | "date_to",
        value: string | Date | undefined,
    ) => void;
}
const getInitials = (name: string = ""): string => {
    if (!name) return "";

    const names = name.split(" ");

    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
};
export default function HistoryStaffCard({
    assignmentHistory,
    filters,
    onFilterChange,
}: HistoryCardProps) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Riwayat Penugasan</CardTitle>
                <CardDescription>
                    Cari riwayat staff yang pernah bertugas.
                </CardDescription>

                <HistoryFilterControls
                    filters={filters}
                    onFilterChange={onFilterChange}
                />
            </CardHeader>

            <CardContent className="flex-grow">
                {assignmentHistory.data.length > 0 ? (
                    <div className="space-y-4">
                        {assignmentHistory.data.map((staff) => (
                            <div
                                key={`history-${staff.pivot.id}`}
                                className="flex items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage
                                            src={`https://ui-avatars.com/api/?name=${staff.full_name}&background=random`}
                                        />
                                        <AvatarFallback>
                                            {getInitials(staff.full_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm">
                                        <p className="font-semibold">
                                            {staff.full_name}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {new Date(
                                                staff.pivot.start_time,
                                            ).toLocaleString("id-ID", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Badge
                                        variant={
                                            staff.pivot.is_active
                                                ? "default"
                                                : "outline"
                                        }
                                    >
                                        {staff.pivot.is_active
                                            ? "Aktif"
                                            : "Selesai"}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center rounded-md border-2 border-dashed p-10 text-center">
                        <HistoryIcon className="text-muted-foreground h-10 w-10" />
                        <h3 className="mt-4 text-lg font-semibold">
                            Tidak Ada Riwayat
                        </h3>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Tidak ada data yang cocok dengan filter Anda.
                        </p>
                    </div>
                )}
            </CardContent>

            {assignmentHistory && (
                <Pagination
                    pagination={assignmentHistory}
                    label="penugasan"
                    className="px-6 pb-6 pt-4 border-t mt-0"
                    showInfo={true}
                />
            )}
        </Card>
    );
}
