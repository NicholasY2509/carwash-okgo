import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface RevenueData {
    date: string;
    revenue: number;
    carWash: number;
    voucherSales: number;
}

interface RevenueTrendChartProps {
    data: RevenueData[];
    className?: string;
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const formatCurrency = (value: number) => {
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(value);
        };

        const formatDate = (date: string) => {
            return format(new Date(date), "dd MMM yyyy", { locale: id });
        };

        return (
            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                <p className="font-medium text-foreground">
                    {formatDate(label)}
                </p>
                {payload.map((entry: any, index: number) => (
                    <p
                        key={index}
                        className="text-sm text-muted-foreground"
                        style={{ color: entry.color }}
                    >
                        {`${entry.name}: ${formatCurrency(entry.value)}`}
                    </p>
                ))}
            </div>
        );
    }

    return null;
};

export function RevenueTrendChart({ data, className }: RevenueTrendChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(value);
    };

    const formatDate = (date: string) => {
        return format(new Date(date), "dd MMM", { locale: id });
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    Tren Pendapatan 7 Hari Terakhir
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id="totalRevenue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient
                                id="carWash"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#10b981"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#10b981"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient
                                id="voucherSales"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#f59e0b"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#f59e0b"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#totalRevenue)"
                            name="Total Pendapatan"
                        />
                        <Area
                            type="monotone"
                            dataKey="carWash"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#carWash)"
                            name="Cuci Mobil"
                        />
                        <Area
                            type="monotone"
                            dataKey="voucherSales"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fill="url(#voucherSales)"
                            name="Penjualan Voucher"
                        />
                    </AreaChart>
                </ResponsiveContainer>

                <div className="flex justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Total Pendapatan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Cuci Mobil</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Penjualan Voucher</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default RevenueTrendChart;
