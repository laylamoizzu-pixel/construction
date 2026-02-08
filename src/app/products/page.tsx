import { getProducts, getCategories, getOffers } from "@/app/actions";
import Link from "next/link";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage({
    searchParams
}: {
    searchParams: Promise<{ category?: string; subcategory?: string; search?: string }>
}) {
    const params = await searchParams;
    const [products, categories, offers] = await Promise.all([
        getProducts(),
        getCategories(),
        getOffers()
    ]);

    const mainCategories = categories.filter(c => !c.parentId);
    const getSubcategories = (parentId: string) => categories.filter(c => c.parentId === parentId);
    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "";
    const getOffer = (id?: string) => id ? offers.find(o => o.id === id) : null;

    // Filter products
    let filteredProducts = products.filter(p => p.available);

    // Search filter
    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower))
        );
    }

    if (params.category) {
        filteredProducts = filteredProducts.filter(p =>
            p.categoryId === params.category || p.subcategoryId === params.category
        );
    }
    if (params.subcategory) {
        filteredProducts = filteredProducts.filter(p => p.subcategoryId === params.subcategory);
    }

    return (
        <div className="min-h-screen bg-brand-sand">
            {/* Editorial Hero */}
            <div className="relative h-[40vh] min-h-[400px] w-full bg-brand-green overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-green/90 via-transparent to-transparent"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <span className="text-brand-gold tracking-[0.2em] text-sm uppercase mb-4 font-medium">Curated Collection</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 font-light">
                        The <span className="italic font-normal">Essentials</span>
                    </h1>
                    <p className="text-gray-200 text-lg max-w-xl font-light leading-relaxed">
                        Discover our selection of premium home goods, designed to elevate your everyday living with timeless elegance.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Refined Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0 space-y-8">
                        <div>
                            <h3 className="font-serif text-xl text-brand-dark mb-6 pb-2 border-b border-gray-200">Categories</h3>
                            <nav className="space-y-2">
                                <Link
                                    href="/products"
                                    className={`block text-sm transition-colors duration-300 ${!params.category ? "text-brand-gold font-medium" : "text-gray-500 hover:text-brand-dark"
                                        }`}
                                >
                                    All Collections
                                </Link>
                                {mainCategories.map(cat => {
                                    const subs = getSubcategories(cat.id);
                                    const isActive = params.category === cat.id;
                                    return (
                                        <div key={cat.id} className="pt-2">
                                            <Link
                                                href={`/products?category=${cat.id}`}
                                                className={`block text-sm transition-colors duration-300 ${isActive ? "text-brand-gold font-medium" : "text-gray-500 hover:text-brand-dark"
                                                    }`}
                                            >
                                                {cat.name}
                                            </Link>
                                            {subs.length > 0 && isActive && (
                                                <div className="ml-3 mt-2 space-y-2 border-l border-gray-200 pl-3">
                                                    {subs.map(sub => (
                                                        <Link
                                                            key={sub.id}
                                                            href={`/products?category=${cat.id}&subcategory=${sub.id}`}
                                                            className={`block text-xs transition-colors duration-300 ${params.subcategory === sub.id
                                                                ? "text-brand-dark font-medium"
                                                                : "text-gray-400 hover:text-brand-dark"
                                                                }`}
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Editorial Grid */}
                    <main className="flex-1">
                        {/* Search Indicator */}
                        {params.search && (
                            <div className="mb-6 flex items-center gap-3 text-sm">
                                <span className="text-gray-400">Searching for:</span>
                                <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold rounded-full font-medium">
                                    &quot;{params.search}&quot;
                                </span>
                                <Link
                                    href="/products"
                                    className="text-gray-400 hover:text-brand-dark underline transition-colors"
                                >
                                    Clear search
                                </Link>
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                            <p className="text-gray-500 text-sm font-light tracking-wide">
                                Showing {filteredProducts.length} Results{params.search ? ` for "${params.search}"` : ''}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">Sort by:</span>
                                <select className="bg-transparent text-sm text-brand-dark font-medium focus:outline-none cursor-pointer">
                                    <option>Featured</option>
                                    <option>Newest</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="py-20 text-center">
                                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-xl font-serif text-gray-400">Collection Empty</h3>
                                <p className="text-gray-400 font-light mt-2">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                                {filteredProducts.map((product) => {
                                    const offer = getOffer(product.offerId);

                                    return (
                                        <div key={product.id} className="group cursor-pointer">
                                            {/* Image Container */}
                                            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                        <Package className="w-8 h-8 text-gray-200" />
                                                    </div>
                                                )}

                                                {/* Overlay Actions */}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                    <button className="bg-white text-brand-dark px-6 py-3 text-sm tracking-widest uppercase hover:bg-brand-dark hover:text-white transition-colors duration-300">
                                                        Quick View
                                                    </button>
                                                </div>

                                                {/* Minimal Badges */}
                                                <div className="absolute top-0 left-0 p-3 flex flex-col gap-2">
                                                    {offer && (
                                                        <span className="bg-brand-dark text-white text-[10px] uppercase tracking-widest px-2 py-1">
                                                            -{offer.discount}
                                                        </span>
                                                    )}
                                                    {product.featured && (
                                                        <span className="bg-brand-gold text-white text-[10px] uppercase tracking-widest px-2 py-1">
                                                            Editor&apos;s Pick
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Minimal Details */}
                                            <div className="text-center">
                                                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                                                    {getCategoryName(product.categoryId)}
                                                </p>
                                                <h3 className="font-serif text-lg text-brand-dark group-hover:text-brand-gold transition-colors duration-300 mb-2">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center justify-center gap-3 text-sm">
                                                    <span className={`font-medium ${product.originalPrice ? 'text-brand-gold' : 'text-gray-600'}`}>
                                                        ₹{product.price.toLocaleString()}
                                                    </span>
                                                    {product.originalPrice && (
                                                        <span className="text-gray-400 line-through decoration-1">
                                                            ₹{product.originalPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
