export interface BrandingConfig {
    siteName: string;
    tagline: string;
    logoUrl: string;
    faviconUrl: string;
    posterUrl?: string;
    instagramUrl?: string;
    whatsappUrl?: string;
}

export interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
}

export interface HeroConfig {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    backgroundImageUrl: string;
    overlayOpacity: number;
}

export interface SiteConfig {
    branding: BrandingConfig;
    theme: ThemeConfig;
    hero: HeroConfig;
    sections: {
        showSmartClub: boolean;
        showWeeklyOffers: boolean;
        showDepartments: boolean;
        showTestimonials: boolean;
    };
    contact: {
        email: string;
        phone: string;
        address: string;
        mapEmbedUrl: string;
        facebookUrl?: string;
        instagramUrl?: string;
        twitterUrl?: string;
        whatsappUrl?: string;
    };
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
    branding: {
        siteName: "Smart Avenue",
        tagline: "Where Luxury Meets Convenience",
        logoUrl: "/logo.png",
        faviconUrl: "/favicon.ico",
        posterUrl: "",
        instagramUrl: "",
        whatsappUrl: ""
    },
    theme: {
        primaryColor: "#064e3b", // Deep Emerald Green
        secondaryColor: "#d4af37", // Rich Gold
        accentColor: "#10b981", // Emerald 500
        backgroundColor: "#f8fafc", // Slate 50
        textColor: "#0f172a", // Slate 900
    },
    hero: {
        title: "Experience International Retail",
        subtitle: "Premium groceries, fashion, and lifestyle products available at our flagship store.",
        ctaText: "View Collection",
        ctaLink: "/products",
        backgroundImageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop", // Placeholder luxury retail image
        overlayOpacity: 0.6,
    },
    sections: {
        showSmartClub: true,
        showWeeklyOffers: true,
        showDepartments: true,
        showTestimonials: true,
    },
    contact: {
        phone: "+91 12345 67890",
        email: "contact@smartavenue.com",
        address: "Patna, Bihar, India",
        mapEmbedUrl: "",
    },
};
