"use strict";
/**
 * Utility to prevent browser reloads and navigation
 * Useful during development to prevent accidental data loss
 */
exports.__esModule = true;
exports.preventReload = void 0;
var isEnabled = false;
var preventReloadHandler = null;
var keydownHandler = null;
var contextMenuHandler = null;
var toggleHandler = null;
exports.preventReload = {
    /**
     * Enable reload prevention
     */
    enable: function () {
        if (isEnabled)
            return;
        isEnabled = true;
        preventReloadHandler = function (e) {
            e.preventDefault();
            e.returnValue =
                "Are you sure you want to leave? Your changes may be lost.";
            return "Are you sure you want to leave? Your changes may be lost.";
        };
        window.addEventListener("beforeunload", preventReloadHandler);
        // Prevent F5 and Ctrl+R
        keydownHandler = function (e) {
            if (e.key === "F5" || (e.ctrlKey && e.key === "r")) {
                e.preventDefault();
                alert("Reload is disabled. Please use the application navigation instead.");
                return false;
            }
        };
        document.addEventListener("keydown", keydownHandler);
        // Prevent right-click context menu (optional)
        contextMenuHandler = function (e) {
            e.preventDefault();
            return false;
        };
        document.addEventListener("contextmenu", contextMenuHandler);
        console.log("🛡️ Reload prevention enabled");
    },
    /**
     * Disable reload prevention
     */
    disable: function () {
        if (!isEnabled)
            return;
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
    isEnabled: function () {
        return isEnabled;
    },
    /**
     * Toggle reload prevention
     */
    toggle: function () {
        if (isEnabled) {
            this.disable();
        }
        else {
            this.enable();
        }
    }
};
// Add keyboard shortcut to toggle (Ctrl+Shift+R)
var setupToggleShortcut = function () {
    toggleHandler = function (e) {
        if (e.ctrlKey && e.shiftKey && e.key === "R") {
            e.preventDefault();
            exports.preventReload.toggle();
        }
    };
    document.addEventListener("keydown", toggleHandler);
};
// Enable in all environments (development and production)
exports.preventReload.enable();
setupToggleShortcut();
// Make it available globally for debugging
if (typeof window !== "undefined") {
    window.preventReload = exports.preventReload;
}
