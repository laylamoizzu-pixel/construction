import Image from "next/image";
import { ArrowRight, ShoppingBasket, Shirt, Smartphone } from "lucide-react";

const HIGHLIGHTS = [
    {
        id: "fresh",
        title: "Fresh Grocery",
        description: "Organic produce and exotic imports.",
        icon: ShoppingBasket,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop",
        color: "bg-green-100 text-green-800",
    },
    {
        id: "fashion",
        title: "Premium Fashion",
        description: "Trendsetting apparel from top brands.",
        icon: Shirt,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        color: "bg-purple-100 text-purple-800",
    },
    {
        id: "tech",
        title: "Smart Electronics",
        description: "The latest gadgets and smart home tech.",
        icon: Smartphone,
        image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2101&auto=format&fit=crop",
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
