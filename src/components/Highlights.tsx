import Link from "next/link";
import Image from "next/image";
import { ArrowRight, PenTool, Smile, Utensils, Home as HomeIcon, Package } from "lucide-react";

const HIGHLIGHTS = [
    {
        id: "stationery",
        title: "Stationery",
        description: "Premium & stylish stationery for students and professionals.",
        icon: PenTool,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2662&auto=format&fit=crop",
        color: "bg-yellow-100 text-yellow-800",
    },
    {
        id: "soft-toys",
        title: "Soft Toys",
        description: "Cute, safe, and high-quality soft toys for all ages.",
        icon: Smile, // Using Smile as a proxy for toys if Bear is unavailable, or import Heart/Star
        image: "https://images.unsplash.com/photo-1555449377-54da9dOcbe35?q=80&w=2670&auto=format&fit=crop", // Intentionally using a generic placeholder if ID is tricky, but lets try to get a real one
        color: "bg-pink-100 text-pink-800",
    },
    {
        id: "kitchen",
        title: "Kitchen Décor",
        description: "Stylish and durable utility products for your modern kitchen.",
        icon: Utensils,
        image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2670&auto=format&fit=crop",
        color: "bg-orange-100 text-orange-800",
    },
    {
        id: "home-decor",
        title: "Home Décor",
        description: "Elegant and functional items to transform your living space.",
        icon: HomeIcon,
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e35a6?q=80&w=2670&auto=format&fit=crop",
        color: "bg-indigo-100 text-indigo-800",
    },
    {
        id: "plastic",
        title: "Plastic Products",
        description: "Sturdy and long-lasting home essentials.",
        icon: Package,
        image: "https://images.unsplash.com/photo-1595079676339-1534827d8c18?q=80&w=2670&auto=format&fit=crop", // Storage box image
        color: "bg-blue-100 text-blue-800",
    },
];

export default function Highlights() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">
                        Curated for <span className="text-brand-gold">You</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Explore our diverse departments, each offering a unique selection of premium products tailored to your lifestyle.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                    {HIGHLIGHTS.map((item) => (
                        <Link
                            key={item.id}
                            href={`/departments#${item.id}`}
                            className="group relative h-[400px] overflow-hidden rounded-2xl shadow-lg cursor-pointer block"
                        >
                            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300" />

                            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                                <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-gray-300 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                    {item.description}
                                </p>
                                <div className="flex items-center text-brand-gold text-sm font-semibold gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                    Shop Now <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
