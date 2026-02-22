# Required API Keys and Deployment Workflow

This document outlines the API keys needed to complete the current migration from Firebase to Neon/Vercel, and the exact keys a non-technical staff member will need to deploy a new white-labeled instance in the future.

---

## 1. Keys Needed NOW (For the Migration)

To transfer your 10,000+ products and move the current "Smart Avenue" site off Firebase entirely, I only need **ONE** thing from you:

*   **`DATABASE_URL`**: Your connection string for Neon Postgres.
    *   *Where to get it:* Go to your [Neon Dashboard](https://console.neon.tech/), click your project, and copy the "Connection String" (it looks like `postgresql://user:password@host/dbname`).

*(Note: Vercel Blob, Edge Config, and Cloudinary keys are already correctly set up in your current `.env.local` file).*

---

## 2. Keys Needed FOR FUTURE DEPLOYMENTS (By Non-Technical Staff)

When your staff wants to launch a *new* store for a *new* client, they will clone this codebase into Vercel. They will only need to provide **two external services**.

Here is their exact "Launch Checklist":

### Step A: Database & Authentication (Neon)
**Why:** This holds all the products, categories, users, and handles login.
1.  Go to [Neon.tech](https://neon.tech/) and create a new project.
2.  Enable **Neon Auth** in their dashboard.
3.  Copy the connection string.
**Keys Required in Vercel:**
*   `DATABASE_URL` = `postgresql://...`

### Step B: Images (Cloudinary)
**Why:** This optimizes and stores all product images.
1.  Go to [Cloudinary.com](https://cloudinary.com/) and create a free account.
2.  Go to the "Programmable Media" dashboard.
**Keys Required in Vercel:**
*   `CLOUDINARY_CLOUD_NAME` = `...`
*   `CLOUDINARY_API_KEY` = `...`
*   `CLOUDINARY_API_SECRET` = `...`

### Step C: Vercel Built-in Services
**Why:** File storage (like PDF receipts) and instant branding (Store Name, Colors).
1.  In the Vercel Dashboard, click the "Storage" tab.
2.  Click **Create Vercel Blob** (Auto-generates `BLOB_READ_WRITE_TOKEN`).
3.  Click **Create Edge Config** (Auto-generates `EDGE_CONFIG`).
**Keys Required:** *None (Vercel does this automatically).*

---

### Summary for Staff

To launch a new site, they only need to paste **4 lines of text** into Vercel:
1.  `DATABASE_URL` (From Neon)
2.  `CLOUDINARY_CLOUD_NAME` (From Cloudinary)
3.  `CLOUDINARY_API_KEY` (From Cloudinary)
4.  `CLOUDINARY_API_SECRET` (From Cloudinary)

Everything else (Auth, Vercel Blob, Edge Config) is handled automatically by the platform or built-in integrations!
