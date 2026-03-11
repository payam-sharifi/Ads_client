# Step 1 — Current Project Analysis

## Summary

| Aspect | Current State |
|--------|---------------|
| **Next.js Version** | 16.1.1 |
| **Router** | App Router |
| **i18n Library** | Custom (lib/i18n.ts) + next-i18next in package.json (unused) |
| **Supported Languages** | Persian (fa), German (de) — **English (en) missing** |
| **Locale Routing** | None — URLs are locale-agnostic (/, /category/[id], etc.) |
| **RTL Support** | Partial — `isRTL()` exists, layout hardcoded to `lang="fa" dir="rtl"` |
| **Translation Storage** | Inline in TypeScript (lib/i18n.ts) |
| **SEO** | Basic metadata only, no hreflang, no canonical |
| **Sitemap** | None |
| **Robots** | None |
| **Middleware** | None |
| **Language Detection** | Client-side only (localStorage) |

## Current Architecture

### Routing Structure
```
app/
  layout.tsx          # Root layout (hardcoded fa/rtl)
  page.tsx            # Home at /
  [locale]/page.tsx  # Duplicate home at /fa, /de (locale param unused for routing)
  login/page.tsx
  signup/page.tsx
  category/[id]/page.tsx
  ad/[id]/page.tsx
  ... (30+ pages)

```

### Translation System
- **lib/i18n.ts**: Inline translations object with `fa` and `de` keys
- **lib/contexts/I18nContext.tsx**: Client-side React context with `useState` + `localStorage`
- **getTranslations(locale)**: Returns translation object for locale
- **t(key)**: Simple dot-notation lookup (e.g. `t('nav.home')`)
- No interpolation support for `{min}`, `{max}` in validation messages

### Language Switching
- Toggle button in Navbar: `setLocale(locale === 'fa' ? 'de' : 'fa')`
- Only two options (fa/de)
- **Does not preserve route** — stays on same URL but changes content
- **Not SEO-friendly** — no unique URLs per language

### RTL
- `isRTL(locale)` returns `true` for `fa`
- `document.documentElement.dir` set in `useEffect` after mount
- Root layout has `lang="fa" dir="rtl"` hardcoded — **wrong for German users**

### SEO
- Single `metadata` in root layout — not localized
- No hreflang tags
- No canonical URLs
- No structured data (Schema.org)
- No Open Graph localization

## Identified Weaknesses

1. **No locale-based URLs** — Search engines cannot index different language versions
2. **English missing** — Requirement specifies en/de/fa
3. **Client-side only** — Initial HTML is always Persian (fa), bad for SEO
4. **Hardcoded root layout** — `lang` and `dir` don't reflect user locale
5. **No automatic language detection** — No middleware, no Accept-Language
6. **No sitemap** — Crawlers miss language variants
7. **Translations in TS** — Not scalable; no lazy loading
8. **Missing keys** — No detection or fallback for missing translations
9. **next-i18next unused** — Pages Router library; App Router needs next-intl
