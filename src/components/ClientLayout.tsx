"use client";

import { AuthProvider } from "@/context/auth-context";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import Header from "./Header";
import Footer from "./Footer";
import { ErrorBoundary } from "./ErrorBoundary";
import AssistantChat from "./assistant/AssistantChat";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <SiteConfigProvider>
                    <Header />
                    {children}
                    <AssistantChat />
                    <Footer />
                </SiteConfigProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
