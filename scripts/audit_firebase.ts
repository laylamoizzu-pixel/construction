
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

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

const db = admin.firestore();

async function auditCollection(name: string) {
    console.log(`\n--- Auditing Collection: ${name} ---`);
    const snapshot = await db.collection(name).limit(3).get();
    if (snapshot.empty) {
        console.log('Collection is empty.');
    } else {
        console.log(`Found ${snapshot.size} documents.`);
        snapshot.forEach(doc => {
            console.log(`Document ID: ${doc.id}`);
            // Log keys to see what's inside
            console.log(`Fields: ${Object.keys(doc.data()).join(', ')}`);
        });
    }
}

async function main() {
    try {
        const collections = [
            'products',
            'categories',
            'offers',
            'reviews',
            'pages',
            'settings',
            'siteContent',
            'site_config',
            'staff',
            'product_requests'
        ];

        for (const col of collections) {
            await auditCollection(col);
        }
    } catch (error) {
        console.error('Audit failed:', error);
    } finally {
        process.exit(0);
    }
}

main();
