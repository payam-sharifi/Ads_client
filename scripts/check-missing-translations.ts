/**
 * Detects missing translation keys across locale files.
 * Run with: npx tsx scripts/check-missing-translations.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const LOCALES = ['en', 'de', 'fa'];
const REFERENCE_LOCALE = 'en';

function getNestedKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getNestedKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function loadMessages(locale: string): Record<string, unknown> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function main() {
  const reference = loadMessages(REFERENCE_LOCALE);
  const referenceKeys = new Set(getNestedKeys(reference));
  let hasErrors = false;

  console.log(`\n📋 Translation key check (reference: ${REFERENCE_LOCALE})\n`);

  for (const locale of LOCALES) {
    if (locale === REFERENCE_LOCALE) continue;

    const messages = loadMessages(locale);
    const localeKeys = new Set(getNestedKeys(messages));
    const missing = [...referenceKeys].filter((k) => !localeKeys.has(k));
    const extra = [...localeKeys].filter((k) => !referenceKeys.has(k));

    if (missing.length > 0) {
      hasErrors = true;
      console.log(`❌ ${locale.toUpperCase()}: ${missing.length} missing keys`);
      missing.forEach((k) => console.log(`   - ${k}`));
      console.log('');
    } else {
      console.log(`✅ ${locale.toUpperCase()}: All keys present`);
    }

    if (extra.length > 0 && process.env.STRICT) {
      console.log(`⚠️  ${locale.toUpperCase()}: ${extra.length} extra keys (not in reference)`);
      extra.slice(0, 5).forEach((k) => console.log(`   + ${k}`));
      if (extra.length > 5) console.log(`   ... and ${extra.length - 5} more`);
    }
  }

  if (hasErrors) {
    process.exit(1);
  }
  console.log('\n✅ All translation files are consistent.\n');
}

main();
