
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Final Record Counts ---');
        const models = [
            'product',
            'category',
            'offer',
            'review',
            'productRequest',
            'staff',
            'page'
        ];

        const results = [];
        for (const model of models) {
            try {
                // @ts-ignore
                const count = await prisma[model].count();
                results.push({ model, count });
            } catch (err) {
                results.push({ model, count: 'Error' });
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
