import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Link } from "@inertiajs/react";
import { Users } from "lucide-react";

interface StallCardProps {
    stall: {
        id: number;
        name: string;
        active_staffs: {
            id: number;
            full_name: string;
            pivot: {
                id: number;
                start_time: string;
                end_time: string | null;
                is_active: boolean;
            };
        }[];
    };
    onView?: () => void;
}

export default function StallCard({ stall }: StallCardProps) {
    const getInitials = (name: string = ""): string => {
        if (!name) return "";

        const names = name.split(" ");

        if (names.length > 1) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }

        return name.substring(0, 2).toUpperCase();
    };
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{stall.name}</CardTitle>
                    <CardAction>
                        <Link href={route("stall-assignments.edit", stall.id)}>
                            <Button variant="default" size="sm">
                                Detail
                            </Button>
                        </Link>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2">
                        {stall.active_staffs.length > 0 ? (
                            stall.active_staffs.map((staff) => (
                                <div
                                    key={`history-${staff.pivot.id}`}
                                    className="my-2 flex items-center justify-between gap-4"
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
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-10 text-center col-span-2">
                                <Users className="text-muted-foreground h-10 w-10" />
                                <h3 className="mt-4 text-lg font-semibold">
                                    Belum Ada Staff Bertugas
                                </h3>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    Tambahkan staff terlebih dahulu
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
