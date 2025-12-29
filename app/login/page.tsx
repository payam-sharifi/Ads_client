'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useLogin } from '@/lib/hooks/useAuth';
import Button from '@/components/common/Button';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginMutation.mutateAsync({ email, password });
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
      toast.error(error?.response?.data?.message || t('auth.loginError'));
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
              className="w-full px-4 md:px-3 py-2 md:py-1.5 text-sm md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
              className="w-full px-4 md:px-3 py-2 md:py-1.5 text-sm md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              dir="ltr"
            />
          </div>

          <div className="flex justify-between items-center">
            <Link href="/forgot-password" className="text-red-600 hover:underline text-sm md:text-xs">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <Button type="submit" className="w-full text-sm md:text-sm py-2 md:py-1.5" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? t('common.loading') : t('auth.login')}
          </Button>

          <div className="text-center mt-4 md:mt-3">
            <span className="text-gray-600 text-sm md:text-xs">{t('auth.noAccount')} </span>
            <Link href="/signup" className="text-red-600 hover:underline font-medium text-sm md:text-xs">
              {t('auth.signup')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
