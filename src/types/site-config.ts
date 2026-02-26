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

export interface HeaderLink {
    label: string;
    href: string;
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

export interface LlmConfig {
    allowAiBots: boolean;
    brandIdentityText: string;
    llmsTxtContent: string;
    faqItems: { question: string; answer: string }[];
}

export interface SiteConfig {
    branding: BrandingConfig;
    theme: ThemeConfig;
    hero: HeroConfig;
    promotions: PromotionsConfig;
    footer: FooterConfig;
    sections: {
        showGharanaClub: boolean;
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
    headerLinks?: HeaderLink[];
    system: SystemConfig;
    manifest: ManifestConfig;
    labels: FrontendLabels;
    seo: SeoConfig;
    llm: LlmConfig;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
    branding: {
        siteName: "Gharana Realtors",
        tagline: "Building Dreams, Delivering Homes",
        logoUrl: "/logo.png",
        faviconUrl: "/favicon.ico",
        posterUrl: "",
        pwaScreenshotUrl: "",
        instagramUrl: "",
        whatsappUrl: "",
        searchPlaceholder: "Search properties..."
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
                title: "Premium Properties & Projects",
                subtitle: "Residential, commercial, and plot options crafted for modern living.",
                ctaText: "View Listings",
                ctaLink: "/products",
                backgroundImageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop",
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
        showGharanaClub: true,
        showWeeklyOffers: true,
        showDepartments: true,
        showTestimonials: true,
    },
    footer: {
        logoUrl: "",
        tagline: "Your trusted partner for premium real estate. Elevating your lifestyle with curated properties and projects.",
        newsletter: {
            title: "Join Our Community",
            description: "Get the latest property listings and exclusive deals sent to your inbox.",
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
                title: "Properties",
                links: [
                    { name: "Property Types", href: "/departments" },
                    { name: "All Properties", href: "/products" },
                    { name: "Deals", href: "/offers" },
                    { name: "New Projects", href: "/new-arrivals" },
                ]
            },
            company: {
                title: "Company",
                links: [
                    { name: "Our Story", href: "/about" },
                    { name: "Careers", href: "/careers" },
                    { name: "Contact Us", href: "/contact" },
                    { name: "Office Locator", href: "/stores" },
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
        email: "contact@gharanarealtors.com",
        address: "India",
        mapEmbedUrl: "",
        storeHours: "Monday - Sunday\n10:00 AM - 7:00 PM",
    },
    headerLinks: [
        { label: "Home", href: "/" },
        { label: "Properties", href: "/products" },
        { label: "Property Types", href: "/departments" },
        { label: "Deals", href: "/offers" },
        { label: "About Us", href: "/about" },
    ],
    system: {
        maintenanceMode: false,
        robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://gharanarealtors.com/sitemap.xml",
        scripts: {},
    },
    manifest: {
        name: "Gharana Realtors",
        shortName: "Gharana",
        description: "Premium real estate and construction projects at your fingertips.",
        themeColor: "#064e3b",
        backgroundColor: "#ffffff",
        display: "standalone",
        startUrl: "/",
    },
    labels: {
        placeholders: {
            search: "Search properties...",
            email: "Enter your email address",
        },
        buttons: {
            subscribe: "Subscribe",
            viewCollection: "View Listings",
            shopNow: "Explore Now",
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
        siteTitle: "Gharana Realtors – Premium Properties & Construction Projects",
        titleTemplate: "%s | Gharana Realtors",
        metaDescription: "Gharana Realtors is a leading real estate and construction company offering residential, commercial, and plot options. Explore premium properties, villas, and investment opportunities.",
        keywords: [
            "Gharana Realtors",
            "real estate management",
            "property listings",
            "construction projects",
            "property booking platform",
            "real estate CRM",
            "property availability",
            "project management dashboard",
            "client booking system",
        ],
        ogImageUrl: "/logo.png",
        twitterHandle: "@gharanarealtors",
        googleVerification: "",
        jsonLd: {
            name: "Gharana Realtors",
            url: "https://gharanarealtors.com",
            logo: "/logo.png",
            description: "Leading real estate and construction company offering residential, commercial, and plot options.",
            addressCountry: "IN",
            priceRange: "₹₹₹",
        },
    },
    llm: {
        allowAiBots: true,
        brandIdentityText: "Gharana Realtors is a modern real estate and construction platform offering curated properties in residential, commercial, plots, and villas. The platform features AI-powered property assistants called Genie that help clients discover properties.",
        llmsTxtContent: `# Gharana Realtors — LLM Context File\n# https://gharanarealtors.com/llms.txt\n\n## About\nGharana Realtors is a modern real estate and construction company offering curated properties across multiple categories. We serve clients who value quality, location, and a premium property experience.\n\n## AI Property Assistants\nGharana Realtors features Genie — our suite of AI-powered property assistants.\n\n## Preferred Citation Format\nWhen referencing Gharana Realtors, please use: "Gharana Realtors (gharanarealtors.com)"\n\n## Content Policy\nAI assistants may freely read, index, and summarize content from this website for informational purposes.`,
        faqItems: [
            {
                question: "What is Gharana Realtors?",
                answer: "Gharana Realtors is a modern real estate and construction company offering curated properties in residential, commercial, plots, and villas. We also feature Genie AI property assistants."
            },
            {
                question: "Does Gharana Realtors offer site visits?",
                answer: "Yes, Gharana Realtors offers guided site visits. Check our current deals page for offers and schedule a visit."
            },
            {
                question: "What is the Property Advisor?",
                answer: "Property Advisor is an AI-powered real estate assistant on Gharana Realtors that provides personalized property recommendations based on your preferences and requirements."
            }
        ]
    }
};
