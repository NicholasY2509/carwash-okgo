import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

interface PaymentMethodData {
    name: string;
    value: number;
    color: string;
}

interface PaymentMethodChartProps {
    data: PaymentMethodData[];
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

        return (
            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                <p className="font-medium text-foreground">{`${label}`}</p>
                <p className="text-sm text-muted-foreground">
                    {`Pendapatan: ${formatCurrency(payload[0].value)}`}
                </p>
            </div>
        );
    }

    return null;
};

export function PaymentMethodChart({
    data,
    className,
}: PaymentMethodChartProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(value);
    };

    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

    // Filter out zero values and ensure we have valid data
    const validData = data.filter((item) => item.value > 0);

    // If no valid data, show a message
    if (validData.length === 0) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">
                        Distribusi Metode Pembayaran
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        <p>Tidak ada data pembayaran hari ini</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    Distribusi Metode Pembayaran
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={validData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {validData.map(
                                (entry: PaymentMethodData, index: number) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ),
                            )}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export default PaymentMethodChart;
