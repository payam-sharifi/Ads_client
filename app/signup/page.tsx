'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useSignup } from '@/lib/hooks/useAuth';
import Button from '@/components/common/Button';
import { toast } from 'react-toastify';

// Country codes list
const countryCodes = [
  { code: '+49', country: 'آلمان', flag: '🇩🇪' },
  { code: '+1', country: 'آمریکا/کانادا', flag: '🇺🇸' },
  { code: '+44', country: 'انگلستان', flag: '🇬🇧' },
  { code: '+33', country: 'فرانسه', flag: '🇫🇷' },
  { code: '+39', country: 'ایتالیا', flag: '🇮🇹' },
  { code: '+34', country: 'اسپانیا', flag: '🇪🇸' },
  { code: '+31', country: 'هلند', flag: '🇳🇱' },
  { code: '+32', country: 'بلژیک', flag: '🇧🇪' },
  { code: '+41', country: 'سوئیس', flag: '🇨🇭' },
  { code: '+43', country: 'اتریش', flag: '🇦🇹' },
  { code: '+45', country: 'دانمارک', flag: '🇩🇰' },
  { code: '+46', country: 'سوئد', flag: '🇸🇪' },
  { code: '+47', country: 'نروژ', flag: '🇳🇴' },
  { code: '+358', country: 'فنلاند', flag: '🇫🇮' },
  { code: '+48', country: 'لهستان', flag: '🇵🇱' },
  { code: '+420', country: 'جمهوری چک', flag: '🇨🇿' },
  { code: '+36', country: 'مجارستان', flag: '🇭🇺' },
  { code: '+40', country: 'رومانی', flag: '🇷🇴' },
  { code: '+7', country: 'روسیه', flag: '🇷🇺' },
  { code: '+90', country: 'ترکیه', flag: '🇹🇷' },
  { code: '+971', country: 'امارات', flag: '🇦🇪' },
  { code: '+966', country: 'عربستان', flag: '🇸🇦' },
  { code: '+98', country: 'ایران', flag: '🇮🇷' },
  { code: '+86', country: 'چین', flag: '🇨🇳' },
  { code: '+81', country: 'ژاپن', flag: '🇯🇵' },
  { code: '+82', country: 'کره جنوبی', flag: '🇰🇷' },
  { code: '+91', country: 'هند', flag: '🇮🇳' },
  { code: '+61', country: 'استرالیا', flag: '🇦🇺' },
  { code: '+27', country: 'آفریقای جنوبی', flag: '🇿🇦' },
  { code: '+55', country: 'برزیل', flag: '🇧🇷' },
  { code: '+52', country: 'مکزیک', flag: '🇲🇽' },
  { code: '+54', country: 'آرژانتین', flag: '🇦🇷' },
];

