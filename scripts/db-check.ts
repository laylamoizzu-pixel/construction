
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- DB Product Check ---");

    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: 'VINTAGE', mode: 'insensitive' } },
                { name: { contains: 'WATCH', mode: 'insensitive' } },
                { category: { name: { contains: 'Jewelry', mode: 'insensitive' } } }
            ]
        },
        include: {
            category: true
        }
    });

    console.log(JSON.stringify(products, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
