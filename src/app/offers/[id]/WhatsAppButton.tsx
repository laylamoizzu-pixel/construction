"use client";

import { MessageSquare } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";

export default function WhatsAppButton() {
    const { config } = useSiteConfig();
    const { contact } = config;

    if (!contact.whatsappUrl) return null;

    return (
        <a
            href={contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#25D366] text-white rounded-full font-bold hover:bg-[#128C7E] transition-all shadow-xl shadow-[#25D366]/30 hover:scale-105 transform duration-300"
        >
            <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
        </a>
    );
}
