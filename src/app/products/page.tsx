import { getProducts, getCategories, getOffers, Product, Category, Offer } from "@/app/actions";
import Link from "next/link";
import { Tag, Filter, Package, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage({
    searchParams
}: {
    searchParams: Promise<{ category?: string; subcategory?: string }>
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
    if (params.category) {
        filteredProducts = filteredProducts.filter(p =>
            p.categoryId === params.category || p.subcategoryId === params.category
        );
    }
    if (params.subcategory) {
        filteredProducts = filteredProducts.filter(p => p.subcategoryId === params.subcategory);
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
                    <p className="text-slate-300 text-lg max-w-2xl">
                        Explore our curated collection of premium home products at affordable prices.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Filter className="w-5 h-5 text-amber-500" />
                                Categories
                            </h3>
                            <nav className="space-y-1">
                                <Link
                                    href="/products"
                                    className={`block px-3 py-2 rounded-lg transition-colors ${!params.category ? "bg-amber-100 text-amber-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    All Products
                                </Link>
                                {mainCategories.map(cat => {
                                    const subs = getSubcategories(cat.id);
                                    const isActive = params.category === cat.id;
                                    return (
                                        <div key={cat.id}>
                                            <Link
                                                href={`/products?category=${cat.id}`}
                                                className={`block px-3 py-2 rounded-lg transition-colors ${isActive ? "bg-amber-100 text-amber-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                                                    }`}
                                            >
                                                {cat.name}
                                            </Link>
                                            {subs.length > 0 && (
                                                <div className="ml-4 mt-1 space-y-1">
                                                    {subs.map(sub => (
                                                        <Link
                                                            key={sub.id}
                                                            href={`/products?category=${cat.id}&subcategory=${sub.id}`}
                                                            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${params.subcategory === sub.id
                                                                    ? "bg-amber-50 text-amber-600"
                                                                    : "text-gray-500 hover:bg-gray-50"
                                                                }`}
                                                        >
                                                            <ChevronRight className="w-3 h-3" />
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

                    {/* Products Grid */}
                    <main className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-500">
                                Showing <span className="font-medium text-gray-800">{filteredProducts.length}</span> products
                            </p>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                                <p className="text-gray-500">Try selecting a different category or check back later.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => {
                                    const offer = getOffer(product.offerId);
                                    const hasDiscount = product.originalPrice && product.originalPrice > product.price;

                                    return (
                                        <article
                                            key={product.id}
                                            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow group"
                                        >
                                            {/* Image */}
                                            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-16 h-16 text-gray-300" />
                                                    </div>
                                                )}
                                                {/* Badges */}
                                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                    {offer && (
                                                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-lg">
                                                            <Tag className="w-3 h-3" />
                                                            {offer.discount}
                                                        </span>
                                                    )}
                                                    {hasDiscount && !offer && (
                                                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full shadow-lg">
                                                            SALE
                                                        </span>
                                                    )}
                                                    {product.featured && (
                                                        <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full shadow-lg">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="p-4">
                                                <p className="text-xs text-amber-600 font-medium mb-1">
                                                    {getCategoryName(product.categoryId)}
                                                    {product.subcategoryId && ` / ${getCategoryName(product.subcategoryId)}`}
                                                </p>
                                                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                                    {product.description}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold text-amber-600">
                                                        ₹{product.price.toLocaleString()}
                                                    </span>
                                                    {product.originalPrice && (
                                                        <span className="text-sm text-gray-400 line-through">
                                                            ₹{product.originalPrice.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                                {product.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-3">
                                                        {product.tags.slice(0, 3).map(tag => (
                                                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </article>
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
