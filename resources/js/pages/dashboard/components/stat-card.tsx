import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    Banknote,
    CreditCard,
    DollarSign,
    Landmark,
    Shield,
    Ticket,
} from "lucide-react";

interface TotalRevenueProps {
    title: string;
    value: string;
    icon?: React.ReactNode;
}

interface PaymentTypeStat {
    type: string;
    total: number;
}

interface PaymentTypeStatsProps {
    title: string;
    stats: PaymentTypeStat[];
    className?: string;
}

const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
        case "salestransaction":
            return <Banknote className="h-4 w-4 text-muted-foreground" />;
        case "voucher":
            return <Ticket className="h-4 w-4 text-muted-foreground" />;
        default:
            return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
};

const getLabelForType = (type: string) => {
    switch (type.toLowerCase()) {
        case "salestransaction":
            return "Tunai / Cash";
        case "voucher":
            return "Voucher";
        default:
            return "Return";
    }
};

export function TotalRevenue({ title, value, icon }: TotalRevenueProps) {
    return (
        <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon ? (
                    icon
                ) : (
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                )}
            </CardHeader>
            <CardContent className="h-full items-center">
                <div className="md:text-3xl lg:text-4xl font-semibold text-primary">
                    {value}
                </div>
            </CardContent>
        </Card>
    );
}

export function PaymentTypeStats({
    title,
    stats,
    className,
}: PaymentTypeStatsProps) {
    if (!stats || stats.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Belum ada transaksi hari ini.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("@container/card", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="md:columns-2 md:gap-x-8">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.type}
                            className="break-inside-avoid mb-2"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">
                                        {stat.type}
                                    </span>
                                </div>
                                <div className="text-lg font-bold text-primary">
                                    {stat.total}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-end mt-4">
                    <span className="text-lg font-bold text-primary">
                        Total: {stats.reduce((acc, stat) => acc + stat.total, 0)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
