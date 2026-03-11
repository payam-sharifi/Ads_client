"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<string, string> = {
  en: "EN",
  de: "DE",
  fa: "FA",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => handleLocaleChange(loc)}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            locale === loc
              ? "bg-red-600 text-white border border-red-600"
              : "text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-600"
          }`}
        >
          {localeLabels[loc] || loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
