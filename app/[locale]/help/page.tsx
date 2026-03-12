"use client";

import { useI18n } from "@/lib/contexts/I18nContext";

export default function HelpPage() {
  const { isRTL, t } = useI18n();

  const helpContent = (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          {t('help.howToCreateAnAd')}
        </h2>
          <p className="text-gray-600">
            {t('help.howToCreateAnAdDescription')}
          </p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          {t('help.isTheSiteFree')}
        </h2>
        <p className="text-gray-600">
          {t('help.isTheSiteFreeDescription')}
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">
          {t('help.howToContactTheSeller')}
        </h2>
        <p className="text-gray-600">
          {t('help.howToContactTheSellerDescription')}
        </p>
      </section>
    </div>
  );

 

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-4xl"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        {t("common.help")}
      </h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {helpContent}
      </div>
    </div>
  );
}
