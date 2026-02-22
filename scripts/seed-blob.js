const { admin, getAdminDb } = require('../../lib/firebase-admin');
const { updateBlobJson } = require('../../app/actions/blob-json');
const { DEFAULT_SITE_CONFIG } = require('../../types/site-config');

async function seedSiteConfig() {
    console.log("Seeding site config...");
    // Just save default config directly to ensure it exists
    await updateBlobJson("site_config.json", DEFAULT_SITE_CONFIG);
    console.log("Done.");
}

seedSiteConfig().catch(console.error);
