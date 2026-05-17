import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransactionHandler } from "@/hooks/use-transaction-handler";
import { router, useForm } from "@inertiajs/react";
import axios from "axios";
import { error } from "console";
import { LoaderCircle } from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { toast } from "sonner";

// ... (interface FooterData & ReturnFormHandle tetap sama) ...
export interface FooterData {
    product_id: string;
    stall_id: number;
    staff_id?: number;
}
export interface ReturnFormHandle {
    submit: (footerData: FooterData) => void;
    canSubmit: () => boolean;
}

interface ReturnFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

interface ReturnInfo {
    has_been_claimed: boolean;
    is_eligible: boolean;
}

interface ServiceRecordData {
    id: number;
    service_date: string;
    car: {
        plate_number: string;
        customer: {
            name: string;
        };
    };
}

interface FoundData {
    service_record: ServiceRecordData;
    return_info: ReturnInfo;
}

const ReturnForm = forwardRef<ReturnFormHandle, ReturnFormProps>(
    ({ onSuccess, onCancel }, ref) => {
        const { data, setData, processing, reset, errors } = useForm({
            plate_number: "",
            service_record_id: "",
        });

        // --- STATE DIPERBARUI UNTUK MENYIMPAN STRUKTUR BARU ---
        const [foundData, setFoundData] = useState<FoundData | null>(null);
        const [searchError, setSearchError] = useState<string | null>(null);
        const [isSearching, setIsSearching] = useState(false);
        const [localErrors, setLocalErrors] = useState<{
            plate_number?: string;
        }>({});

        const { handleSuccess, handleError } = useTransactionHandler({
            onSuccess,
            reset,
        });

        function checkServiceRecord() {
            if (data.plate_number.length == 0) {
                errors.plate_number = "Nomor polisi harus diisi.";
            }

            setIsSearching(true);
            setSearchError(null);
            setFoundData(null);

            axios
                .get(
                    `/api/service-records/search?plate_number=${data.plate_number}`,
                )
                .then((response) => {
                    setFoundData(response.data);
                    setData({
                        ...data,
                        service_record_id:
                            response.data.service_record.id.toString(),
                    });
                })
                .catch((error) => {
                    setSearchError(
                        error.response?.data?.message || "Terjadi kesalahan.",
                    );
                })
                .finally(() => {
                    setIsSearching(false);
                });
        }

        const handleSubmit = (footerData: FooterData) => {
            if (!data.plate_number) {
                setLocalErrors({ plate_number: "Nomor polisi harus diisi." });
                return;
            }
            setLocalErrors({});
            if (!foundData || !foundData.return_info.is_eligible) {
                onCancel();
                toast.error("Garansi tidak valid atau sudah diklaim.");
                return;
            }
            const finalData = {
                service_record_id: data.service_record_id,
                stall_id: footerData.stall_id,
                staff_id: footerData.staff_id || null,
            };

            router.post(route("car-washes.return"), finalData, {
                onSuccess: (page) =>
                    handleSuccess(page),
                onError: handleError,
            });
        };

        useImperativeHandle(ref, () => ({
            submit: handleSubmit,
            canSubmit: () =>
                !!foundData &&
                !!foundData.return_info &&
                foundData.return_info.is_eligible,
        }));

        const serviceRecord = foundData?.service_record;
        const returnInfo = foundData?.return_info;

        return (
            <div className="px-4">
                <form
                    className="flex flex-col"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <div className="flex flex-col sm:flex-row w-full max-w-sm items-end gap-2">
                        <div className="w-full sm:w-4/5">
                            <Label htmlFor="plate_number" required>
                                Nomor Polisi
                            </Label>
                            <Input
                                id="plate_number"
                                type="text"
                                value={data.plate_number}
                                onChange={(e) => {
                                    setData(
                                        "plate_number",
                                        e.target.value.toUpperCase(),
                                    );
                                    setLocalErrors({
                                        ...localErrors,
                                        plate_number: undefined,
                                    });
                                }}
                                placeholder="Nomor Polisi..."
                            />
                        </div>

                        <Button
                            disabled={isSearching || processing}
                            className="w-full sm:w-1/5"
                            onClick={checkServiceRecord}
                        >
                            {isSearching ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                "Check"
                            )}
                        </Button>
                    </div>
                    {(errors.plate_number || localErrors.plate_number) && (
                        <p className="text-sm text-red-600">
                            {errors.plate_number || localErrors.plate_number}
                        </p>
                    )}
                </form>

                <Heading title="Pencucian Terakhir" className="mt-4" />
                <div className="space-y-2 text-sm">
                    {serviceRecord ? (
                        <div className="mt-1 space-y-2 rounded-lg border p-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Waktu Cuci:
                                </span>
                                <span className="font-medium">
                                    {new Intl.DateTimeFormat("id-ID", {
                                        day: "numeric",
                                        month: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        timeZone: "Asia/Jakarta",
                                    }).format(
                                        new Date(serviceRecord.service_date),
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Nomor Polisi:
                                </span>
                                <span className="font-medium">
                                    {serviceRecord.car.plate_number}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Nama Customer:
                                </span>
                                <span className="font-medium">
                                    {serviceRecord.car.customer.name}
                                </span>
                            </div>

                            {/* --- TAMPILAN BARU UNTUK STATUS GARANSI --- */}
                            <hr className="my-3" />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">
                                    Status Garansi:
                                </span>
                                {returnInfo?.is_eligible && (
                                    <span className="font-semibold text-green-600">
                                        Bisa Diklaim
                                    </span>
                                )}
                                {returnInfo?.has_been_claimed && (
                                    <span className="font-medium text-red-500">
                                        Sudah Diklaim
                                    </span>
                                )}
                                {!returnInfo?.is_eligible &&
                                    !returnInfo?.has_been_claimed && (
                                        <span className="font-medium text-gray-500">
                                            Kadaluwarsa
                                        </span>
                                    )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Masukkan Nomor Polisi untuk melihat detail.
                            {searchError && (
                                <p className="text-sm text-red-500 mt-2">
                                    {searchError}
                                </p>
                            )}
                        </p>
                    )}
                </div>
            </div>
        );
    },
);

export default ReturnForm;
