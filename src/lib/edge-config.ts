import { createClient } from '@vercel/edge-config';

// Initialize the Edge Config client.
// It uses process.env.EDGE_CONFIG by default, but we can explicitly pass it if needed.
// This connection string is provided by Vercel when you create an Edge Config.
const edgeConfig = createClient(process.env.EDGE_CONFIG);

/**
 * Retrieves a value from Edge Config.
 * @param key The key to retrieve.
 * @returns The value associated with the key, or null if not found/error.
 */
export async function getEdgeConfigValue<T>(key: string): Promise<T | null> {
    if (!process.env.EDGE_CONFIG) {
        console.warn('EDGE_CONFIG environment variable is not set. Skipping Edge Config read.');
        return null;
    }

    try {
        const value = await edgeConfig.get<T>(key);
        if (value !== undefined) {
            return value as T;
        }
        return null;
    } catch (error) {
        console.error(`Error reading from Edge Config for key "${key}":`, error);
        return null; // Gracefully fallback if Edge Config fails
    }
}

/**
 * Checks if a key exists in Edge Config.
 */
export async function hasEdgeConfigKey(key: string): Promise<boolean> {
    if (!process.env.EDGE_CONFIG) return false;
    try {
        return await edgeConfig.has(key);
    } catch (error) {
        console.error(`Error checking Edge Config for key "${key}":`, error);
        return false;
    }
}
