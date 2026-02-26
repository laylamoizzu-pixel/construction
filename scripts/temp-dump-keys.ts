import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching all API keys from database...");
    const keys = await prisma.apiKey.findMany();
    console.log(JSON.stringify(keys, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
