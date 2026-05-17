import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Clock, Ticket } from "lucide-react";

interface VoucherPacket {
    voucher_type: {
        name: string;
    };
    id: string;
    name: string;
    price: number;
    quantity: number;
    valid_period_months: number;
    has_unlimited_issuance: boolean;
    description: string;
}

interface VoucherPacketCardProps {
    voucherPacket: VoucherPacket;
    onClick: () => void;
}

export default function VoucherPacketCard({
    voucherPacket,
    onClick,
}: VoucherPacketCardProps) {
    const formattedPrice = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(voucherPacket.price);

    return (
        <Card
            onClick={onClick}
            className={`flex h-full cursor-pointer flex-col transition-all hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/30 dark:hover:shadow-primary/50 focus:shadow-lg focus:-translate-y-2 focus:shadow-primary/30 dark:focus:shadow-primary/50`}
        >
            <CardHeader className="flex-grow-0">
                <div className="flex items-start flex-col lg:flex-row justify-between">
                    <div>
                        <CardTitle className="lg:text-md font-bold">
                            {voucherPacket.name}
                        </CardTitle>
                        <CardDescription>
                            {voucherPacket.description}
                        </CardDescription>
                    </div>

                    <Badge
                        variant="outline"
                        className="self-end lg:self-baseline mt-2 lg:mt-0"
                    >
                        Voucher {voucherPacket.voucher_type.name}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end space-y-4">
                <div className="text-center">
                    <p className="text-3xl lg:text-4xl font-extrabold text-primary mb-2">
                        {formattedPrice}
                    </p>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <Ticket className="mr-2 h-4 w-4" />
                        <span>{voucherPacket.quantity} Lembar Voucher</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>
                            Masa Aktif: {voucherPacket.valid_period_months}{" "}
                            Bulan
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
