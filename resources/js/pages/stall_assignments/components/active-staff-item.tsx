import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash } from "lucide-react";

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

const getInitials = (name: string = "") => {
    const names = name.split(" ");
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

interface ActiveStaffItemProps {
    staff: Staff;
    onDelete: (assignmentId: number) => void;
}

/*************  ✨ Windsurf Command ⭐  *************/
/*******  81af3141-4344-4b79-9fae-e5b9675d7101  *******/ export default function ActiveStaffItem({
    staff,
    onDelete,
}: ActiveStaffItemProps) {
    return (
        <div
            key={staff.pivot.id}
            className="flex items-center justify-between gap-4"
        >
            <div className="flex items-center gap-4 w-1/3">
                <Avatar>
                    <AvatarImage
                        src={`https://ui-avatars.com/api/?name=${staff.full_name}&background=random`}
                    />
                    <AvatarFallback>
                        {getInitials(staff.full_name)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{staff.full_name}</p>
                    <p className="text-muted-foreground text-sm">
                        Mulai:{" "}
                        {new Date(staff.pivot.start_time).toLocaleString(
                            "id-ID",
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            },
                        )}
                    </p>
                </div>
            </div>
            <div className="text-sm font-medium p-2 bg-secondary rounded-md">
                {staff.pivot.position}
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(staff.pivot.id)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Hapus Tugas</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
