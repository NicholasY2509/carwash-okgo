import { ImgHTMLAttributes } from "react";

export default function AppLogoIcon({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    // Automatically apply inversion filters when rendered on a dark background or in dark mode
    // to keep the logo perfectly visible, clean, and premium without changing its shapes.
    const isAlwaysDarkBg = className?.includes("text-white") || className?.includes("text-neutral-100");

    return (
        <img
            src="/assets/images/logo.png"
            alt="OKGO Logo"
            className={`h-9 w-auto object-contain transition-all duration-200 
                ${isAlwaysDarkBg ? "invert brightness-200" : "dark:invert dark:brightness-200"} 
                ${className || ""}`}
            {...props}
        />
    );
}
