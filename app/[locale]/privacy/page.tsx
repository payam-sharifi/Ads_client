'use client';

import React from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';

export default function PrivacyPage() {
  const { isRTL,t } = useI18n();

  const faContent = (
    <div className="space-y-6 text-gray-600">
      <p>{t('common.weRespectYourPrivacy')}</p>
      <ul className="list-disc pr-5 space-y-2">
        <li>{t('common.yourPersonalInformationIsNotSharedWithThirdParties')}</li>
        <li>{t('common.yourPersonalInformationIsOnlyUsedForImprovementOfWebsiteServices')}</li>
        <li>{t('common.youCanRequestTheDeletionOfYourAccountAtAnyTime')}</li>
      </ul>
    </div>
  );
  

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        {t('common.privacyPolicy')}
      </h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        { faContent}
      </div>
    </div>
  );
}
