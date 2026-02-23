import { MetadataRoute } from "next";
import { getSiteConfig } from "@/app/actions/site-config";

export default async function robots(): Promise<MetadataRoute.Robots> {
    const config = await getSiteConfig();

    return {
        rules: {
            userAgent: "*",
            allow: config.system.maintenanceMode ? "/admin" : "/",
            disallow: config.system.maintenanceMode ? "/" : "/admin/",
        },
        sitemap: "https://smartavenue99.com/sitemap.xml",
    };
}
