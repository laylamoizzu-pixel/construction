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
    learnMoreLink?: string;
    backgroundImageUrl: string;
    overlayOpacity: number;
}

export interface PromotionItem {
    id: string;
    imageUrl: string;
    title?: string;
    link?: string;
    active: boolean;
}

export interface FooterLink {
    name: string;
    href: string;
}

export interface FooterSection {
    title: string;
    links: FooterLink[];
}

export interface FooterConfig {
    tagline: string;
    socialLinks: {
        facebook: string;
        instagram: string;
        twitter: string;
    };
    navigation: {
        shop: FooterSection;
        company: FooterSection;
    };
    bottomLinks: FooterLink[];
}

export interface PromotionsConfig {
    enabled: boolean;
    title: string;
    items: PromotionItem[];
}

export interface SiteConfig {
    branding: BrandingConfig;
    theme: ThemeConfig;
    hero: HeroConfig;
    promotions: PromotionsConfig;
    footer: FooterConfig;
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
    promotions: {
        enabled: true,
        title: "Special Offers",
        items: []
    },
    sections: {
        showSmartClub: true,
        showWeeklyOffers: true,
        showDepartments: true,
        showTestimonials: true,
    },
    footer: {
        tagline: "Patna's premier destination for modern living. Elevating your lifestyle with curated tech, home, and fashion.",
        socialLinks: {
            facebook: "#",
            instagram: "#",
            twitter: "#",
        },
        navigation: {
            shop: {
                title: "Shop",
                links: [
                    { name: "Departments", href: "/departments" },
                    { name: "All Products", href: "/products" },
                    { name: "Weekly Offers", href: "/offers" },
                    { name: "New Arrivals", href: "/new-arrivals" },
                ]
            },
            company: {
                title: "Company",
                links: [
                    { name: "Our Story", href: "/about" },
                    { name: "Careers", href: "/careers" },
                    { name: "Contact Us", href: "/contact" },
                    { name: "Store Locator", href: "/stores" },
                ]
            }
        },
        bottomLinks: [
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms of Service", href: "/terms" },
            { name: "Sitemap", href: "/sitemap" },
        ]
    },
    contact: {
        phone: "+91 12345 67890",
        email: "contact@smartavenue.com",
        address: "Patna, Bihar, India",
        mapEmbedUrl: "",
    },
};
