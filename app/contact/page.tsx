'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';
import { toast } from 'react-toastify';

export default function ContactPage() {
  const { t, isRTL } = useI18n();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(isRTL ? 'پیام شما با موفقیت ارسال شد' : 'Ihre Nachricht wurde erfolgreich gesendet');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(isRTL ? 'خطا در ارسال پیام' : 'Fehler beim Senden der Nachricht');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        {isRTL ? 'تماس با ما' : 'Kontaktieren Sie uns'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact info */}
        <div className={isRTL ? 'order-2 md:order-1' : ''}>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {isRTL ? 'اطلاعات تماس' : 'Kontaktinformationen'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isRTL 
              ? 'اگر سوالی دارید یا به کمک نیاز دارید، با ما تماس بگیرید.' 
              : 'Wenn Sie Fragen haben oder Hilfe benötigen, kontaktieren Sie uns bitte.'}
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-red-50 p-3 rounded-full text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-800">{isRTL ? 'ایمیل' : 'E-Mail'}</p>
                <p className="text-gray-600">support@appventuregmbh.com</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-red-50 p-3 rounded-full text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-800">{isRTL ? 'آدرس' : 'Adresse'}</p>
                <p className="text-gray-600">AppVenture GmbH, Berlin, Germany</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div className={isRTL ? 'order-1 md:order-2' : ''}>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'نام' : 'Name'}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder={isRTL ? 'نام خود را وارد کنید' : 'Geben Sie Ihren Namen ein'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'ایمیل' : 'E-Mail'}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="example@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'موضوع' : 'Betreff'}
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder={isRTL ? 'موضوع پیام' : 'Betreff der Nachricht'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRTL ? 'پیام' : 'Nachricht'}
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                  placeholder={isRTL ? 'پیام خود را بنویسید' : 'Schreiben Sie Ihre Nachricht'}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {isRTL ? 'در حال ارسال...' : 'Wird gesendet...'}
                  </>
                ) : (
                  isRTL ? 'ارسال پیام' : 'Nachricht senden'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
