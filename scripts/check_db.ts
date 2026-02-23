
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        // Log masked URL for debugging connection issues
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL not found in environment');
        }
        console.log(`Using database: ${dbUrl.split('@')[1]}`);

        await prisma.$connect();
        console.log('Connected successfully.');

        const productCount = await prisma.product.count();
        console.log(`Total products: ${productCount}`);

        if (productCount > 0) {
            const products = await prisma.product.findMany({
                take: 10,
                select: {
                    id: true,
                    name: true,
                    price: true,
                    createdAt: true
                }
            });
            console.log('Sample products:');
            console.table(products);
        } else {
            console.log('No products found in the database.');
        }
    } catch (error) {
        console.error('Error connecting to the database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
