import { MetadataRoute } from "next";
import { getSiteConfig } from "@/app/actions/site-config";
import { getProducts, getCategories, getDepartments } from "@/app/actions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await getSiteConfig();
    const baseUrl = "https://gharanarealtors.com"; // In real world use environment var or config URL

    // 1. Static Core Routes
    const defaultPages = [
        "",
        "/about",
        "/departments",
        "/products",
        "/offers",
        "/contact",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    // 2. Fetch Dynamic Data in Parallel
    let dynamicUrls: MetadataRoute.Sitemap = [];

    try {
        const [products, categories, departments] = await Promise.all([
            getProducts(undefined, undefined, 500), // Get up to 500 recent products
            getCategories(),
            getDepartments()
        ]);

        const productUrls = products.map((prod) => ({
            url: `${baseUrl}/products?category=${encodeURIComponent(prod.categoryId)}${prod.subcategoryId ? `&subCategory=${encodeURIComponent(prod.subcategoryId)}` : ""}`,
            lastModified: prod.updatedAt || prod.createdAt || new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.6,
        }));

        const categoryUrls = categories.map((cat) => ({
            url: `${baseUrl}/products?category=${encodeURIComponent(cat.name)}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));

        const departmentUrls = departments.map((dep) => ({
            url: `${baseUrl}/departments#${dep.id}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        }));

        // Ensure no duplicate URLs
        const allDynamic = [...productUrls, ...categoryUrls, ...departmentUrls];
        const uniqueUrls = new Map(allDynamic.map(item => [item.url, item]));
        dynamicUrls = Array.from(uniqueUrls.values());

    } catch (error) {
        console.error("Sitemap generation error:", error);
        // Fail gracefully, return at least static pages
    }

    return [...defaultPages, ...dynamicUrls];
}
