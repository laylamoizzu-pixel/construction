/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { getAnalytics, isSupported } from "firebase/analytics";
import { getPerformance } from "firebase/performance";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase for SSR compatibility
let app: any = null;
let auth: any = null;
let analytics: any = null;
let perf: any = null;

const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

if (typeof window !== "undefined") {
    try {
        if (isConfigValid) {
            app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            auth = getAuth(app);
            
            // Initialize Analytics and Performance only in the browser
            isSupported().then((yes: boolean) => {
                if (yes) analytics = getAnalytics(app);
            });
            perf = getPerformance(app);
        } else {
            console.warn("Firebase configuration is missing or incomplete. Auth and other services will be disabled.");
        }
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
}

export { app, auth, analytics, perf };
