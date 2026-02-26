const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load env vars
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error("No .env found");
    process.exit(1);
}

function getAdminAuth() {
    if (!admin.apps.length) {
        try {
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

async function updateAdmin() {
    const email = "admin@gharana.com";
    const password = "123456";

    console.log(`Updating/Creating admin user: ${email}`);

    try {
        const auth = getAdminAuth();
        let user;
        try {
            user = await auth.getUserByEmail(email);
            console.log(`User ${email} exists. Updating password...`);
            await auth.updateUser(user.uid, { password });
            console.log("Password updated successfully.");
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log(`User ${email} not found. Creating...`);
                await auth.createUser({
                    email,
                    password,
                    emailVerified: true
                });
                console.log("User created successfully.");
            } else {
                throw error;
            }
        }

        // Also check if the old admin exists and maybe delete it? 
        // User didn't ask to delete, but it's good practice to keep it clean.
        // For now, I'll just leave it or list it.
        try {
            const oldEmail = "admin@smartavenue99.com";
            const oldUser = await auth.getUserByEmail(oldEmail);
            console.log(`Old admin user ${oldEmail} still exists (UID: ${oldUser.uid}).`);
        } catch (e) {
            // Old user not found, which is fine
        }

        console.log("Done!");
        process.exit(0);
    } catch (error) {
        console.error("Error updating admin:", error);
        process.exit(1);
    }
}

updateAdmin();
