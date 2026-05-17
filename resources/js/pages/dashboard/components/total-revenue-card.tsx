import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import formatRupiah from "@/lib/rupiah-formatter";

interface TotalRevenueCardProps {
    revenue: number;
    cashCarWashRevenue: number;
    otherCarWashRevenue: number;
    className?: string;
}

export default function TotalRevenueCard({
    revenue,
    cashCarWashRevenue,
    otherCarWashRevenue,
    className,
}: TotalRevenueCardProps) {
    return (
        <Card className={`${className}`}>
            <CardHeader>
                <CardTitle className="text-sm font-medium">
                    Total Transaksi Hari Ini
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                            Total Transaksi
                        </span>
                        <span className="text-2xl font-bold text-primary">
                            {formatRupiah(revenue)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-muted-foreground">Cash</span>
                        <span className="font-semibold">
                            {formatRupiah(cashCarWashRevenue)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Lainnya</span>
                        <span className="font-semibold">
                            {formatRupiah(otherCarWashRevenue)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
