import { cn } from "@/lib/utils";

interface HeadingProps {
    title: string;
    description?: string;
    className?: string;
}

export default function Heading({
    title,
    description,
    className,
}: HeadingProps) {
    return (
        <div className={cn("space-y-0.5", className)}>
            <h2 className="text-xl font-bold tracking-tight text-primary">
                {title}
            </h2>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    );
}
