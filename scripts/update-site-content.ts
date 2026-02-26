
import { updateBlobJson } from '../src/app/actions/blob-json.ts';

async function updateSiteConfig() {
    console.log('Updating site configuration with premium content...');

    const premiumConfig = {
        branding: {
            name: "Gharana Realtors",
            logo: "",
            primaryColor: "#C5A059", // Gold
            secondaryColor: "#111111", // Charcoal
        },
        headerLinks: [
            { label: "Properties", href: "/products" },
            { label: "Luxury Living", href: "/departments" },
            { label: "Exclusives", href: "/offers" },
            { label: "Journal", href: "/updates" }
        ],
        hero: {
            slides: [
                {
                    id: "slide-1",
                    title: "Legacy in Every Leaf",
                    subtitle: "Experience the pinnacle of Silicon Valley-inspired luxury construction. We build homes that breathe and spaces that inspire.",
                    ctaText: "Explore Properties",
                    ctaLink: "/products",
                    learnMoreLink: "/about",
                    backgroundImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000",
                    overlayOpacity: 0.4
                },
                {
                    id: "slide-2",
                    title: "Smart Spaces. Sharp Living.",
                    subtitle: "Next-gen architectural marvels designed with integrated AI and sustainable technology at their core.",
                    ctaText: "View Smart Units",
                    ctaLink: "/products?category=smart-workspaces",
                    backgroundImageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000",
                    overlayOpacity: 0.5
                }
            ]
        },
        promotions: {
            enabled: true,
            items: [
                { id: "promo-1", title: "Global Launch Exclusive", code: "VESTA10", description: "Get 10% off your booking for Eco-Vista units." }
            ]
        }
    };

    const result = await updateBlobJson("site_config.json", premiumConfig);

    if (result.success) {
        console.log('Site config updated successfully!');
    } else {
        console.error('Failed to update site config:', result.error);
    }

    // Also update highlights/features
    const premiumHighlights = {
        title: "Iconic Projects",
        subtitle: "Architectural landmarks",
        description: "Our portfolio represents the gold standard of modern construction, blending aesthetic brilliance with structural integrity.",
        viewAllLabel: "See All Projects"
    };
    await updateBlobJson("site_content_highlights.json", premiumHighlights);

    const premiumFeatures = {
        title: "The Gharana Standard",
        subtitle: "Why We Lead",
        items: [
            { title: "Precision Engineering", desc: "Every millimeter accounted for by our master architects.", icon: "CheckCircle" },
            { title: "Eco-Conscious Build", desc: "LEED Platinum standards for a sustainable future.", icon: "Leaf" },
            { title: "AI Integration", desc: "Homes that learn and adapt to your lifestyle.", icon: "Zap" }
        ]
    };
    await updateBlobJson("site_content_features.json", premiumFeatures);

    console.log('All site content segments updated.');
}

updateSiteConfig().catch(console.error);
