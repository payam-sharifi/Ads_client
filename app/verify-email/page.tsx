'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useVerifyEmail } from '@/lib/hooks/useAuth';
import Button from '@/components/common/Button';
import { toast } from 'react-toastify';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isRTL } = useI18n();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const verifyMutation = useVerifyEmail();

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      document.getElementById('code-3')?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('ایمیل یافت نشد. لطفاً دوباره ثبت نام کنید.');
      router.push('/signup');
      return;
    }

    const codeString = code.join('');
    if (codeString.length !== 4) {
      toast.error('لطفاً کد ۴ رقمی را کامل وارد کنید');
      return;
    }

    try {
      await verifyMutation.mutateAsync({
        email,
        code: codeString,
      });
      toast.success(t('auth.verificationSuccess') || 'ثبت نام با موفقیت انجام شد');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || t('auth.verificationError') || 'کد تأیید نامعتبر است';
      toast.error(errorMessage);
      if (errorMessage.includes('منقضی') || errorMessage.includes('expired')) {
        setTimeout(() => {
          router.push('/signup');
        }, 2000);
      }
    }
  };

  if (!email) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-red-600 mb-4">ایمیل یافت نشد</p>
          <Link href="/signup">
            <Button>بازگشت به ثبت نام</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">{t('auth.verifyEmail') || 'تأیید ایمیل'}</h1>
        
        <p className="text-gray-600 mb-2 text-center" dir="ltr">
          {email}
        </p>
        <p className="text-gray-600 mb-6 text-center">
          کد تأیید ۴ رقمی که به ایمیل شما ارسال شده را وارد کنید
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3" dir="ltr">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {timeLeft > 0 ? (
            <p className="text-center text-gray-500 text-sm">
              کد تا {formatTime(timeLeft)} دیگر معتبر است
            </p>
          ) : (
            <p className="text-center text-red-600 text-sm">
              کد منقضی شده است. لطفاً دوباره ثبت نام کنید.
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={verifyMutation.isPending || code.join('').length !== 4 || timeLeft <= 0}
          >
            {verifyMutation.isPending ? t('common.loading') || 'در حال بررسی...' : t('auth.verify') || 'تأیید'}
          </Button>

          <div className="text-center">
            <Link href="/signup" className="text-red-600 hover:underline text-sm">
              تغییر ایمیل
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

