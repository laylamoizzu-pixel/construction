import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { getAdminDb } from '../src/lib/firebase-admin';
import { getReviews, getProducts } from '../src/app/actions';

async function test() {
    console.log("Fetching products...");
    const products = await getProducts();
    if (products.length === 0) {
        console.log("No products found.");
        return;
    }

    const firstProduct = products[0];
    console.log(`Testing reviews for product: ${firstProduct.name} (${firstProduct.id})`);

    // Check if reviewCount is > 0
    console.log(`Product says it has ${firstProduct.reviewCount} reviews.`);

    console.log("Calling getReviews(productId)...");
    const reviews = await getReviews(firstProduct.id);
    console.log(`Found ${reviews.length} reviews.`);

    if (reviews.length > 0) {
        console.log("First review:", reviews[0]);
    } else {
        console.log("No reviews found for this product.");

        // Let's see if there are ANY reviews in the collection
        const allReviewsSnapshot = await getAdminDb().collection("reviews").get();
        console.log(`Total reviews in collection: ${allReviewsSnapshot.size}`);
        if (allReviewsSnapshot.size > 0) {
            console.log("Sample review from collection:", allReviewsSnapshot.docs[0].data());
        }
    }
}

test().catch(console.error);
