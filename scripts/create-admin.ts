import * as admin from 'firebase-admin';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error("No .env.local found");
    process.exit(1);
}

function getAdminAuth() {
    if (!admin.apps.length) {
        try {
            const firebaseAdminConfig = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            };

            if (!firebaseAdminConfig.projectId || !firebaseAdminConfig.clientEmail || !firebaseAdminConfig.privateKey) {
                console.error("Missing Firebase Admin environment variables");
                process.exit(1);
            }

            admin.initializeApp({
                credential: admin.credential.cert(firebaseAdminConfig),
            });
        } catch (error) {
            console.error("Firebase Admin Init Error:", error);
            process.exit(1);
        }
    }
    return admin.auth();
}

async function createAdmin() {
    const email = "admin@smartavenue99.com";
    const password = "password123";

    console.log(`Creating/Updating admin user: ${email}`);

    try {
        const auth = getAdminAuth();
        try {
            const user = await auth.getUserByEmail(email);
            console.log("User already exists. Updating password...");
            await auth.updateUser(user.uid, { password });
            console.log("Password updated.");
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log("User does not exist. Creating...");
                await auth.createUser({
                    email,
                    password,
                    emailVerified: true
                });
                console.log("User created.");
            } else {
                throw error;
            }
        }
        console.log("Success!");
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
}

createAdmin();
