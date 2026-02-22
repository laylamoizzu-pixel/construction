"use client";

import dynamic from "next/dynamic";
import { AuthProvider } from "@/context/auth-context";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import Header from "./Header";
import Footer from "./Footer";
import { ErrorBoundary } from "./ErrorBoundary";

import { SiteConfig } from "@/types/site-config";

// Lazy-load non-critical components to reduce initial JS bundle
const AssistantChat = dynamic(() => import("./assistant/AssistantChat"), { ssr: false });
const PwaInstallPrompt = dynamic(() => import("./PwaInstallPrompt"), { ssr: false });
const SwUpdateBanner = dynamic(() => import("./SwUpdateBanner"), { ssr: false });
const VersionManager = dynamic(() => import("./VersionManager"), { ssr: false });

export default function ClientLayout({
    children,
    initialConfig,
}: {
    children: React.ReactNode;
    initialConfig: SiteConfig;
}) {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <SiteConfigProvider initialConfig={initialConfig}>
                    <Header />
                    {children}
                    <AssistantChat />
                    <PwaInstallPrompt />
                    <SwUpdateBanner />
                    <VersionManager />
                    <Footer />
                </SiteConfigProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
