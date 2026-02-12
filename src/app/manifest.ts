
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Smart Avnue',
        short_name: 'Smart Avnue',
        description: 'We are a one-stop departmental store offering a wide range of home essentials, stylish home décor, premium kitchenware, and more.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#f59e0b',
        icons: [
            {
                src: '/logo.png',
                sizes: 'any',
                type: 'image/png',
            },
            {
                src: '/icon.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/apple-icon.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
