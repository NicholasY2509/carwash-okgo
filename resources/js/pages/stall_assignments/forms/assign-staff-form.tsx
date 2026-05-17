import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useForm } from "@inertiajs/react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@radix-ui/react-popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react";
import { useState } from "react";
import {
    Select,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import Swal from "sweetalert2";

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
interface AssignStaffFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    staffs: Staff[];
    stall: Stall;
}

export default function AssignStaffForm({
    stall,
    staffs,
    onSuccess,
    onCancel,
}: AssignStaffFormProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        staff_id: "",
        position: "",
        stall_id: stall.id,
    });

    const [openStaff, setOpenStaff] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const handleSuccess = () => {
            reset();
            onSuccess();
        };

        post(route("stall-assignments.store"), {
            onSuccess: handleSuccess,
            onError: () => {},
        });
    };
    return (
        <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-row gap-2 items-center">
                    <Label htmlFor="name" className="mb-1 block w-1/5">
                        Nama Staff
                    </Label>
                    <div className="w-full">
                        <Popover open={openStaff} onOpenChange={setOpenStaff}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openStaff}
                                    className="w-full justify-between"
                                >
                                    {data.staff_id
                                        ? staffs.find(
                                              (staff) =>
                                                  staff.id === data.staff_id,
                                          )?.full_name
                                        : "Pilih Staff..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Cari staff..." />
                                    <CommandList>
                                        <CommandEmpty>
                                            No staff found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {staffs.map((staff) => (
                                                <CommandItem
                                                    key={staff.id}
                                                    value={staff.id}
                                                    className="cursor-pointer"
                                                    onSelect={() => {
                                                        const newValue =
                                                            staff.id ===
                                                            data.staff_id
                                                                ? ""
                                                                : staff.id;
                                                        setData(
                                                            "staff_id",
                                                            newValue,
                                                        );
                                                        setOpenStaff(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            data.staff_id ===
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
                        {errors.staff_id && (
                            <p className="text-sm text-red-600">
                                {errors.staff_id}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-row gap-2 items-center">
                    <Label htmlFor="name" className="mb-1 block w-1/5">
                        Sebagai
                    </Label>
                    <div className="w-full">
                        <Select
                            value={data.position}
                            onValueChange={(e) => setData("position", e)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih Sebagai..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="WASH">
                                        Washing
                                    </SelectItem>
                                    <SelectItem value="DRYER">
                                        Pengeringan
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {errors.position && (
                            <p className="text-sm text-red-600">
                                {errors.position}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        onClick={onCancel}
                        disabled={processing}
                    >
                        Kembali
                    </Button>
                    <Button
                        type="submit"
                        variant="default"
                        size="lg"
                        disabled={processing}
                    >
                        {processing && (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Tambahkan
                    </Button>
                </div>
            </form>
        </>
    );
}
