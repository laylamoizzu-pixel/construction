
import * as admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// ── Firebase Admin Init ──
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
}

const firestore = admin.firestore();
const prisma = new PrismaClient();

async function migrateStaff() {
    console.log('\n👥 Migrating Staff...');
    const snapshot = await firestore.collection('staff').get();
    let count = 0;
    for (const doc of snapshot.docs) {
        const data = doc.data();
        await prisma.staff.upsert({
            where: { email: data.email },
            update: {
                name: data.name || 'Unnamed',
                phone: data.phone || null,
                role: data.role || 'editor',
                permissions: data.permissions || [],
                photoUrl: data.photoUrl || null,
            },
            create: {
                id: doc.id,
                email: data.email,
                name: data.name || 'Unnamed',
                phone: data.phone || null,
                role: data.role || 'editor',
                permissions: data.permissions || [],
                photoUrl: data.photoUrl || null,
                createdAt: data.createdAt?.toDate() || new Date(),
            },
        });
        count++;
    }
    console.log(`  ✅ ${count} staff members migrated.`);
}

async function migrateProductRequests() {
    console.log('\n📝 Migrating Product Requests...');
    const snapshot = await firestore.collection('product_requests').get();
    let count = 0;
    for (const doc of snapshot.docs) {
        const data = doc.data();
        await prisma.productRequest.upsert({
            where: { id: doc.id },
            update: {
                productName: data.productName || 'Unknown',
                brand: data.brand || null,
                description: data.description || '',
                contactInfo: data.userContact || data.contactInfo || null,
                status: (data.status?.toUpperCase() || 'PENDING') as any,
                notes: data.notes || null,
            },
            create: {
                id: doc.id,
                productName: data.productName || 'Unknown',
                brand: data.brand || null,
                description: data.description || '',
                contactInfo: data.userContact || data.contactInfo || null,
                status: (data.status?.toUpperCase() || 'PENDING') as any,
                notes: data.notes || null,
                createdAt: data.createdAt?.toDate() || new Date(),
            },
        });
        count++;
    }
    console.log(`  ✅ ${count} product requests migrated.`);
}

async function migratePageContent() {
    console.log('\n📄 Migrating Site Content and Pages...');
    const snapshot = await firestore.collection('siteContent').get();
    let count = 0;
    for (const doc of snapshot.docs) {
        const data = doc.data();
        // Since Page model expects specific structure, we'll store custom sections as pages with prefix if needed
        // or prioritize the content field.
        await prisma.page.upsert({
            where: { id: doc.id },
            update: {
                title: data.title || doc.id,
                content: JSON.stringify(data), // For custom sections, store the whole thing as stringified JSON if it's not a standard page
                lastUpdated: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
            },
            create: {
                id: doc.id,
                title: data.title || doc.id,
                content: JSON.stringify(data),
                lastUpdated: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
            },
        });
        count++;
    }
    console.log(`  ✅ ${count} content sections migrated to Page model.`);
}

async function migrateVercelBlobConfigs() {
    console.log('\n☁️ Migrating Site Config and Settings to Vercel Blob...');

    // 1. site_config
    const configSnap = await firestore.collection('site_config').doc('main').get();
    if (configSnap.exists) {
        const data = configSnap.data();
        await put('site_config.json', JSON.stringify(data, null, 2), {
            access: 'public',
            contentType: 'application/json',
            addRandomSuffix: false,
            allowOverwrite: true,
            token: process.env.BLOB_READ_WRITE_TOKEN
        });
        console.log('  ✅ site_config migrated to Vercel Blob.');
    }

    // 2. settings (AI settings)
    const settingsSnap = await firestore.collection('settings').doc('llm').get();
    if (settingsSnap.exists) {
        const data = settingsSnap.data();
        await put('llmo.json', JSON.stringify(data, null, 2), {
            access: 'public',
            contentType: 'application/json',
            addRandomSuffix: false,
            allowOverwrite: true,
            token: process.env.BLOB_READ_WRITE_TOKEN
        });
        console.log('  ✅ AI settings (llmo.json) migrated to Vercel Blob.');
    }
}

async function patchProductImages() {
    console.log('\n🖼️ Patching missing Product images...');
    const snapshot = await firestore.collection('products').get();
    let patched = 0;
    for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.imageUrl || (data.images && data.images.length > 0)) {
            await prisma.product.update({
                where: { id: doc.id },
                data: {
                    imageUrl: data.imageUrl || '',
                    images: data.images || [],
                }
            });
            patched++;
        }
    }
    console.log(`  ✅ Patched images for ${patched} products.`);
}

async function main() {
    try {
        console.log('🚀 Starting Complete Data Migration Patch');
        console.log('============================================');

        await migrateStaff();
        await migrateProductRequests();
        await migratePageContent();
        await migrateVercelBlobConfigs();
        await patchProductImages();

        console.log('\n============================================');
        console.log('🎉 Complete Migration Finished!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

main();
