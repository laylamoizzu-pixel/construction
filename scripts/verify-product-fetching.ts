
const fs = require('fs');
const path = require('path');

function verifyProductFetchingFix() {
    console.log("Verifying Product Fetching Fix...");

    // 1. Verify actions.ts update
    const actionsPath = path.join(process.cwd(), 'src/app/actions.ts');
    const actionsContent = fs.readFileSync(actionsPath, 'utf8');

    if (actionsContent.includes('includeUnavailable: boolean = false') &&
        actionsContent.includes('includeUnavailable ? allProducts : allProducts.filter(p => p.available)')) {
        console.log("SUCCESS: `searchProducts` in `actions.ts` is updated correctly.");
    } else {
        console.error("FAILURE: `searchProducts` in `actions.ts` is NOT updated correctly.");
        console.log("DEBUG: Search Query Signature Matches:", actionsContent.includes('includeUnavailable: boolean = false'));
        console.log("DEBUG: Filter Logic Matches:", actionsContent.includes('includeUnavailable ? allProducts : allProducts.filter(p => p.available)'));
        process.exit(1);
    }

    // 2. Verify admin page update
    const adminPagePath = path.join(process.cwd(), 'src/app/admin/content/products/page.tsx');
    const adminPageContent = fs.readFileSync(adminPagePath, 'utf8');

    if (adminPageContent.includes('const limit = 100;') &&
        adminPageContent.includes('await searchProducts(searchQuery, categoryFilter, undefined, true);') &&
        adminPageContent.includes('Load More Products')) {
        console.log("SUCCESS: Admin products page logic and UI updated.");
    } else {
        console.error("FAILURE: Admin products page NOT updated correctly.");
        console.log("DEBUG: Limit Matches:", adminPageContent.includes('const limit = 100;'));
        console.log("DEBUG: Search Call Matches:", adminPageContent.includes('await searchProducts(searchQuery, categoryFilter, undefined, true);'));
        console.log("DEBUG: UI Button Matches:", adminPageContent.includes('Load More Products'));
        process.exit(1);
    }

    console.log("\nALL VERIFICATIONS PASSED!");
}

verifyProductFetchingFix();
