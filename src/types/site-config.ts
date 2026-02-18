export interface BrandingConfig {
    siteName: string;
    tagline: string;
    logoUrl: string;
    faviconUrl: string;
    posterUrl?: string;
    pwaScreenshotUrl?: string;
    instagramUrl?: string;
    whatsappUrl?: string;
    searchPlaceholder?: string;
}

export interface ThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    navbarColor: string;
    navbarTextColor: string;
    navbarOpaque: boolean;
}

export interface HeroSlide {
    id: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    learnMoreLink?: string;
    backgroundImageUrl: string;
    overlayOpacity: number;
}

export interface HeroConfig extends DeprecatedHeroConfig {
    slides: HeroSlide[];
}

export interface DeprecatedHeroConfig {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    learnMoreLink?: string;
    backgroundImageUrl?: string;
    overlayOpacity?: number;
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
    logoUrl?: string;
    logoPublicId?: string;
    tagline: string;
    newsletter: {
        title: string;
        description: string;
        subtext?: string;
    };
    socialSectionTitle?: string;
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

export interface SystemConfig {
    maintenanceMode: boolean;
    robotsTxt: string; // Custom content for robots.txt
    sitemapXml?: string; // Optional custom sitemap URL or content
    scripts: {
        googleAnalyticsId?: string;
        facebookPixelId?: string;
        customHeadScript?: string;
        customBodyScript?: string;
    };
}

export interface ManifestConfig {
    name: string;
    shortName: string;
    description: string;
    themeColor: string;
    backgroundColor: string;
    display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
    startUrl: string;
}

export interface FrontendLabels {
    placeholders: {
        search: string;
        email: string;
    };
    buttons: {
        subscribe: string;
        viewCollection: string;
        shopNow: string;
        search: string;
    };
    messages: {
        success: string;
        error: string;
        loading: string;
        footerConnect: string;
        footerNoSpam: string;
        copyright: string;
    }
}

export interface SeoConfig {
    siteTitle: string;
    titleTemplate: string;
    metaDescription: string;
    keywords: string[];
    ogImageUrl: string;
    twitterHandle: string;
    googleVerification: string;
    jsonLd: {
        name: string;
        url: string;
        logo: string;
        description: string;
        addressCountry: string;
        priceRange: string;
    };
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
        storeHours: string;
    };
    headerLinks?: FooterLink[];
    system: SystemConfig;
    manifest: ManifestConfig;
    labels: FrontendLabels;
    seo: SeoConfig;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
    branding: {
        siteName: "Smart Avenue",
        tagline: "Where Luxury Meets Convenience",
        logoUrl: "/logo.png",
        faviconUrl: "/favicon.ico",
        posterUrl: "",
        pwaScreenshotUrl: "",
        instagramUrl: "",
        whatsappUrl: "",
        searchPlaceholder: "Search collections..."
    },
    theme: {
        primaryColor: "#064e3b", // Deep Emerald Green
        secondaryColor: "#d4af37", // Rich Gold
        accentColor: "#10b981", // Emerald 500
        backgroundColor: "#f8fafc", // Slate 50
        textColor: "#0f172a", // Slate 900
        navbarColor: "#ffffff", // White
        navbarTextColor: "#0f172a", // Slate 900
        navbarOpaque: true,
    },
    hero: {
        slides: [
            {
                id: "default-slide-1",
                title: "Experience International Retail",
                subtitle: "Premium groceries, fashion, and lifestyle products available at our flagship store.",
                ctaText: "View Collection",
                ctaLink: "/products",
                backgroundImageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=2070&auto=format&fit=crop",
                overlayOpacity: 0.6,
            }
        ]
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
        logoUrl: "",
        tagline: "Patna's premier destination for modern living. Elevating your lifestyle with curated tech, home, and fashion.",
        newsletter: {
            title: "Join the Movement",
            description: "Get the latest collections and exclusive offers sent to your inbox.",
            subtext: "No spam, unsubscribe anytime",
        },
        socialSectionTitle: "Connect",
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
        storeHours: "Monday - Sunday\n10:00 AM - 10:00 PM",
    },
    headerLinks: [
        { name: "Home", href: "/" },
        { name: "Products", href: "/products" },
        { name: "Departments", href: "/departments" },
        { name: "Special Offers", href: "/offers" },
        { name: "About Us", href: "/about" },
    ],
    system: {
        maintenanceMode: false,
        robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://smartavenue99.com/sitemap.xml",
        scripts: {},
    },
    manifest: {
        name: "Smart Avenue 99",
        shortName: "Smart Avenue",
        description: "Experience International Retail at your fingertips.",
        themeColor: "#064e3b",
        backgroundColor: "#ffffff",
        display: "standalone",
        startUrl: "/",
    },
    labels: {
        placeholders: {
            search: "Search collections...",
            email: "Enter your email address",
        },
        buttons: {
            subscribe: "Subscribe",
            viewCollection: "View Collection",
            shopNow: "Shop Now",
            search: "Search",
        },
        messages: {
            success: "Operation successful!",
            error: "Something went wrong.",
            loading: "Loading...",
            footerConnect: "Connect",
            footerNoSpam: "No spam, unsubscribe anytime",
            copyright: "All rights reserved.",
        }
    },
    seo: {
        siteTitle: "Smart Avenue 99 – All your home needs, simplified.",
        titleTemplate: "%s | Smart Avenue 99",
        metaDescription: "We are a one-stop departmental store offering a wide range of home essentials, stylish home décor, premium kitchenware, durable plasticware, quality crockery, cosmetics, premium stationery, soft toys, and thoughtfully curated gift items.",
        keywords: [
            "Smart Avenue 99 retail store",
            "premium stationery store",
            "stylish stationery products",
            "affordable home décor store",
            "kitchen décor products",
            "soft toys shop",
            "home essentials store",
            "retail store near me",
            "gift shop",
            "online shopping",
        ],
        ogImageUrl: "/logo.png",
        twitterHandle: "@smartavenue99",
        googleVerification: "",
        jsonLd: {
            name: "Smart Avenue 99",
            url: "https://smartavenue99.com",
            logo: "/logo.png",
            description: "One-stop departmental store offering home essentials, decor, kitchenware, and gifts.",
            addressCountry: "IN",
            priceRange: "₹₹",
        },
    }
};
