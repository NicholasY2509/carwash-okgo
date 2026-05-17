import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PaymentTypeStat {
    type: string;
    total: number;
}

interface PaymentTypeStatsProps {
    title: string;
    stats: PaymentTypeStat[];
    className?: string;
}

export default function PaymentTypeStats({
    title,
    stats,
    className,
}: PaymentTypeStatsProps) {
    if (!stats || stats.length === 0) {
        return (
            <Card className={className}>
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
        <Card className={cn( className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="md:columns-2 md:gap-x-8">
                    {stats.map((stat) => (
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
            </CardContent>
        </Card>
    );
}
