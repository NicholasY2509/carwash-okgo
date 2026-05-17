import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@radix-ui/react-popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useForm } from "@inertiajs/react";
import Swal from "sweetalert2";
import { toast } from "sonner";

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

interface AssignmentCardHeaderProps {
    staffs: Staff[];
    stall: Stall;
}

export default function AssignmentCardHeader({
    staffs,
    stall,
}: AssignmentCardHeaderProps) {
    const { setData, data, errors, post, processing, reset } = useForm({
        stall_id: stall.id,
        driver_id:
            stall.active_staffs.find(
                (staff) => staff.pivot.position === "DRIVER",
            )?.id || "",
        qc_id:
            stall.active_staffs.find((staff) => staff.pivot.position === "QC")
                ?.id || "",
    });

    const [openDriver, setOpenDriver] = useState(false);
    const [openQC, setOpenQC] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route("stall-assignments.set-stall-head"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Driver dan QC disimpan");
            },
            onError: () => {},
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="flex w-full flex-row gap-2 items-center">
                    <Label>Driver</Label>
                    <Popover open={openDriver} onOpenChange={setOpenDriver}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                            >
                                {data.driver_id
                                    ? staffs.find(
                                          (staff) =>
                                              staff.id === data.driver_id,
                                      )?.full_name
                                    : "Pilih driver..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Cari staff..." />
                                <CommandList>
                                    <CommandEmpty>No staff found.</CommandEmpty>
                                    <CommandGroup>
                                        {staffs.map((staff) => (
                                            <CommandItem
                                                key={staff.id}
                                                value={staff.id}
                                                className="cursor-pointer"
                                                onSelect={() => {
                                                    const newValue =
                                                        staff.id ===
                                                        data.driver_id
                                                            ? ""
                                                            : staff.id;
                                                    setData(
                                                        "driver_id",
                                                        newValue,
                                                    );
                                                    setOpenDriver(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        data.driver_id ===
                                                            staff.id
                                                            ? "opacity-100"
                                                            : "opacity-0",
                                                    )}
                                                />
                                                {staff.full_name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex w-full flex-row gap-2 items-center">
                    <Label>QC</Label>
                    <Popover open={openQC} onOpenChange={setOpenQC}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                            >
                                {data.qc_id
                                    ? staffs.find(
                                          (staff) => staff.id === data.qc_id,
                                      )?.full_name
                                    : "Pilih QC"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Cari staff..." />
                                <CommandList>
                                    <CommandEmpty>No staff found.</CommandEmpty>
                                    <CommandGroup>
                                        {staffs.map((staff) => (
                                            <CommandItem
                                                key={staff.id}
                                                value={staff.id}
                                                className="cursor-pointer"
                                                onSelect={() => {
                                                    const newValue =
                                                        staff.id === data.qc_id
                                                            ? ""
                                                            : staff.id;
                                                    setData("qc_id", newValue);
                                                    setOpenQC(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        data.qc_id === staff.id
                                                            ? "opacity-100"
                                                            : "opacity-0",
                                                    )}
                                                />
                                                {staff.full_name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <Button
                    type="submit"
                    variant="default"
                    size={"sm"}
                    disabled={processing}
                    className="w-full lg:w-auto"
                >
                    Simpan
                </Button>
            </div>
        </form>
    );
}
