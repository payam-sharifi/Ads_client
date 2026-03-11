"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useEffect, useRef, useState } from "react";

const localeLabels: Record<string, string> = {
  en: "English",
  de: "German",
  fa: "فارسی",
};

const localeFlags: Record<string, string> = {
  en: "🇬🇧",
  de: "🇩🇪",
  fa: "🇮🇷",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-0.5 p-1 rounded border border-gray-300 hover:border-primary-500 transition-colors"
        aria-label="Language"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
      >
        <span className="text-sm leading-none" aria-hidden>
          {localeFlags[locale] || "🌐"}
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full end-0 mt-1 min-w-[9rem] bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => handleLocaleChange(loc)}
              className={`flex items-center gap-2 w-full text-start px-3 py-2 text-sm transition-colors ${
                locale === loc
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-base leading-none">
                {localeFlags[loc] || "🌐"}
              </span>
              {localeLabels[loc] || loc.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
