require('dotenv').config();
const { list } = require('@vercel/blob');

async function testBlob() {
    console.log("--- Testing Vercel Blob ---");
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
        console.error("❌ BLOB_READ_WRITE_TOKEN is missing in .env.local");
        process.exit(1);
    }

    console.log("Token found (starts with):", token.substring(0, 15) + "...");

    try {
        console.log("Calling @vercel/blob list()...");
        const { blobs } = await list({ token });
        console.log(`✅ Success! Found ${blobs.length} blobs.`);
        if (blobs.length > 0) {
            console.log("First blob URL:", blobs[0].url);
        }
    } catch (error) {
        console.error("❌ Vercel Blob Error:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
        }
    }
}

testBlob();
