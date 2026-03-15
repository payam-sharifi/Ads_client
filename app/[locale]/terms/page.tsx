'use client';

import React from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';

export default function TermsPage() {
  const { isRTL ,t} = useI18n();

  const faContent = (
    <div className="space-y-6 text-gray-600">
      <p>{t('common.byUsingThisWebsiteYouAgreeToTheFollowingTermsAndConditions')}</p>
      <ul className="list-disc pr-5 space-y-2">
        <li>{t('common.responsibilityForTheAccuracyOfTheAdvertisementIsWithTheAdvertiser')}</li>
        <li>{t('common.publicationOfIllegalOrOffensiveAdvertisementsIsProhibited')}</li>
        <li>{t('common.weReserveTheRightToDeleteAnyAdvertisementWithoutPriorNotice')}</li>
      </ul>
    </div>
  );


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        {t('common.termsOfUse')}
      </h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        { faContent }
      </div>
    </div>
  );
}
