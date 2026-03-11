'use client';

import React from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';

export default function HelpPage() {
  const { isRTL } = useI18n();

  const faContent = (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">چگونه آگهی ثبت کنیم؟</h2>
        <p className="text-gray-600">برای ثبت آگهی، کافی است روی دکمه "ایجاد آگهی" در بالای صفحه کلیک کنید و اطلاعات مربوطه را وارد نمایید.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">آیا استفاده از سایت رایگان است؟</h2>
        <p className="text-gray-600">بله، ثبت آگهی‌های معمولی در سایت کاملاً رایگان است.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">چگونه با فروشنده تماس بگیریم؟</h2>
        <p className="text-gray-600">در صفحه هر آگهی، راه‌های تماس با فروشنده (تلفن یا چت داخلی) نمایش داده شده است.</p>
      </section>
    </div>
  );

  const deContent = (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Wie erstelle ich eine Anzeige?</h2>
        <p className="text-gray-600">Klicken Sie einfach auf die Schaltfläche "Anzeige erstellen" oben auf der Seite und geben Sie die entsprechenden Informationen ein.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Ist die Nutzung der Website kostenlos?</h2>
        <p className="text-gray-600">Ja, das Aufgeben normaler Anzeigen auf der Website ist völlig kostenlos.</p>
      </section>
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-3">Wie kontaktiere ich den Verkäufer?</h2>
        <p className="text-gray-600">Auf jeder Anzeigenseite werden die Kontaktmöglichkeiten des Verkäufers (Telefon oder interner Chat) angezeigt.</p>
      </section>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        {isRTL ? 'راهنما' : 'Hilfe'}
      </h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {isRTL ? faContent : deContent}
      </div>
    </div>
  );
}
