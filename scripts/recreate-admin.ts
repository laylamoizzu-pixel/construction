
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Use require for robust compat with ts-node/register execution
const admin = require('firebase-admin');

async function recreateAdmin() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        console.error("Missing Firebase Admin environment variables.");
        process.exit(1);
    }

    try {
        const formattedKey = privateKey.replace(/\\n/g, '\n');

        if (admin.apps.length === 0) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: formattedKey,
                }),
            });
        }

        const email = 'admin@gharana.com';
        const password = '123456';

        console.log(`Checking for user ${email}...`);

        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            console.log(`User ${email} exists with UID: ${userRecord.uid}`);
            console.log(`Updating password to: ${password}`);
            await admin.auth().updateUser(userRecord.uid, {
                password: password
            });
            console.log("Password updated successfully.");
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log(`User ${email} not found. Creating...`);
                try {
                    const userRecord = await admin.auth().createUser({
                        email: email,
                        password: password,
                        emailVerified: true,
                    });
                    console.log(`User created successfully with UID: ${userRecord.uid}`);
                } catch (createError) {
                    console.error("Error creating user:", createError);
                }
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error("Error managing admin user:", error);
    }
}

recreateAdmin();
