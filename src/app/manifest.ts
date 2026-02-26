
import { MetadataRoute } from 'next';
import { getSiteConfig } from "@/app/actions/site-config";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const config = await getSiteConfig();
    const manifest = config.manifest;

    return {
        name: manifest.name || 'Gharana Realtors',
        short_name: manifest.shortName || 'Gharana Realtors',
        description: manifest.description || 'Gharana Realtors is your trusted construction and real estate partner.',
        start_url: manifest.startUrl || '/',
        display: manifest.display || 'standalone',
        background_color: manifest.backgroundColor || '#ffffff',
        theme_color: manifest.themeColor || '#0284c7',
        icons: [
            {
                src: config.branding.logoUrl || '/logo.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: config.branding.logoUrl || '/logo.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
    };
}
