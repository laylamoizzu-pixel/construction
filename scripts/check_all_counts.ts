
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        await prisma.$connect();
        console.log('Connected successfully.\n');

        const models = [
            'product',
            'category',
            'offer',
            'review',
            'productRequest',
            'apiKey',
            'newsletterSubscriber',
            'staff',
            'page'
        ];

        console.log('--- Record Counts ---');
        const results = [];
        for (const model of models) {
            try {
                // @ts-ignore
                const count = await prisma[model].count();
                results.push({ model, count });
            } catch (err) {
                results.push({ model, count: 'Error: ' + err.message });
            }
        }
        console.table(results);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
