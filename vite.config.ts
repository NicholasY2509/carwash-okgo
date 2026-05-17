import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.tsx"],
            ssr: "resources/js/ssr.tsx",
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: "automatic",
        drop: ["console", "debugger"],
    },
    resolve: {
        alias: {
            "ziggy-js": resolve(__dirname, "vendor/tightenco/ziggy"),
        },
    },
    build: {
        sourcemap: false,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["react", "react-dom"],
                    ui: [
                        "@radix-ui/react-select",
                        "@radix-ui/react-dialog",
                        "@radix-ui/react-dropdown-menu",
                    ],
                    utils: ["axios", "date-fns", "react-number-format"],
                },
            },
        },
        minify: "esbuild",
        target: "es2020",
    },
    optimizeDeps: {
        include: [
            "react",
            "react-dom",
            "@inertiajs/react",
            "axios",
            "date-fns",
            "react-number-format",
        ],
    },
});
