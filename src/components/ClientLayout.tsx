"use client";

import { BrandingProvider } from "@/context/branding-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <BrandingProvider>
            <Header />
            <main className="flex-grow pt-20">
                {children}
            </main>
            <Footer />
        </BrandingProvider>
    );
}
