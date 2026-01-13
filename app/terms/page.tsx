'use client';

import React from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';

export default function TermsPage() {
  const { isRTL } = useI18n();

  const faContent = (
    <div className="space-y-6 text-gray-600">
      <p>با استفاده از این سایت، شما با شرایط و ضوابط زیر موافقت می‌کنید:</p>
      <ul className="list-disc pr-5 space-y-2">
        <li>مسئولیت صحت اطلاعات آگهی با ثبت‌کننده آن است.</li>
        <li>انتشار آگهی‌های غیرقانونی یا خلاف عفت عمومی ممنوع است.</li>
        <li>ما حق حذف هر آگهی را بدون اطلاع قبلی برای خود محفوظ می‌داریم.</li>
      </ul>
    </div>
  );

  const deContent = (
    <div className="space-y-6 text-gray-600">
      <p>Mit der Nutzung dieser Website erklären Sie sich mit den folgenden Bedingungen einverstanden:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Der Inserent ist für die Richtigkeit der Anzeige verantwortlich.</li>
        <li>Die Veröffentlichung illegaler oder anstößiger Anzeigen ist untersagt.</li>
        <li>Wir behalten uns das Recht vor, Anzeigen ohne vorherige Ankündigung zu löschen.</li>
      </ul>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        {isRTL ? 'شرایط استفاده' : 'Nutzungsbedingungen'}
      </h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {isRTL ? faContent : deContent}
      </div>
    </div>
  );
}
