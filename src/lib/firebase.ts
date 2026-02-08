/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for SSR compatibility
let app: any;
let auth: any;
let db: any;
let analytics: any;
let storage: any;

try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    // Initialize Analytics only in the browser
    analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;
    storage = getStorage(app);
} catch (error) {
    console.error("Firebase initialization failed:", error);
    // Provide dummy objects to prevent import crashes, but functional calls will fail
    app = null;
    auth = {} as any;
    db = {} as any;
    analytics = Promise.resolve(null);
    storage = {} as any;
}

export { app, auth, db, analytics, storage };
