'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useLogin } from '@/lib/hooks/useAuth';
import Button from '@/components/common/Button';
import { toast } from 'react-toastify';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(null);
  const turnstileRef = React.useRef<TurnstileInstance | null>(null);
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      toast.error(t('auth.turnstileRequired'));
      return;
    }
    try {
      const response = await loginMutation.mutateAsync({
        email,
        password,
        'cf-turnstile-token': turnstileToken,
      });
      toast.success(t('auth.loginSuccess'));
      setTimeout(() => {
        // Redirect admin/super admin to /admin, regular users to /dashboard
        const roleName = response.user?.role?.name;
        if (roleName === 'ADMIN' || roleName === 'SUPER_ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }, 1000);
    } catch (error: any) {
      const raw = error?.response?.data?.message;
      const message = Array.isArray(raw) ? raw[0] : raw;
      const text = typeof message === 'string' ? message : t('auth.loginError');
      if (typeof message === 'string' && message.toLowerCase().includes('captcha')) {
        setTurnstileToken(null);
        turnstileRef.current?.reset();
      }
      toast.error(text);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md md:max-w-xs md:w-84">
      <div className="bg-white p-8 md:p-5 rounded-lg shadow-md">
        <h1 className="text-3xl md:text-xl font-bold mb-6 md:mb-3 text-center">{t('auth.login')}</h1>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-3">
          <div>
            <label className="block text-sm md:text-xs font-medium mb-2 md:mb-1">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 md:px-3 py-2 md:py-1.5 text-sm md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm md:text-xs font-medium mb-2 md:mb-1">{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 md:px-3 py-2 md:py-1.5 text-sm md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              dir="ltr"
            />
          </div>

          <div className="flex justify-between items-center">
            <Link href="/forgot-password" className="text-primary-600 hover:underline text-sm md:text-xs">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          {TURNSTILE_SITE_KEY ? (
            <div className="flex justify-center" dir="ltr">
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                options={{ size: 'flexible' }}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => {
                  setTurnstileToken(null);
                  toast.error(t('auth.turnstileExpired'));
                }}
                onError={() => {
                  setTurnstileToken(null);
                  toast.error(t('auth.turnstileError'));
                }}
              />
            </div>
          ) : null}

          <Button
            type="submit"
            className="w-full text-sm md:text-sm py-2 md:py-1.5"
            disabled={loginMutation.isPending || !turnstileToken}
          >
            {loginMutation.isPending ? t('common.loading') : t('auth.login')}
          </Button>

          <div className="text-center mt-4 md:mt-3">
            <span className="text-gray-600 text-sm md:text-xs">{t('auth.noAccount')} </span>
            <Link href="/signup" className="text-primary-600 hover:underline font-medium text-sm md:text-xs">
              {t('auth.signup')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
