'use client';

import React from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';

export default function PrivacyPage() {
  const { isRTL } = useI18n();

  const faContent = (
    <div className="space-y-6 text-gray-600">
      <p>ما به حریم خصوصی شما احترام می‌گذاریم:</p>
      <ul className="list-disc pr-5 space-y-2">
        <li>اطلاعات شخصی شما با اشخاص ثالث به اشتراک گذاشته نمی‌شود.</li>
        <li>از اطلاعات شما فقط برای بهبود خدمات سایت استفاده می‌شود.</li>
        <li>شما می‌توانید در هر زمان درخواست حذف حساب کاربری خود را بدهید.</li>
      </ul>
    </div>
  );

  const deContent = (
    <div className="space-y-6 text-gray-600">
      <p>Wir respektieren Ihre Privatsphäre:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Ihre persönlichen Daten werden nicht an Dritte weitergegeben.</li>
        <li>Ihre Informationen werden nur zur Verbesserung der Website-Dienste verwendet.</li>
        <li>Sie können jederzeit die Löschung Ihres Kontos beantragen.</li>
      </ul>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        {isRTL ? 'حریم خصوصی' : 'Datenschutz'}
      </h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {isRTL ? faContent : deContent}
      </div>
    </div>
  );
}
