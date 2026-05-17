import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => void;
}

interface CameraDevice {
    id: string;
    label: string;
}

export default function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [cameras, setCameras] = useState<CameraDevice[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>("");
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const ScannerRegionId = "html5qr-code-full-region";

    useEffect(() => {
        if (isOpen) {
            Html5Qrcode.getCameras().then((devices) => {
                if (devices && devices.length) {
                    setCameras(devices);
                    setSelectedCameraId(devices[0].id);
                    startScanning(devices[0].id);
                }
            }).catch((err) => {
                console.error("Error getting cameras", err);
            });
        } else {
            stopScanning();
        }

        return () => {
            stopScanning();
        };
    }, [isOpen]);

    const startScanning = async (cameraId: string) => {
        if (scannerRef.current) {
            await stopScanning();
        }

        // formatsToSupport goes in constructor verbose defaults to true
        const html5QrCode = new Html5Qrcode(ScannerRegionId, {
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            verbose: false
        });
        scannerRef.current = html5QrCode;

        try {
            await html5QrCode.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    onScan(decodedText);
                    onClose(); // Auto close on success
                },
                (errorMessage) => {
                    // console.warn(errorMessage);
                }
            );
            setIsScanning(true);
        } catch (err) {
            console.error("Error starting scanner", err);
            setIsScanning(false);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
            scannerRef.current = null;
            setIsScanning(false);
        }
    };

    const handleCameraChange = (cameraId: string) => {
        setSelectedCameraId(cameraId);
        startScanning(cameraId);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Scan QR Code
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4">
                    {cameras.length > 1 && (
                        <Select value={selectedCameraId} onValueChange={handleCameraChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Camera" />
                            </SelectTrigger>
                            <SelectContent>
                                {cameras.map((camera) => (
                                    <SelectItem key={camera.id} value={camera.id}>
                                        {camera.label || `Camera ${camera.id}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <div id={ScannerRegionId} className="w-full overflow-hidden rounded-lg border bg-black/5 min-h-[300px]" />

                    {!isScanning && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Starting camera...
                        </div>
                    )}

                    <Button variant="outline" onClick={onClose} className="w-full">
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
