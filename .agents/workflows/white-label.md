---
description: White-label rules — all code must be dynamic, never hardcode brand-specific values
---

# White-Label Development Rules

This codebase is designed to be **white-labeled and sold to multiple clients**. Every piece of code must be fully dynamic. **NEVER hardcode** any brand-specific values.

## ❌ NEVER Hardcode These

| Category | Example bad values | Where to get dynamically |
|----------|-------------------|--------------------------|
| Store/brand name | "Smart Avenue", "MyStore" | `config.branding.siteName` via `useSiteConfig()` (client) or `getSiteConfig()` (server) |
| AI persona name | "Genie", "Assistant" | `aiSettings.personaName` via `getAIConfig()` |
| AI greeting/prompt | Any greeting or system prompt text | `aiSettings.greeting` / `aiSettings.systemPrompt` via `getAIConfig()` |
| Domain URL | "https://smartavenue99.com" | `process.env.NEXT_PUBLIC_SITE_URL` |
| Admin email | "admin@example.com" | `process.env.SUPER_ADMIN_EMAIL` |
| Location/address | "Patna", "New York", any city | `config.contact.address` via `getSiteConfig()` |
| Phone number | Any phone number | `config.contact.phone` |
| Social links | Any social media URL | `config.branding.instagramUrl`, `config.footer.socialLinks` |
| Logo/favicon paths | Branded image paths | `config.branding.logoUrl`, `config.branding.faviconUrl` |
| SEO metadata | Branded titles, descriptions | `config.seo.*` |
| Legal content | Privacy policy, terms text | Firestore `siteContent` collection (admin-editable) |
| Colors/theme | Brand-specific hex values | `config.theme.*` |

## ✅ How to Access Configuration

### Server Components & Server Actions
```typescript
import { getSiteConfig } from "@/app/actions/site-config";
import { getAIConfig } from "@/lib/ai-config";

const config = await getSiteConfig();
const aiConfig = await getAIConfig();

// Use config.branding.siteName, aiConfig.personaName, etc.
```

### Client Components
```typescript
import { useSiteConfig } from "@/context/SiteConfigContext";

function MyComponent() {
  const { config } = useSiteConfig();
  // Use config.branding.siteName, config.theme.primaryColor, etc.
}
```

### Environment Variables
```typescript
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const superAdmin = process.env.SUPER_ADMIN_EMAIL;
```

## ✅ LLM Prompts — Dynamic Injection Pattern

When writing LLM prompts in `llm-service.ts`, always inject persona and store name dynamically:

```typescript
// ✅ CORRECT
const config = await getAIConfig();
const siteConfig = await getSiteConfig();
const prompt = `You are ${config.personaName}, a helpful assistant for ${siteConfig.branding.siteName}...`;

// ❌ WRONG
const prompt = `You are Genie, a helpful assistant for Smart Avenue...`;
```

## ✅ UI Fallback Pattern

When using config values in UI with fallbacks, use generic text:

```typescript
// ✅ CORRECT — generic fallback
{config.branding.siteName || "Store"}

// ❌ WRONG — brand-specific fallback
{config.branding.siteName || "Smart Avenue 99"}
```

## Configuration Architecture

```
┌─────────────────────────────────────────────┐
│                Firestore DB                 │
│  ┌──────────────────┐  ┌─────────────────┐  │
│  │ site_config/main │  │ aiSettings/main │  │
│  │  branding.*      │  │  personaName    │  │
│  │  theme.*         │  │  greeting       │  │
│  │  seo.*           │  │  systemPrompt   │  │
│  │  contact.*       │  │  temperature    │  │
│  │  footer.*        │  │  maxTokens      │  │
│  └──────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────┘
         ▲                       ▲
         │                       │
  getSiteConfig()          getAIConfig()
  useSiteConfig()        (server-only, cached 60s)
  (cached 300s)
```

## When Adding New Features

1. **Ask yourself**: "Does this text/value change per client?" → If yes, it MUST come from config
2. **Check existing config fields** in `src/types/site-config.ts` before adding new ones
3. **If a new config field is needed**, add it to the `SiteConfig` interface AND `DEFAULT_SITE_CONFIG` with a **generic** default value
4. **Add admin UI** in `src/app/admin/` to let clients edit the value
5. **Never use brand-specific text** as a default — use generic placeholders like "Your Store", "your@email.com", "Your City"
