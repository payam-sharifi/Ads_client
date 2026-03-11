/**
 * Localized pathname mappings for future implementation.
 * Enabling these in routing.ts requires updating all router.push() calls
 * to use the object form: router.push({ pathname: '/', query: {...} })
 *
 * Example localized URLs:
 * - /en/categories  /de/kategorien  /fa/dasteh-band
 * - /en/category/123  /de/kategorie/123  /fa/dasteh/123
 * - /en/contact  /de/kontakt  /fa/tamas
 */
export const pathnamesConfig = {
  '/': '/',
  '/categories': { de: '/kategorien', fa: '/dasteh-band' },
  '/category/[id]': { de: '/kategorie/[id]', fa: '/dasteh/[id]' },
  '/create-ad': { de: '/anzeige-erstellen', fa: '/sakht-aghahi' },
  '/contact': { de: '/kontakt', fa: '/tamas' },
  '/login': { de: '/anmelden', fa: '/vorud' },
  '/signup': { de: '/registrieren', fa: '/sabt-nam' },
  '/dashboard': { de: '/mein-bereich', fa: '/dashbord' },
  '/messages': { de: '/nachrichten', fa: '/payam-ha' },
  '/privacy': { de: '/datenschutz', fa: '/rahimi-shakhsi' },
  '/terms': { de: '/nutzungsbedingungen', fa: '/shorayet' },
  '/help': { de: '/hilfe', fa: '/rahnamaei' },
} as const;
