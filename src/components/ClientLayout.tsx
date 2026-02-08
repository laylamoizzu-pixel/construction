"use client";

import { BrandingProvider } from "@/context/branding-context";
import { AuthProvider } from "@/context/auth-context";
import { ContactProvider } from "@/context/contact-context";
import Header from "./Header";
import Footer from "./Footer";
import { ErrorBoundary } from "./ErrorBoundary";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <BrandingProvider>
                    <ContactProvider>
                        <Header />
                        {children}
                        <Footer />
                    </ContactProvider>
                </BrandingProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
