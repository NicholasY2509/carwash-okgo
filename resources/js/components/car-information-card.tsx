import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, User } from "lucide-react";

interface Car {
    id: string;
    plate_number: string;
    model: string;
    color: string;
    photo: string;
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
}

interface CarInformationCardProps {
    car: Car;
    customer: Customer;
    title?: string;
    className?: string;
}

export function CarInformationCard({
    car,
    customer,
    title = "Informasi Mobil",
    className = "",
}: CarInformationCardProps) {
    return (
        <Card className={` ${className}`}>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Nomor Plat:
                        </span>
                        <div className="font-medium"> {car.plate_number}</div>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Model:
                        </span>
                        <div className="font-medium">{car.model}</div>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">
                            Warna:
                        </span>
                        <div className="font-medium">
                            {car.color || "Tidak diketahui"}
                        </div>
                    </div>
                </div>
                <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                            Pemilik:
                        </span>
                    </div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                        {customer.phone}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default CarInformationCard;
