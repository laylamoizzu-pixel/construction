"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SiteConfig, DEFAULT_SITE_CONFIG } from "@/types/site-config";
import { getSiteConfig } from "@/app/actions/site-config";

interface SiteConfigContextType {
    config: SiteConfig;
    isLoading: boolean;
    refreshConfig: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType>({
    config: DEFAULT_SITE_CONFIG,
    isLoading: true,
    refreshConfig: async () => { },
});

export const useSiteConfig = () => useContext(SiteConfigContext);

const applyTheme = (theme: SiteConfig["theme"]) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--primary", theme.primaryColor);
    root.style.setProperty("--secondary", theme.secondaryColor);
    root.style.setProperty("--accent", theme.accentColor);
    root.style.setProperty("--background", theme.backgroundColor);
    root.style.setProperty("--foreground", theme.textColor);
};

export function SiteConfigProvider({
    children,
    initialConfig,
}: {
    children: React.ReactNode;
    initialConfig?: SiteConfig;
}) {
    const [config, setConfig] = useState<SiteConfig>(initialConfig || DEFAULT_SITE_CONFIG);
    const [isLoading, setIsLoading] = useState(!initialConfig);

    const fetchConfig = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const newConfig = await getSiteConfig();
            setConfig(newConfig);
            applyTheme(newConfig.theme);
        } catch (error) {
            console.error("Failed to fetch site config", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!initialConfig) {
            fetchConfig();
        } else {
            applyTheme(initialConfig.theme);
        }
    }, [initialConfig, fetchConfig]);

    return (
        <SiteConfigContext.Provider value={{ config, isLoading, refreshConfig: fetchConfig }}>
            {children}
        </SiteConfigContext.Provider>
    );
}
