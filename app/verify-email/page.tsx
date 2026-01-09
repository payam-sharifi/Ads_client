'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useVerifyEmail, useResendVerificationCode } from '@/lib/hooks/useAuth';
import Button from '@/components/common/Button';
import { toast } from 'react-toastify';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isRTL } = useI18n();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerificationCode();
  const isSubmittingRef = useRef(false);

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

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!email) {
      toast.error('ایمیل یافت نشد. لطفاً دوباره ثبت نام کنید.');
      router.push('/signup');
      return;
    }

    const codeString = code.join('');
    if (codeString.length !== 4) {
      return;
    }

    if (timeLeft <= 0) {
      toast.error('کد منقضی شده است. لطفاً کد جدید درخواست کنید.');
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
      // Clear code on error
      setCode(['', '', '', '']);
      document.getElementById('code-0')?.focus();
    }
  }, [email, code, timeLeft, verifyMutation, t, router]);

  // Reset submitting ref when code is incomplete
  useEffect(() => {
    const codeString = code.join('');
    if (codeString.length < 4) {
      isSubmittingRef.current = false;
    }
  }, [code]);

  // Auto-submit when code is complete
  useEffect(() => {
    const codeString = code.join('');
    if (codeString.length === 4 && timeLeft > 0 && !verifyMutation.isPending && !isSubmittingRef.current) {
      isSubmittingRef.current = true;
      handleSubmit().finally(() => {
        isSubmittingRef.current = false;
      });
    }
  }, [code, timeLeft, verifyMutation.isPending, handleSubmit]);

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

  const handleResendCode = async () => {
    if (!email) {
      toast.error('ایمیل یافت نشد');
      return;
    }

    try {
      await resendMutation.mutateAsync(email);
      toast.success('کد تأیید مجدداً به ایمیل شما ارسال شد');
      setTimeLeft(180); // Reset timer to 3 minutes
      setCode(['', '', '', '']);
      document.getElementById('code-0')?.focus();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'خطا در ارسال مجدد کد';
      toast.error(errorMessage);
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

        <div className="space-y-6">
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
                disabled={verifyMutation.isPending || timeLeft <= 0}
              />
            ))}
          </div>

          {verifyMutation.isPending && (
            <p className="text-center text-gray-500 text-sm">
              در حال بررسی کد...
            </p>
          )}

          {!verifyMutation.isPending && timeLeft > 0 && (
            <p className="text-center text-gray-500 text-sm">
              کد تا {formatTime(timeLeft)} دیگر معتبر است
            </p>
          )}

          {!verifyMutation.isPending && timeLeft <= 0 && (
            <div className="space-y-4">
              <p className="text-center text-red-600 text-sm mb-4">
                کد منقضی شده است
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleResendCode}
                  className="flex-1"
                  disabled={resendMutation.isPending}
                >
                  {resendMutation.isPending ? 'در حال ارسال...' : 'ارسال مجدد کد'}
                </Button>
                <Link href="/signup" className="flex-1">
                  <Button variant="outline" className="w-full">
                    تغییر ایمیل
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
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

