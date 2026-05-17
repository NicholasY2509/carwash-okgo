/**
 * Utility to prevent browser reloads and navigation
 * Useful during development to prevent accidental data loss
 */

let isEnabled = false;
let preventReloadHandler:
    | ((e: BeforeUnloadEvent) => string | undefined)
    | null = null;
let keydownHandler: ((e: KeyboardEvent) => boolean | undefined) | null = null;
let contextMenuHandler: ((e: MouseEvent) => boolean | undefined) | null = null;
let toggleHandler: ((e: KeyboardEvent) => void) | null = null;

export const preventReload = {
    /**
     * Enable reload prevention
     */
    enable() {
        if (isEnabled) return;

        isEnabled = true;

        preventReloadHandler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue =
                "Are you sure you want to leave? Your changes may be lost.";
            return "Are you sure you want to leave? Your changes may be lost.";
        };
        window.addEventListener("beforeunload", preventReloadHandler);

        // Prevent F5 and Ctrl+R
        keydownHandler = (e: KeyboardEvent) => {
            if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
                e.preventDefault();
                alert(
                    "Reload is disabled. Please use the application navigation instead.",
                );
                return false;
            }
        };
        document.addEventListener("keydown", keydownHandler);

        // Prevent right-click context menu (optional)
        contextMenuHandler = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };
        document.addEventListener("contextmenu", contextMenuHandler);

        console.log("🛡️ Reload prevention enabled");
    },

    /**
     * Disable reload prevention
     */
    disable() {
        if (!isEnabled) return;

        isEnabled = false;

        if (preventReloadHandler) {
            window.removeEventListener("beforeunload", preventReloadHandler);
            preventReloadHandler = null;
        }

        if (keydownHandler) {
            document.removeEventListener("keydown", keydownHandler);
            keydownHandler = null;
        }

        if (contextMenuHandler) {
            document.removeEventListener("contextmenu", contextMenuHandler);
            contextMenuHandler = null;
        }

        console.log("🛡️ Reload prevention disabled");
    },

    /**
     * Check if reload prevention is enabled
     */
    isEnabled() {
        return isEnabled;
    },

    /**
     * Toggle reload prevention
     */
    toggle() {
        if (isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    },
};

// Add keyboard shortcut to toggle (Ctrl+Shift+R)
const setupToggleShortcut = () => {
    toggleHandler = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === "R") {
            e.preventDefault();
            preventReload.toggle();
        }
    };
    document.addEventListener("keydown", toggleHandler);
};

// Enable in all environments (development and production)
preventReload.enable();
setupToggleShortcut();

// Make it available globally for debugging
if (typeof window !== "undefined") {
    (window as any).preventReload = preventReload;
}
