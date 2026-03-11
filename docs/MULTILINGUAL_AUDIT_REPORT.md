# Multilingual Architecture — Audit Report

## Step 1 — Feature Audit

| Feature | Status | Explanation | Recommended Improvement |
|---------|--------|--------------|------------------------|
| **1. Localized Slugs** | **Partial** | No `pathnames` in routing (would break router typing). `i18n/pathnames.ts` added as reference. Enabling requires updating all `router.push()` to object form. | See `i18n/pathnames.ts` for mapping. Enable by adding to routing.ts and migrating router calls. |
| **2. Static Generation per Locale** | **Partial** | `generateStaticParams` exists in `[locale]/layout.tsx` returning `{ locale }` for en/de/fa. `setRequestLocale` is called. Child pages (category/[id], ad/[id]) are dynamic and not pre-rendered. | Layout-level static params are correct. Dynamic pages cannot be fully static without fetching all IDs at build time. |
| **3. Localized Sitemap URLs** | **Implemented** | Sitemap has `alternates.languages`, `lastModified`, `changeFrequency`, `priority` for all static paths. | Add dynamic routes (category/[id], ad/[id]) if needed; consider sitemap index for scale. |
| **4. Translation Fallback** | **Implemented** | Messages merged: `deepMerge(fallbackMessages, localeMessages)` so fa/de fall back to English for missing keys. | — |
| **5. Translation Caching** | **Implemented** | Messages now use `unstable_cache` with 1h revalidate and `messages-${locale}` tag. | — |
| **6. Geo-Based Language Detection** | **Implemented** | Proxy checks `x-vercel-ip-country` / `cf-ipcountry` for root visits: DE/AT/CH → /de, IR/AF/TJ → /fa. | — |
| **7. CDN Caching per Locale** | **Implemented** | `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` for `/:locale` and `/:locale/:path*`. | — |
