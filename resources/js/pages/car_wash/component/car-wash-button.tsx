import { Card } from "@/components/ui/card";

interface CarWashButton {
    label: string;
    onClick: () => void;
}

export function CarWashButton({ label, onClick }: CarWashButton) {
    return (
        <Card
            className="flex h-full cursor-pointer text-primary-foreground flex-col transition-all hover:-translate-y-2 hover:shadow-lg bg-primary hover:bg-primary-foreground dark:hover:shadow-white hover:shadow-primary/40 hover:text-primary text-center font-bold py-18 lg:py-28 text-5xl lg:text-7xl"
            onClick={onClick}
        >
            {label}
        </Card>
    );
}
