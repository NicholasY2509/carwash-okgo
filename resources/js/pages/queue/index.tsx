import React, { useState, useEffect } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

interface Car {
    plate_number: string;
    model: string | null;
}

interface ServiceRecord {
    id: number;
    queue_status: "pending" | "ongoing" | "finished" | "settled";
    car: Car | null;
    created_at: string;
}

interface Props {
    serviceRecords: ServiceRecord[];
}

const formatTimeElapsed = (dateString: string, now: Date) => {
    const start = new Date(dateString);
    const diffMs = Math.max(0, now.getTime() - start.getTime());

    const diffSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSecs / 3600);
    const mins = Math.floor((diffSecs % 3600) / 60);
    const secs = diffSecs % 60;

    const pad = (num: number) => num.toString().padStart(2, "0");

    if (hours > 0) {
        return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
};

export default function QueueIndex({ serviceRecords = [] }: Props) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000); // update every second
        return () => clearInterval(interval);
    }, []);

    // Polling to auto-update queue board every 5 seconds
    useEffect(() => {
        const pollingInterval = setInterval(() => {
            router.reload({
                only: ["serviceRecords"],
            });
        }, 5000);
        return () => clearInterval(pollingInterval);
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () =>
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(
                    `Error attempting to enable fullscreen: ${err.message}`,
                );
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const updateStatus = (id: number, status: string) => {
        router.post(
            route("queue.update-status", id),
            { status },
            {
                preserveScroll: true,
            },
        );
    };

    const pending = serviceRecords.filter((r) => r.queue_status === "pending");
    const ongoing = serviceRecords.filter((r) => r.queue_status === "ongoing");
    const finished = serviceRecords.filter(
        (r) => r.queue_status === "finished",
    );

    const renderCard = (
        record: ServiceRecord,
        nextStatus: string | null,
        nextLabel: string | null,
    ) => (
        <Card key={record.id} className="mb-2 shadow-sm border-muted gap-3">
            {/* <pre className="text-xs">{JSON.stringify(record, null, 2)}</pre> */}
            <CardHeader className="">
                <CardTitle className="text-lg font-bold uppercase tracking-wide">
                    {record.car?.plate_number || "N/A"}
                </CardTitle>
                <div className="text-xs text-muted-foreground capitalize">
                    {record.car?.car_type?.name || "Unknown Model"}
                </div>
            </CardHeader>
            <CardContent className="">
                {record.queue_status === "pending" && (
                    <div className="text-sm font-medium text-orange-600 flex items-center gap-1">
                        Menunggu: {formatTimeElapsed(record.created_at, now)}
                    </div>
                )}
            </CardContent>
            {!isFullscreen && nextStatus && nextLabel && (
                <CardFooter className="pt-0">
                    <Button
                        className="w-full font-semibold"
                        variant={
                            nextStatus === "settled" ? "secondary" : "default"
                        }
                        onClick={() => updateStatus(record.id, nextStatus)}
                    >
                        {nextLabel}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );

    const content = (
        <div
            className={`p-6 transition-all ${isFullscreen ? "h-screen w-screen overflow-y-auto bg-background text-foreground fixed inset-0 z-50" : "h-full"}`}
        >
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold tracking-tight">
                    Queue Board
                </h1>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFullscreen}
                    title="Toggle Fullscreen"
                >
                    {isFullscreen ? (
                        <Minimize2 className="h-5 w-5" />
                    ) : (
                        <Maximize2 className="h-5 w-5" />
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
                {/* Antrean */}
                <div className="flex flex-col bg-muted/30 p-4 rounded-xl border">
                    <h2 className="text-xl font-bold mb-4 flex justify-between items-center text-orange-600">
                        Antrean
                        <span className="bg-orange-500 text-white text-sm py-1 px-3 rounded-full shadow-sm">
                            {pending.length}
                        </span>
                    </h2>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {pending.map((record) =>
                            renderCard(record, "ongoing", "Mulai Proses"),
                        )}
                        {pending.length === 0 && (
                            <div className="text-center text-muted-foreground py-8 italic">
                                Tidak ada antrean
                            </div>
                        )}
                    </div>
                </div>

                {/* Proses */}
                <div className="flex flex-col bg-muted/30 p-4 rounded-xl border">
                    <h2 className="text-xl font-bold mb-4 flex justify-between items-center text-blue-600">
                        Proses
                        <span className="bg-blue-500 text-white text-sm py-1 px-3 rounded-full shadow-sm">
                            {ongoing.length}
                        </span>
                    </h2>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {ongoing.map((record) =>
                            renderCard(record, "finished", "Selesai"),
                        )}
                        {ongoing.length === 0 && (
                            <div className="text-center text-muted-foreground py-8 italic">
                                Tidak ada proses
                            </div>
                        )}
                    </div>
                </div>

                {/* Selesai */}
                <div className="flex flex-col bg-muted/30 p-4 rounded-xl border">
                    <h2 className="text-xl font-bold mb-4 flex justify-between items-center text-green-600">
                        Selesai
                        <span className="bg-green-500 text-white text-sm py-1 px-3 rounded-full shadow-sm">
                            {finished.length}
                        </span>
                    </h2>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {finished.map((record) =>
                            renderCard(record, "settled", "Settle"),
                        )}
                        {finished.length === 0 && (
                            <div className="text-center text-muted-foreground py-8 italic">
                                Tidak ada selesai
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (isFullscreen) {
        return content;
    }

    return (
        <AppLayout
            breadcrumbs={[{ title: "Queue Board", href: route("queue.index") }]}
        >
            <Head title="Queue Board" />
            {content}
        </AppLayout>
    );
}
