import AppLogoIcon from "./app-logo-icon";

export default function AppLogo() {
    return (
        <>
            <div className="sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm font-bold">
                D+ Robotic Car Wash
            </div>
        </>
    );
}