export default function SignupPage() {
  const router = useRouter();
  const { t, isRTL } = useI18n();
  const [selectedCountryCode, setSelectedCountryCode] = React.useState('+49'); // Germany default
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '+49 ',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const signupMutation = useSignup();
  
  // #region agent log
  const phoneContainerRef = React.useRef<HTMLDivElement>(null);
  const selectRef = React.useRef<HTMLSelectElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    const measureDimensions = () => {
      if (phoneContainerRef.current && selectRef.current && inputRef.current) {
        const container = phoneContainerRef.current;
        const select = selectRef.current;
        const input = inputRef.current;
        const containerWidth = container.offsetWidth;
        const selectWidth = select.offsetWidth;
        const inputWidth = input.offsetWidth;
        const viewportWidth = window.innerWidth;
        const containerScrollWidth = container.scrollWidth;
        const hasOverflow = containerScrollWidth > containerWidth;
        const gap = 8; // gap-2 = 0.5rem = 8px
        const selectScrollWidth = select.scrollWidth;
        const selectClientWidth = select.clientWidth;
        const selectTextOverflow = selectScrollWidth > selectClientWidth;
        const selectComputedStyle = window.getComputedStyle(select);
        const selectMaxWidth = selectComputedStyle.maxWidth;
        const selectMinWidth = selectComputedStyle.minWidth;
        const selectFlexShrink = selectComputedStyle.flexShrink;
        
        fetch('http://127.0.0.1:7251/ingest/16dff4fb-acde-45fe-9026-2a312fc80629',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'signup/page.tsx:measureDimensions',message:'Phone field dimensions',data:{containerWidth,selectWidth,inputWidth,viewportWidth,containerScrollWidth,hasOverflow,gap,totalWidth:selectWidth+inputWidth+gap,selectedCode:selectedCountryCode,selectScrollWidth,selectClientWidth,selectTextOverflow,selectMaxWidth,selectMinWidth,selectFlexShrink},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F,G,H,I'})}).catch(()=>{});
      }
    };
    
    measureDimensions();
    const resizeObserver = new ResizeObserver(measureDimensions);
    if (phoneContainerRef.current) {
      resizeObserver.observe(phoneContainerRef.current);
    }
    if (selectRef.current) {
      resizeObserver.observe(selectRef.current);
    }
    if (inputRef.current) {
      resizeObserver.observe(inputRef.current);
    }
    
    window.addEventListener('resize', measureDimensions);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureDimensions);
    };
  }, [selectedCountryCode]);
  // #endregion

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Phone validation regex - supports international format with country code
  // Format: +[country code] [number] or +[country code][number]
  // Examples: +49 123 456789, +49 123456789, +1 555 1234567
  const phoneRegex = /^\+[1-9]\d{1,3}[\s]?\d{1,14}$/;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'نام الزامی است';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'نام باید حداقل ۲ کاراکتر باشد';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'ایمیل الزامی است';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'فرمت ایمیل نامعتبر است';
    }

    // Phone validation
    const fullPhone = `${selectedCountryCode} ${phoneNumber}`.trim();
    if (!phoneNumber.trim()) {
      newErrors.phone = 'شماره تلفن الزامی است';
    } else if (!phoneRegex.test(fullPhone)) {
      newErrors.phone = 'فرمت شماره تلفن نامعتبر است';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'رمز عبور الزامی است';
    } else if (formData.password.length < 6) {
      newErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تکرار رمز عبور الزامی است';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'رمزهای عبور با هم مطابقت ندارند';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedCountryCode(newCode);
    setFormData({ ...formData, phone: `${newCode} ${phoneNumber}`.trim() });
    
    // Clear error when user changes country code
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only numbers
    setPhoneNumber(value);
    setFormData({ ...formData, phone: `${selectedCountryCode} ${value}`.trim() });
    
    // Clear error when user starts typing
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('لطفاً خطاهای فرم را برطرف کنید');
      return;
    }

    try {
      const fullPhone = `${selectedCountryCode} ${phoneNumber}`.trim();
      await signupMutation.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: fullPhone,
        password: formData.password,
      });
      toast.success('کد تأیید به ایمیل شما ارسال شد');
      // Redirect to verification page with email as query parameter
      router.push(`/verify-email?email=${encodeURIComponent(formData.email.trim())}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('auth.signupError'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">{t('auth.signup')}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.name')}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.email')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                dir="ltr"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('auth.phone')}</label>
            <div ref={phoneContainerRef} className="flex gap-2">
              <input
                ref={inputRef}
                type="tel"
                name="phoneNumber"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="123456789"
                className={`flex-1 min-w-0 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                dir="ltr"
              />
              <select
                ref={selectRef}
                value={selectedCountryCode}
                onChange={handleCountryCodeChange}
                className={`px-2 md:px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-[100px] md:w-auto md:min-w-[140px] flex-shrink-0 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                dir="ltr"
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.code} {country.country}
                  </option>
                ))}
              </select>
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.password')}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                dir="ltr"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.confirmPassword')}</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                dir="ltr"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
              {signupMutation.isPending ? t('common.loading') : t('auth.signup')}
            </Button>
            <div></div>
          </div>

          <div className="text-center mt-4">
            <span className="text-gray-600">{t('auth.hasAccount')} </span>
            <Link href="/login" className="text-red-600 hover:underline font-medium">
              {t('auth.login')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
