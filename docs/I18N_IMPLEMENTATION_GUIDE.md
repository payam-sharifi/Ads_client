# Multilingual Architecture — Implementation Guide

## Overview

The JarBezan! project now uses a production-grade multilingual architecture with **next-intl** for Next.js 16 App Router, supporting **English (en)**, **German (de)**, and **Persian (fa)**.

---

## Folder Structure

```
Ads_client/
├── app/
│   ├── layout.tsx              # Root layout (html, lang, dir)
│   ├── [locale]/               # Locale-prefixed routes
│   │   ├── layout.tsx          # Main layout, metadata, structured data
│   │   ├── page.tsx            # Home: /en, /de, /fa
│   │   ├── login/
│   │   ├── signup/
│   │   ├── category/[id]/
│   │   ├── ad/[id]/
│   │   ├── ... (all pages)
│   ├── sitemap.ts              # Dynamic sitemap with hreflang
│   └── robots.ts               # robots.txt
├── i18n/
│   ├── routing.ts              # Locales, defaultLocale, localePrefix
│   ├── request.ts              # getRequestConfig, message loading
│   └── navigation.ts           # Link, useRouter, usePathname
├── messages/
│   ├── en.json
│   ├── de.json
│   └── fa.json
├── proxy.ts                    # Locale detection, redirects (Next.js 16)
├── lib/
│   ├── utils/locale.ts         # isRTL, Locale type
│   ├── contexts/I18nContext.tsx # useI18n compatibility hook
│   └── seo/structuredData.ts   # Schema.org JSON-LD
└── scripts/
    └── check-missing-translations.ts
```

---

## How to Add New Translations

1. **Add keys to `messages/en.json`** (reference locale)
2. **Add the same keys to `messages/de.json` and `messages/fa.json`**
3. **Use in components:**
   ```tsx
   const { t } = useI18n();
   return <span>{t('namespace.key')}</span>;
   ```
4. **Check for missing keys:**
   ```bash
   npm run i18n:check
   ```

---

## How to Add a New Language

1. **Create `messages/xx.json`** (copy from `en.json` and translate)
2. **Update `i18n/routing.ts`:**
   ```ts
   locales: ['en', 'de', 'fa', 'xx'],
   ```
3. **Update `lib/utils/locale.ts`** if the new language has different RTL behavior
4. **Update `lib/utils/localizedNames.ts`** for backend multilingual names
5. **Run `npm run i18n:check`**

---

## SEO System

### Locale Detection (proxy.ts)
- **Priority 1:** Locale in URL (e.g. `/de/about`)
- **Priority 2:** Cookie (`NEXT_LOCALE`)
- **Priority 3:** `Accept-Language` header
- **Fallback:** `defaultLocale` (fa)

### Root Redirect
- Visiting `/` redirects to `/{detected-locale}` (e.g. `/fa` or `/de`)

### Metadata (generateMetadata in [locale]/layout.tsx)
- **Title & description** per locale
- **Canonical URL** per page
- **Alternate links (hreflang)** for en, de, fa
- **Open Graph** (og:title, og:description, og:locale, og:image)
- **Twitter Card** metadata

### Sitemap
- **URL:** `/sitemap.xml`
- **Content:** All static paths with `alternates.languages` (hreflang)
- **Paths:** Home, categories, contact, login, signup, dashboard, admin, etc.

### Structured Data (Schema.org)
- **Organization**
- **WebSite** (with SearchAction)
- **WebPage**

---

## RTL Support

- **Persian (fa):** `dir="rtl"`, `lang="fa"`
- **German (de), English (en):** `dir="ltr"`, `lang="de"` / `lang="en"`

The root layout sets `html` `dir` and `lang` dynamically via `getLocale()`.
Toast position and layout direction adapt per locale.

---

## Language Switcher

- **Component:** `components/common/LanguageSwitcher.tsx`
- **Behavior:** Uses `router.replace(pathname, { locale })` to switch language while preserving the current route
- **SEO:** Generates proper locale-prefixed URLs

---

## Performance

- **Static rendering:** `generateStaticParams` + `setRequestLocale` for static pages
- **Lazy loading:** Messages loaded per locale in `i18n/request.ts`
- **Minimal bundle:** next-intl is ~2KB (vs 8KB for react-i18next)
