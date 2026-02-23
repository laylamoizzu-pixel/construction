
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const prisma = new PrismaClient();

async function main() {
    try {
        const withImages = await prisma.product.count({
            where: {
                OR: [
                    { imageUrl: { not: "" } },
                    { images: { isEmpty: false } }
                ]
            }
        });

        const total = await prisma.product.count();

        console.log(`Products with images: ${withImages} / ${total}`);

        if (withImages > 0) {
            const sample = await prisma.product.findFirst({
                where: { imageUrl: { not: "" } },
                select: { name: true, imageUrl: true }
            });
            console.log('Sample with image:', sample);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
