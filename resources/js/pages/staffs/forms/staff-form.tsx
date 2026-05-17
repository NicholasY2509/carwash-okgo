import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useForm } from "@inertiajs/react";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { toast } from "sonner";

export interface CreateStaffHandle {
    submit: () => void;
}

interface WorkPosition {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Staff {
    id: number;
    nik: string;
    full_name: string;
    first_name: string;
    last_name: string;
    phone: string;
    work_position_id: number | null;
    work_position: WorkPosition;
    user_id: number | null;
    user: User | null;
}

interface CreateStaffProps {
    onSuccess: () => void;
    onCancel: () => void;
    staff?: Staff | null;
}

const StaffForm = forwardRef<CreateStaffHandle, CreateStaffProps>(
    ({ onSuccess, onCancel, staff }, ref) => {
        const isEditMode = !!staff;

        const formRef = useRef<HTMLFormElement>(null);
        const [workPositions, setWorkPositions] = useState<WorkPosition[]>([]);
        const [users, setUsers] = useState<User[]>([]);
        const [loading, setLoading] = useState(true);

        const { data, setData, post, patch, processing, errors, reset } =
            useForm({
                nik: "Auto-Generate",
                first_name: "",
                last_name: "",
                phone: "",
                work_position_id: "",
                user_id: "",
            });

        useEffect(() => {
            if (isEditMode && staff) {
                setData({
                    nik: staff.nik || "Auto-Generate",
                    first_name: staff.first_name || "",
                    last_name: staff.last_name || "",
                    phone: staff.phone || "",
                    work_position_id: String(staff.work_position_id || ""),
                    user_id: String(staff.user_id || ""),
                });
            } else {
                reset();
            }
        }, [staff]);

        useImperativeHandle(ref, () => ({
            submit: () => {
                formRef.current?.requestSubmit();
            },
        }));

        function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
            e.preventDefault();

            const handleSuccess = () => {
                toast.success(
                    `Staff telah berhasil ${
                        isEditMode ? "diperbarui" : "ditambahkan"
                    }.`,
                );
                onSuccess();
            };

            if (isEditMode) {
                if (!staff) return;
                patch(route("staffs.update", staff.id), {
                    onSuccess: handleSuccess,
                });
            } else {
                post(route("staffs.store"), {
                    onSuccess: () => {
                        reset();
                        handleSuccess();
                    },
                });
            }
        }

        const handleWorkPositionChange = async (value: string) => {
            setData("work_position_id", value);
            if (isEditMode) return;

            try {
                const response = await axios.get(`/api/generate-nik/${value}`);
                setData("nik", response.data.nik);
            } catch (error) {
                console.error("Failed to generate NIK", error);
                setData("nik", "Auto-Generate");
            }
        };

        useEffect(() => {
            setLoading(true);
            axios
                .get(route("staffs.meta"))
                .then((response) => {
                    setWorkPositions(response.data.work_positions);
                    setUsers(response.data.users);
                })
                .catch((error) => {
                    console.error("Error fetching staff meta:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, []);

        if (loading) {
            return <div className="p-6 text-center">Loading...</div>;
        }

        return (
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="py-4 space-y-4 px-4"
            >
                <div>
                    <Label htmlFor="nik">NIK (Nomor Induk Karyawan)</Label>
                    <Input
                        id="nik"
                        type="text"
                        value={data.nik}
                        readOnly
                        className="mt-1"
                    />
                    {errors.nik && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.nik}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="first_name">Nama Depan</Label>
                        <Input
                            id="first_name"
                            type="text"
                            value={data.first_name}
                            onChange={(e) =>
                                setData("first_name", e.target.value)
                            }
                            className="mt-1"
                            required
                        />
                        {errors.first_name && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.first_name}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="last_name">Nama Belakang</Label>
                        <Input
                            id="last_name"
                            type="text"
                            value={data.last_name}
                            onChange={(e) =>
                                setData("last_name", e.target.value)
                            }
                            className="mt-1"
                        />
                        {errors.last_name && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.last_name}
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <Label htmlFor="phone">No. Telepon</Label>
                    <Input
                        id="phone"
                        type="text"
                        value={data.phone}
                        onChange={(e) => setData("phone", e.target.value)}
                        className="mt-1"
                    />
                    {errors.phone && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.phone}
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="work_position_id">Posisi Kerja</Label>
                    <Select
                        value={String(data.work_position_id)}
                        onValueChange={handleWorkPositionChange}
                        required
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Pilih posisi kerja" />
                        </SelectTrigger>
                        <SelectContent>
                            {workPositions.map((pos) => (
                                <SelectItem key={pos.id} value={String(pos.id)}>
                                    {pos.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.work_position_id && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.work_position_id}
                        </p>
                    )}
                </div>
                <div>
                    <Label htmlFor="user_id">Akun User (Untuk Login)</Label>
                    <Select
                        value={String(data.user_id)}
                        onValueChange={(value) => setData("user_id", value)}
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Pilih akun user atau biarkan kosong" />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map((user) => (
                                <SelectItem
                                    key={user.id}
                                    value={String(user.id)}
                                >
                                    {user.name} - ({user.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.user_id && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.user_id}
                        </p>
                    )}
                </div>
            </form>
        );
    },
);

export default StaffForm;
