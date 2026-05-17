import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransactionHandler } from "@/hooks/use-transaction-handler";
import { router, useForm } from "@inertiajs/react";
import axios from "axios";
import { QrCode, LoaderCircle, User, Calendar, Car as CarIcon, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QRScannerModal from "@/components/qr-scanner-modal";
import {
    forwardRef,
    useImperativeHandle,
    useState,
    useCallback,
    useMemo,
    useEffect,
} from "react";
// We need to define FooterData locally if not exported, or just duplicate generic interface
export interface FooterData {
    product_id: string;
    stall_id: number;
    payment_method?: string;
    nominal_bayar?: number;
    staff_id?: number;
}
import CarInformationCard from "@/components/car-information-card";

export interface CreateSpecialProgramPurchaseHandle {
    submit: (footerData: FooterData) => void;
    canSubmit: () => boolean;
}

interface SpecialProgram {
    id: string;
    code: string;
    status: string;
    start_date: string;
    expiry_date: string;
    customer: {
        id: string;
        name: string;
        phone: string;
        email: string;
    };
    cars: {
        id: string;
        plate_number: string;
        model: string;
        color: string;
        photo: string;
    }[];
}

interface PurchaseFormFields {
    [key: string]: any;
    program_code: string;
    special_program_id: string;
    customer_id: string;
    car_id: string;
}

interface Props {
    onSuccess: () => void;
}

const CreateSpecialProgramPurchase = forwardRef<
    CreateSpecialProgramPurchaseHandle,
    Props
>(({ onSuccess }, ref) => {
    const { data, setData, post, processing, errors, reset } = useForm<PurchaseFormFields>({
        program_code: "",
        special_program_id: "",
        customer_id: "",
        car_id: "",
    });

    const [foundProgram, setFoundProgram] = useState<SpecialProgram | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Reuse transaction handler
    const { handleSuccess, handleError } = useTransactionHandler({
        onSuccess,
        reset,
    });

    const checkValidity = useCallback((codeToCheck?: string) => {
        const code = codeToCheck || data.program_code;
        if (!code) return;

        setIsSearching(true);
        setSearchError(null);
        setFoundProgram(null);

        // Ensure data is updated if passed directly
        if (codeToCheck && codeToCheck !== data.program_code) {
            setData("program_code", codeToCheck);
        }

        axios
            .get(`/api/special-programs/check?code=${code}`)
            .then((response) => {
                const program = response.data.program;
                setFoundProgram(program);
                setData(prev => ({
                    ...prev,
                    program_code: code,
                    special_program_id: program.id,
                    customer_id: program.customer.id,
                    car_id: program.cars.length === 1 ? program.cars[0].id : "", // Auto-select if only 1 car
                }));
            })
            .catch((error) => {
                setSearchError(error.response?.data?.message || "Error checking program.");
            })
            .finally(() => {
                setIsSearching(false);
            });
    }, [data.program_code, setData]);

    const canSubmit = useMemo(() => {
        return !!foundProgram && foundProgram.status === 'active' && !!data.car_id;
    }, [foundProgram, data.car_id]);

    const handleSubmit = useCallback(
        (footerData: FooterData) => {
            if (!canSubmit) return;

            const finalData = {
                ...data,
                product_id: footerData.product_id,
                stall_id: footerData.stall_id,
                payment_method: 'Special Program',
                staff_id: footerData.staff_id || null,
            };

            // Note: need to ensure route exists
            router.post(route('car-washes.special-program'), finalData, {
                onSuccess: (page) => handleSuccess(page),
                onError: handleError,
            });
        },
        [data, canSubmit, handleSuccess, handleError]
    );

    useImperativeHandle(ref, () => ({
        submit: handleSubmit,
        canSubmit: () => canSubmit,
    }));

    return (
        <div className="px-4 space-y-4">
            <div className="flex flex-col sm:flex-row w-full items-end gap-2">
                <div className="w-full">
                    <Label htmlFor="program_code">Scan / Input QR Code</Label>
                    <Input
                        id="program_code"
                        value={data.program_code}
                        onChange={(e) => setData("program_code", e.target.value)}
                        placeholder="SP-..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                checkValidity();
                            }
                        }}
                    />
                </div>
                <Button
                    onClick={() => checkValidity()}
                    disabled={isSearching || !data.program_code}
                    className="w-full sm:w-auto"
                >
                    {isSearching ? <LoaderCircle className="animate-spin" /> : "Check"}
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => setIsScannerOpen(true)}
                    className="w-full sm:w-auto"
                    type="button"
                >
                    <QrCode className="w-4 h-4 mr-2" /> Scan QR
                </Button>
            </div>

            <QRScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={(code) => {
                    checkValidity(code);
                }}
            />

            {searchError && (
                <div className="text-red-500 text-sm">{searchError}</div>
            )}

            {foundProgram && (
                <div className="space-y-6">
                    <Card className="overflow-hidden border-primary/20 shadow-md">
                        <div className={cn(
                            "px-4 py-2 text-xs font-bold uppercase tracking-wider text-white flex justify-between items-center",
                            foundProgram.status === 'active' ? "bg-green-600" : "bg-destructive"
                        )}>
                            <span>{foundProgram.status === 'active' ? 'Program Aktif' : 'Program Tidak Aktif'}</span>
                            <span className="font-mono">{foundProgram.code}</span>
                        </div>
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Pelanggan</p>
                                            <p className="font-semibold text-sm">{foundProgram.customer.name}</p>
                                            <p className="text-xs text-muted-foreground">{foundProgram.customer.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Periode Program</p>
                                            <p className="text-xs font-medium">
                                                {foundProgram.start_date ? format(new Date(foundProgram.start_date), "dd MMM yyyy", { locale: id }) : '-'} 
                                                <span className="mx-1 text-muted-foreground">s/d</span>
                                                {format(new Date(foundProgram.expiry_date), "dd MMM yyyy", { locale: id })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                            <CarIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight mb-1">Pilih Kendaraan</p>
                                            <Select
                                                value={data.car_id}
                                                onValueChange={(val) => setData('car_id', val)}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue placeholder="Pilih kendaraan..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {foundProgram.cars.map((car) => (
                                                        <SelectItem key={car.id} value={car.id} className="text-xs">
                                                            {car.plate_number} - {car.model}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {data.car_id && foundProgram.cars.find(c => c.id === data.car_id) && (
                                <div className="pt-2 border-t border-dashed">
                                    <CarInformationCard
                                        car={foundProgram.cars.find(c => c.id === data.car_id)!}
                                        customer={foundProgram.customer}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
});

export default CreateSpecialProgramPurchase;
