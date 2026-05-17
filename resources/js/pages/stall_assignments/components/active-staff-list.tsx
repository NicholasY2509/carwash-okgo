import { Users } from "lucide-react";
import ActiveStaffItem from "./active-staff-item";

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

interface ActiveStaffListProps {
    activeStaffs: Staff[];
    onDelete: (assignmentId: number) => void;
}

export default function ActiveStaffList({
    activeStaffs,
    onDelete,
}: ActiveStaffListProps) {
    if (activeStaffs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-10 text-center mt-4">
                <Users className="text-muted-foreground h-10 w-10" />
                <h3 className="mt-4 text-lg font-semibold">
                    Belum Ada Staff Bertugas
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                    Klik "Tambah" untuk memulai.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-4">
            {activeStaffs.map((staff) => (
                <ActiveStaffItem
                    key={staff.pivot.id}
                    staff={staff}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
