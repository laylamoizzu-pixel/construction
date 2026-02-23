
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected successfully.');

        const productCount = await prisma.product.count();
        console.log(`Total products: ${productCount}`);

        if (productCount > 0) {
            const products = await prisma.product.findMany({
                take: 5,
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
