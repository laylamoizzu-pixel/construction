"use server";

import prisma from "@/lib/db";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export interface PageContent {
    title: string;
    content: string;
    lastUpdated: string;
}

const DEFAULT_PAGES: Record<string, PageContent> = {
    privacy: {
        title: "Privacy Policy",
        content: `<h2>1. Introduction</h2>
<p>At Gharana Realtors, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform or visit our offices.</p>

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
<p>By accessing or using the Gharana Realtors website and platform services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

<h2>2. Use of Services</h2>
<p>You agree to use our services only for lawful purposes. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>

<h2>3. Product Information and Pricing</h2>
<p>We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions or other content are error-free. We reserve the right to correct any errors and to change or update information at any time.</p>

<h2>4. Limitation of Liability</h2>
<p>Gharana Realtors shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of, or inability to use, our services.</p>

<h2>5. Governing Law</h2>
<p>These terms are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in Patna, Bihar.</p>`,
        lastUpdated: "February 12, 2026",
    },
};

/**
 * Internal fetcher for page content.
 */
async function _fetchPageContent(pageId: string): Promise<PageContent> {
    try {
        const page = await prisma.page.findUnique({
            where: { id: pageId }
        });

        if (!page) {
            const defaultContent = DEFAULT_PAGES[pageId];
            if (defaultContent) {
                await prisma.page.create({
                    data: {
                        id: pageId,
                        title: defaultContent.title,
                        content: defaultContent.content,
                        lastUpdated: defaultContent.lastUpdated,
                    }
                });
                return defaultContent;
            }
            return { title: "", content: "", lastUpdated: "" };
        }

        return {
            title: page.title,
            content: page.content,
            lastUpdated: page.lastUpdated,
        };
    } catch (error) {
        console.error(`Error fetching page content for ${pageId}:`, error);
        return DEFAULT_PAGES[pageId] || { title: "", content: "", lastUpdated: "" };
    }
}

/**
 * Fetches page content with caching.
 */
export async function getPageContent(pageId: string): Promise<PageContent> {
    const cachedFetch = unstable_cache(
        () => _fetchPageContent(pageId),
        [`page-content-${pageId}`],
        { revalidate: 300, tags: ["pages", `page-${pageId}`] }
    );
    return cachedFetch();
}

/**
 * Updates page content in Firestore.
 */
export async function updatePageContent(
    pageId: string,
    data: PageContent
): Promise<{ success: boolean; error?: string }> {
    try {
        await prisma.page.upsert({
            where: { id: pageId },
            update: {
                title: data.title,
                content: data.content,
                lastUpdated: data.lastUpdated,
            },
            create: {
                id: pageId,
                title: data.title,
                content: data.content,
                lastUpdated: data.lastUpdated,
            }
        });

        revalidatePath(`/${pageId}`);
        revalidatePath(`/admin/content/${pageId}`);
        revalidateTag("pages");
        revalidateTag(`page-${pageId}`);

        return { success: true };
    } catch (error) {
        console.error(`Error updating page content for ${pageId}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update page content",
        };
    }
}
