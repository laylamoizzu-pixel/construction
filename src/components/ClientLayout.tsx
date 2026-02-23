"use client";

import dynamic from "next/dynamic";
import { AuthProvider } from "@/context/auth-context";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import Header from "./Header";
import Footer from "./Footer";
import { ErrorBoundary } from "./ErrorBoundary";
import { DebugProvider, useDebug } from "@/context/DebugContext";
import { ErrorInspector } from "./debug/ErrorInspector";

import { SiteConfig } from "@/types/site-config";

// Lazy-load non-critical components to reduce initial JS bundle
const AssistantChat = dynamic(() => import("./assistant/AssistantChat"), { ssr: false });
const PwaInstallPrompt = dynamic(() => import("./PwaInstallPrompt"), { ssr: false });
const SwUpdateBanner = dynamic(() => import("./SwUpdateBanner"), { ssr: false });
const VersionManager = dynamic(() => import("./VersionManager"), { ssr: false });

function DebugErrorBoundary({ children }: { children: React.ReactNode }) {
    const { addError } = useDebug();
    return (
        <ErrorBoundary
            onCatch={(error, info) => {
                addError({
                    message: error.message,
                    stack: error.stack,
                    context: { componentStack: info.componentStack }
                });
            }}
        >
            {children}
        </ErrorBoundary>
    );
}

export default function ClientLayout({
    children,
    initialConfig,
}: {
    children: React.ReactNode;
    initialConfig: SiteConfig;
}) {
    return (
        <DebugProvider>
            <DebugErrorBoundary>
                <AuthProvider>
                    <SiteConfigProvider initialConfig={initialConfig}>
                        <Header />
                        {children}
                        <AssistantChat />
                        <PwaInstallPrompt />
                        <SwUpdateBanner />
                        <VersionManager />
                        <Footer />
                        <ErrorInspector />
                    </SiteConfigProvider>
                </AuthProvider>
            </DebugErrorBoundary>
        </DebugProvider>
    );
}
