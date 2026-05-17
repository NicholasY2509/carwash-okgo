import React, { useState, useEffect } from "react";
import { Shield, ShieldOff } from "lucide-react";

interface ReloadPreventionIndicatorProps {
    className?: string;
}

export const ReloadPreventionIndicator: React.FC<
    ReloadPreventionIndicatorProps
> = ({ className = "" }) => {
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        // Check initial state
        const checkState = () => {
            if (
                typeof window !== "undefined" &&
                (window as any).preventReload
            ) {
                setIsEnabled((window as any).preventReload.isEnabled());
            }
        };

        checkState();

        // Set up interval to check state changes
        const interval = setInterval(checkState, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!isEnabled) return null;

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg shadow-lg text-sm ${className}`}
        >
            <Shield className="w-4 h-4" />
            <span>Reload Prevention Active</span>
            <button
                onClick={() => {
                    if (
                        typeof window !== "undefined" &&
                        (window as any).preventReload
                    ) {
                        (window as any).preventReload.disable();
                        setIsEnabled(false);
                    }
                }}
                className="ml-2 text-yellow-600 hover:text-yellow-800"
                title="Disable reload prevention"
            >
                <ShieldOff className="w-4 h-4" />
            </button>
        </div>
    );
};
