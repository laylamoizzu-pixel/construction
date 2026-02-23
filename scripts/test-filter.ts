import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany();

    // Find "Bathroom Ware"
    const bw = categories.find(c => c.name.toLowerCase().includes("bathroom"));
    if (!bw) {
        console.log("No category containing 'bathroom' found.");
        return;
    }
    console.log(`Found category: ${bw.name} (ID: ${bw.id}, parentId: ${bw.parentId})`);

    // Get DB product count for EXACTLY this categoryId
    const countById = await prisma.product.count({ where: { categoryId: bw.id } });
    console.log(`Products with categoryId = ${bw.id}: ${countById}`);

    // Get DB product count for subcategoryId
    const countBySub = await prisma.product.count({ where: { subcategoryId: bw.id } });
    console.log(`Products with subcategoryId = ${bw.id}: ${countBySub}`);

    // Check if it has child categories
    const children = await prisma.category.findMany({ where: { parentId: bw.id } });
    console.log(`\nChild categories of ${bw.name}: ${children.length}`);
    for (const child of children) {
        const prodCount = await prisma.product.count({ where: { categoryId: child.id } });
        console.log(`  - ${child.name} (ID: ${child.id}) -> ${prodCount} products`);
    }

    // List a few actual products in the DB and see what category they have
    console.log("\nSample 5 products to see their category mapping:");
    const sample = await prisma.product.findMany({ take: 5, select: { name: true, categoryId: true, subcategoryId: true } });
    for (const p of sample) {
        const catName = categories.find(c => c.id === p.categoryId)?.name || "UNKNOWN";
        const subName = categories.find(c => c.id === p.subcategoryId)?.name || "NONE";
        console.log(`  - ${p.name}`);
        console.log(`      categoryId: ${p.categoryId} (${catName})`);
        console.log(`      subcategoryId: ${p.subcategoryId} (${subName})`);
    }
}

main().finally(() => prisma.$disconnect());
