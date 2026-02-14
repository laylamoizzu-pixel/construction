"use server";

import { getAdminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { cache } from "react";

const PAGES_COLLECTION = "pages";

export interface PageContent {
    title: string;
    content: string;
    lastUpdated: string;
}

const DEFAULT_PAGES: Record<string, PageContent> = {
    privacy: {
        title: "Privacy Policy",
        content: `<h2>1. Introduction</h2>
<p>At Smart Avenue, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our store or use our website.</p>

<h2>2. Information We Collect</h2>
<p>We may collect information that identifies, relates to, describes, or could reasonably be linked, directly or indirectly, with you or your household:</p>
<ul>
<li>Identifiers such as your name, alias, postal address, email address, or phone number.</li>
<li>Commercial information, including records of products purchased or considered.</li>
<li>Internet or other electronic network activity information.</li>
</ul>

<h2>3. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Process your transactions and manage your account.</li>
<li>Improve our products and services.</li>
<li>Send you promotional materials and updates (with your consent).</li>
<li>Ensure the security and integrity of our systems.</li>
</ul>

<h2>4. Sharing Your Information</h2>
<p>We do not sell your personal information. We may share your information with third-party service providers who perform services for us, such as payment processing and delivery services.</p>`,
        lastUpdated: "February 12, 2026",
    },
    terms: {
        title: "Terms of Service",
        content: `<h2>1. Acceptance of Terms</h2>
<p>By accessing or using the Smart Avenue website and store services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

<h2>2. Use of Services</h2>
<p>You agree to use our services only for lawful purposes. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>

<h2>3. Product Information and Pricing</h2>
<p>We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions or other content are error-free. We reserve the right to correct any errors and to change or update information at any time.</p>

<h2>4. Limitation of Liability</h2>
<p>Smart Avenue shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of, or inability to use, our services.</p>

<h2>5. Governing Law</h2>
<p>These terms are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in Patna, Bihar.</p>`,
        lastUpdated: "February 12, 2026",
    },
};

/**
 * Fetches page content from Firestore.
 */
export const getPageContent = cache(async function getPageContent(
    pageId: string
): Promise<PageContent> {
    try {
        const adminDb = getAdminDb();
        const docRef = adminDb.collection(PAGES_COLLECTION).doc(pageId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            const defaultContent = DEFAULT_PAGES[pageId];
            if (defaultContent) {
                await docRef.set(defaultContent);
                return defaultContent;
            }
            return { title: "", content: "", lastUpdated: "" };
        }

        return docSnap.data() as PageContent;
    } catch (error) {
        console.error(`Error fetching page content for ${pageId}:`, error);
        return DEFAULT_PAGES[pageId] || { title: "", content: "", lastUpdated: "" };
    }
});

/**
 * Updates page content in Firestore.
 */
export async function updatePageContent(
    pageId: string,
    data: PageContent
): Promise<{ success: boolean; error?: string }> {
    try {
        const adminDb = getAdminDb();
        const docRef = adminDb.collection(PAGES_COLLECTION).doc(pageId);
        await docRef.set(data);

        revalidatePath(`/${pageId}`);
        revalidatePath(`/admin/content/${pageId}`);

        return { success: true };
    } catch (error) {
        console.error(`Error updating page content for ${pageId}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update page content",
        };
    }
}
