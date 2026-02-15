

import { searchProducts, getProducts, createCategory, createProduct, deleteProduct, deleteCategory } from '../src/app/actions';
import { getAdminDb } from '../src/lib/firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function run() {
    console.log("Running reproduction script...");

    // Setup: Create a test Main Category and Subcategory
    let mainCatId = "";
    let subCatId = "";
    let productId = "";

    try {
        const db = getAdminDb();
        console.log("Connected to Firestore.");

        // Create categories
        console.log("Creating test categories...");
        const categoriesCollection = db.collection("categories");

        // Manual Create Main
        const mainRef = await categoriesCollection.add({
            name: "TestMain_" + Date.now(),
            slug: "test-main-" + Date.now(),
            parentId: null,
            order: 0,
            createdAt: new Date()
        });
        mainCatId = mainRef.id;

        // Manual Create Sub
        const subRef = await categoriesCollection.add({
            name: "TestSub_" + Date.now(),
            slug: "test-sub-" + Date.now(),
            parentId: mainCatId,
            order: 1,
            createdAt: new Date()
        });
        subCatId = subRef.id;

        console.log(`Created Main Cat: ${mainCatId}, Sub Cat: ${subCatId}`);

        // Create product in Sub Category
        console.log("Creating test product...");
        const productsCollection = db.collection("products");
        const productRef = await productsCollection.add({
            name: "TestProduct_" + Date.now(),
            description: "A test product",
            price: 100,
            categoryId: mainCatId,
            subcategoryId: subCatId,
            available: true,
            images: [],
            imageUrl: "",
            tags: ["test"],
            createdAt: new Date(),
            updatedAt: new Date()
        });
        productId = productRef.id;
        console.log(`Created Product: ${productId} in Sub Cat ${subCatId}`);

        // --- Test 1: Availability (Previous Issue) ---
        // Skipping for brevity as we confirmed it, but keeping the logic if needed later

        // --- Test 2: Category Filter ---
        console.log("\n--- Test 2: Category Filter via getProducts ---");

        // 2a. Filter by Main Category
        console.log(`Testing filter by Main Category ID: ${mainCatId}`);
        const resMain = await getProducts(mainCatId);
        const foundMain = resMain.find(p => p.id === productId);
        if (foundMain) {
            console.log("SUCCESS: Found product by Main Category.");
        } else {
            console.error("FAILURE: Did not find product by Main Category.");
        }

        // 2b. Filter by Sub Category (The suspected issue)
        console.log(`Testing filter by Sub Category ID: ${subCatId}`);
        // In the current UI, if user selects subcategory, it passes subCatId as first arg to getProducts
        const resSub = await getProducts(subCatId);
        const foundSub = resSub.find(p => p.id === productId);

        if (foundSub) {
            console.log("SUCCESS: Found product by Sub Category.");
        } else {
            console.error("FAILURE: Did not find product by Sub Category (Expected if getProducts only checks categoryId).");
        }

        // --- Test 3: Search with Category Filter ---
        console.log("\n--- Test 3: Search with Category Filter ---");
        // searchProducts(query, categoryId, subcategoryId, includeUnavailable)
        // Scenario A: User selects Subcategory in UI. UI passes subCatId as `categoryId` (2nd arg).
        console.log(`Testing searchProducts with query='Test' and categoryId=${subCatId} (as passed by UI for subcat)`);
        const resSearchSub = await searchProducts("TestProduct", subCatId, undefined, true); // true to include our product (it is available)

        const foundSearchSub = resSearchSub.find(p => p.id === productId);
        if (foundSearchSub) {
            console.log("SUCCESS: Found product via search with Sub Category ID passed as categoryId.");
        } else {
            console.error("FAILURE: Did not find product via search with Sub Category ID passed as categoryId.");
            // Debug why
            // searchProducts checks: p.categoryId === id || p.subcategoryId === id.
            // product.subcategoryId is subCatId. So this SHOULD pass.
        }

    } catch (e) {
        console.error("Error executing script:", e);
    } finally {
        // Cleanup
        console.log("\nCleaning up...");
        if (productId) await deleteProduct(productId);
        if (subCatId) await deleteCategory(subCatId);
        if (mainCatId) await deleteCategory(mainCatId);
    }
}

run().then(() => process.exit(0));
