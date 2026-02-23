
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const prisma = new PrismaClient();

async function main() {
    try {
        const product = await prisma.product.findFirst({
            where: { imageUrl: { not: null } }
        });

        if (product) {
            console.log('--- Sample Migrated Product Content ---');
            console.log(JSON.stringify(product, null, 2));
        } else {
            console.log('No products with images found.');
        }

        const siteConfig = await prisma.page.findFirst();
        if (siteConfig) {
            console.log('\n--- Sample Migrated Page Content ---');
            console.log(`Title: ${siteConfig.title}`);
            console.log(`Content Length: ${siteConfig.content.length} characters`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
