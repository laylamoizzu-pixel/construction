export const NAV_LINKS = [
    { label: "Home", href: "/" },
    { label: "Departments", href: "/departments" },
    { label: "The Smart Club", href: "/club" },
    { label: "Offers", href: "/offers" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
];

export const DEPARTMENTS = [
    {
        id: "stationery",
        title: "Stationery",
        description: "Premium & stylish stationery for students and professionals.",
        icon: "PenTool",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2662&auto=format&fit=crop",
    },
    {
        id: "soft-toys",
        title: "Soft Toys",
        description: "Cute, safe, and high-quality soft toys for all ages.",
        icon: "Smile",
        image: "https://images.unsplash.com/photo-1555449377-54da9dOcbe35?q=80&w=2670&auto=format&fit=crop",
    },
    {
        id: "kitchen",
        title: "Kitchen Décor",
        description: "Stylish and durable utility products for your modern kitchen.",
        icon: "Utensils",
        image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2670&auto=format&fit=crop",
    },
    {
        id: "home-decor",
        title: "Home Décor",
        description: "Elegant and functional items to transform your living space.",
        icon: "Home",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?q=80&w=2670&auto=format&fit=crop",
    },
    {
        id: "plastic",
        title: "Plastic Products",
        description: "Sturdy and long-lasting home essentials.",
        icon: "Package",
        image: "https://images.unsplash.com/photo-1595079676339-1534827d8c18?q=80&w=2670&auto=format&fit=crop",
    },
];

export const CLUB_TIERS = [
    {
        name: "Silver Shopper",
        benefits: ["Points on every purchase", "Member-only discounts"],
        price: "Free",
        color: "bg-gray-200 text-gray-800",
    },
    {
        name: "Gold Elite",
        benefits: ["Priority billing", "Free delivery", "1.5x Points"],
        price: "₹999/year",
        color: "bg-yellow-400 text-yellow-900",
    },
    {
        name: "Platinum Access",
        benefits: [
            "Exclusive lounge access",
            "Birthday gifts",
            "Personal shopper",
            "2x Points",
        ],
        price: "₹2499/year",
        color: "bg-slate-800 text-white border border-gold-400",
    },
];
