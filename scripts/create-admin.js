const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load env vars
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
    console.log("Loaded .env.local");
} else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log("Loaded .env");
} else {
    console.error("No .env.local or .env found");
    process.exit(1);
}

function getAdminAuth() {
    if (!admin.apps.length) {
        try {
            // Check for private key
            const privateKey = process.env.FIREBASE_PRIVATE_KEY
                ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
                : undefined;

            if (!privateKey) {
                console.error("Missing FIREBASE_PRIVATE_KEY");
                process.exit(1);
            }

            const firebaseAdminConfig = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            };

            if (!firebaseAdminConfig.projectId || !firebaseAdminConfig.clientEmail) {
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
    const email = "admin@gharana.com";
    const password = "123456";

    console.log(`Creating/Updating admin user: ${email}`);

    try {
        const auth = getAdminAuth();
        let user;
        try {
            user = await auth.getUserByEmail(email);
            console.log("User already exists. Updating password...");
            await auth.updateUser(user.uid, { password });
            console.log("Password updated.");
        } catch (error) {
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
