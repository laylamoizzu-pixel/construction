"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSiteContent, ContactContent } from "@/app/actions";

interface ContactContextType {
    contact: ContactContent;
    loading: boolean;
    refreshContact: () => Promise<void>;
}

const defaultContact: ContactContent = {
    address: "Shop No. 123, Main Market, New Delhi - 110001",
    phone: "+91 98765 43210",
    email: "contact@smartavenue.com",
    mapEmbed: "",
    storeHours: "Mon-Sat: 10:00 AM - 9:00 PM\nSunday: 11:00 AM - 7:00 PM"
};

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export function ContactProvider({ children }: { children: ReactNode }) {
    const [contact, setContact] = useState<ContactContent>(defaultContact);
    const [loading, setLoading] = useState(true);

    const refreshContact = async () => {
        setLoading(true);
        try {
            const data = await getSiteContent<ContactContent>("contact");
            if (data) {
                setContact({ ...defaultContact, ...data });
            }
        } catch (error) {
            console.error("Failed to fetch contact info:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshContact();
    }, []);

    return (
        <ContactContext.Provider value={{ contact, loading, refreshContact }}>
            {children}
        </ContactContext.Provider>
    );
}

export function useContact() {
    const context = useContext(ContactContext);
    if (context === undefined) {
        throw new Error("useContact must be used within a ContactProvider");
    }
    return context;
}
