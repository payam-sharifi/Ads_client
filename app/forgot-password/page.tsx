'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/contexts/I18nContext';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

export default function ForgotPasswordPage() {
  const { t, isRTL } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    // TODO: Replace with real API call
    setTimeout(() => {
      setAlert({
        type: 'success',
        message: isRTL
          ? 'لینک بازیابی رمز عبور به ایمیل شما ارسال شد'
          : 'Passwort-Zurücksetzungslink wurde an Ihre E-Mail gesendet',
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">{t('auth.resetPassword')}</h1>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="ltr"
            />
            <p className="text-sm text-gray-600 mt-2">
              {isRTL
                ? 'لینک بازیابی رمز عبور به این ایمیل ارسال خواهد شد'
                : 'Der Passwort-Zurücksetzungslink wird an diese E-Mail gesendet'}
            </p>
          </div>

          <Button type="submit" className="w-full" isLoading={loading}>
            {t('common.submit')}
          </Button>

          <div className="text-center mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">
              {t('common.back')} {t('auth.login')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

