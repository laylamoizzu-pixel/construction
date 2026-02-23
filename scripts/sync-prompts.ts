import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Since v8/v12 features often use Vercel Blob, we need to bypass Next.js server actions in scripts sometimes.
// But we can just use fetch to hit a temporary API route, or we can just run a script that imports the action.

import { DEFAULT_PROMPTS } from '../src/lib/prompt-defaults';
import { put, list } from '@vercel/blob';

const BLOB_FILENAME = "llmo_prompts.json";

async function syncPrompts() {
    console.log(`Syncing '${BLOB_FILENAME}' with updated codebase defaults...`);
    try {
        const { blobs } = await list({
            prefix: BLOB_FILENAME,
            limit: 1,
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        let currentData: any = {};
        if (blobs.length > 0) {
            const url = blobs[0].url;
            const response = await fetch(url);
            if (response.ok) {
                currentData = await response.json();
            }
        }

        // Let's explicitly overwrite intent-analyze
        if (currentData['intent-analyze']) {
            console.log("Found existing intent-analyze prompt in database. Updating it to match new defaults...");
            currentData['intent-analyze'] = {
                ...currentData['intent-analyze'],
                systemPrompt: DEFAULT_PROMPTS['intent-analyze'].systemPrompt,
                updatedAt: new Date().toISOString()
            };

            const jsonString = JSON.stringify(currentData, null, 2);
            await put(BLOB_FILENAME, jsonString, {
                access: 'public',
                contentType: 'application/json',
                addRandomSuffix: false,
                allowOverwrite: true,
                token: process.env.BLOB_READ_WRITE_TOKEN
            });

            console.log("✅ Successfully synced intent-analyze prompt to Vercel Blob.");
        } else {
            console.log("intent-analyze prompt not found in DB overrides. It will naturally use the codebase default.");
        }
    } catch (e) {
        console.error("Error syncing prompts:", e);
    }
}

syncPrompts();
