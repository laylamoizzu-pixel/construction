// import { getProducts, getCategories, getOffers, searchProducts, Product, Category, Offer } from "@/lib/data";
// import Link from "next/link";
// import { Package, Search, ChevronRight, Zap, ArrowLeft, Tag } from "lucide-react";
// import Image from "next/image";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

export default async function ProductsPage() {
    // searchParams
    // }: {
    //     searchParams: Promise<{ category?: string; subcategory?: string; search?: string }>
    // }) {
    // const params = await searchParams;

    // Fake data
    // const products: any[] = [];
    // const categories: any[] = [];
    // const offers: any[] = [];
    // const params: any = {};

    // const mainCategories = categories.filter(c => !c.parentId);
    // const getSubcategories = (parentId: string) => categories.filter(c => c.parentId === parentId);
    // const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "Unknown";
    // const getOffer = (id?: string) => id ? offers.find(o => o.id === id) : null;

    // // Filter products
    // let filteredProducts = params.search
    //     ? products
    //     : products.filter(p => p.available);

    return (
        <div className="min-h-screen bg-slate-50">
            <h1>Debug Mode - No Data Imports</h1>
            <div className="container mx-auto px-4 py-12">
                <p>Checking if app recovers...</p>
            </div>
        </div>
    );
}
