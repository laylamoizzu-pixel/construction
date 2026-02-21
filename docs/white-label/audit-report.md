# White-Label Audit Report

> **Date**: 2026-02-21  
> **Status**: Audit complete — changes pending

## Summary

This codebase has **50+ hardcoded brand references** that must be made dynamic before white-labeling. The existing `SiteConfig` (Firestore-backed) and `AISettings` systems already support dynamic values, but many files bypass them with hardcoded fallbacks.

---

## Hardcoded Values Found

### 1. Brand Name — "Smart Avenue" (~45 occurrences)

| File | Lines | Context |
|------|-------|---------|
| `src/types/site-config.ts` | 188, 292-293, 321-322, 325, 340 | `DEFAULT_SITE_CONFIG` defaults |
| `src/lib/llm-service.ts` | 568, 619, 640, 693, 783, 841, 867, 890, 914, 956, 1016, 1058, 1106, 1137, 1175 | LLM prompt strings |
| `src/lib/ai-config.ts` | 43 | Fallback system prompt |
| `src/components/Hero.tsx` | 76 | Hardcoded badge text |
| `src/components/Header.tsx` | 183 | Logo alt text fallback |
| `src/components/Footer.tsx` | 133 | Copyright fallback |
| `src/components/AboutContent.tsx` | 16, 20, 197 | Default about page content |
| `src/components/PwaInstallPrompt.tsx` | 92, 98 | PWA prompt fallbacks |
| `src/components/assistant/AssistantChat.tsx` | 601 | Footer text |
| `src/app/layout.tsx` | 32-33 | Title fallbacks |
| `src/app/manifest.ts` | 10-12 | PWA manifest fallbacks |
| `src/app/admin/login/page.tsx` | 110 | Copyright text |
| `src/app/admin/content/cta/page.tsx` | 17 | Default CTA text |
| `src/app/admin/content/about/page.tsx` | 16, 22 | Default about content |
| `src/app/actions/ai-settings-actions.ts` | 24-26, 117 | AI settings defaults |
| `src/app/actions/page-content.ts` | 19, 45, 54 | Privacy/Terms defaults |
| `src/app/api/assistant/settings/route.ts` | 21-22 | API fallback defaults |

### 2. Persona Name — "Genie" (~40 occurrences)

| File | Lines | Context |
|------|-------|---------|
| `src/lib/llm-service.ts` | 619, 625, 640, 646, 693, 702, 751, 783, 788, 1175 | All LLM prompts |
| `src/lib/ai-config.ts` | 41-42 | Fallback defaults |
| `src/components/GenieRequestTrigger.tsx` | 52, 61 | UI labels |
| `src/components/Header.tsx` | 16-17 | Nav links "Genie Stylist", "Genie Gift Finder" |
| `src/components/ProductRequestModal.tsx` | 96 | Modal title |
| `src/components/assistant/AssistantChat.tsx` | 64-65, 145, 226 | Chat fallbacks |
| `src/components/ai/StylistInterface.tsx` | 69, 201 | UI labels |
| `src/components/ai/GiftConciergeInterface.tsx` | 70, 229 | UI labels |
| `src/components/ai/LanguageAssistant.tsx` | 12, 68, 163 | Chat/UI labels |
| `src/components/admin/AdminSidebar.tsx` | 133 | Sidebar label |
| `src/app/stylist/page.tsx` | 18 | Page title |
| `src/app/gift-finder/page.tsx` | 15, 18 | Page title |
| `src/app/actions/ai-settings-actions.ts` | 24-26 | Default settings |
| `src/app/admin/ai-settings/page.tsx` | 45, 156, 238, 252 | Placeholder and label text |
| `src/app/api/assistant/settings/route.ts` | 21-22 | API defaults |

### 3. Domain URL — "smartavenue99.com" (~10 occurrences)

| File | Lines | Context |
|------|-------|---------|
| `src/app/layout.tsx` | 30, 46 | `metadataBase`, OpenGraph URL |
| `src/app/sitemap.ts` | 4 | `baseUrl` |
| `src/app/robots.ts` | 26 | Sitemap URL |
| `src/types/site-config.ts` | 288, 341 | Default robotsTxt, JSON-LD |

### 4. Super Admin Email — "admin@smartavenue99.com" (3 occurrences)

| File | Lines | Context |
|------|-------|---------|
| `src/app/actions.ts` | 397, 1063 | Hardcoded super admin bypass |
| `src/lib/data.ts` | 190 | Staff role lookup |

### 5. Location — "Patna" (~9 occurrences)

| File | Lines | Context |
|------|-------|---------|
| `src/types/site-config.ts` | 234, 275 | Footer tagline, contact address |
| `src/components/AboutContent.tsx` | 19, 197, 236 | About page defaults, Google Maps embed |
| `src/app/products/[id]/page.tsx` | 38 | Store location default |
| `src/app/actions/page-content.ts` | 57 | Terms of Service legal jurisdiction |
| `src/app/admin/content/about/page.tsx` | 20 | Admin about defaults |
| `src/app/admin/content/specific-product-page/page.tsx` | 18 | Product page default |

### 6. Other Hardcoded Content

- **Google Site Verification**: `layout.tsx` line 60 — hardcoded verification code
- **Placeholder emails**: `john@smartavenue.com`, `contact@smartavenue.com` in admin forms

---

## Resolution Strategy

| Category | Solution |
|----------|----------|
| Brand name | Pull from `config.branding.siteName` |
| Persona name | Pull from `aiSettings.personaName` |
| Domain URL | New env var `NEXT_PUBLIC_SITE_URL` |
| Super admin email | New env var `SUPER_ADMIN_EMAIL` |
| Location/address | Pull from `config.contact.address` |
| Legal content | Already admin-editable via `siteContent` |
| Google verification | Already in `config.seo.googleVerification` |

The existing `SiteConfig` and `AISettings` systems are well-designed — the issue is that fallback values and LLM prompts bypass them.
