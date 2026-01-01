'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdMessages, useSendMessage, useMarkAllAsReadForAd } from '@/lib/hooks/useMessages';
import { useAd } from '@/lib/hooks/useAds';
import { useAuthStore } from '@/lib/stores/authStore';
import { useI18n } from '@/lib/contexts/I18nContext';
import { toast } from 'react-toastify';

/**
 * Ad Messages Page
 * 
 * API: GET /api/messages/ad/:adId
 * API: POST /api/messages
 * Displays conversation about a specific ad and allows sending messages
 */
export default function AdMessagesPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params?.adId as string;
  const { isAuthenticated, user } = useAuthStore();
  const { locale, isRTL } = useI18n();
  const { data: ad } = useAd(adId);
  const { data: messages, isLoading, refetch } = useAdMessages(adId);
  const sendMessageMutation = useSendMessage();
  const markAllAsReadMutation = useMarkAllAsReadForAd();
  const [messageText, setMessageText] = useState('');
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Mark all messages as read when user views the conversation (only once)
  useEffect(() => {
    if (adId && ad && user && messages && messages.length > 0 && !hasMarkedAsRead) {
      // Check if user is ad owner or has messages in this conversation
      const isAdOwner = ad.userId === user.id;
      const hasParticipated = messages.some(msg => msg.senderId === user.id || msg.receiverId === user.id);
      
      if ((isAdOwner || hasParticipated)) {
        // Check if there are any unread messages for this user
        const hasUnread = messages.some(msg => !msg.isRead && msg.receiverId === user.id);
        
        if (hasUnread && !markAllAsReadMutation.isPending) {
          markAllAsReadMutation.mutate(adId, {
            onSuccess: () => {
              setHasMarkedAsRead(true);
              refetch(); // Refresh messages to get updated isRead status
            },
            onError: (error: any) => {
              // Silently fail - don't show error to user
              console.error('Failed to mark messages as read:', error);
            },
          });
        }
      }
    }
  }, [adId, ad, user, messages, markAllAsReadMutation, hasMarkedAsRead, refetch]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      toast.warning(isRTL ? 'لطفاً پیام خود را وارد کنید' : 'Please enter a message');
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        adId,
        messageText: messageText.trim(),
      });
      setMessageText('');
      toast.success(isRTL ? 'پیام ارسال شد' : 'Message sent');
      refetch();
      // Scroll to bottom after sending message
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (isRTL ? 'خطا در ارسال پیام' : 'Failed to send message'));
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 flex flex-col h-[calc(100vh-2rem)]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-4 sm:mb-6 flex-shrink-0">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 mb-3 sm:mb-4 text-sm sm:text-base">
          {isRTL ? '← بازگشت' : '← Back'}
        </button>
        {ad && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{ad.title}</h2>
            <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{ad.description}</p>
            <Link href={`/ad/${adId}`} className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm mt-1 sm:mt-2 inline-block">
              {isRTL ? '← مشاهده آگهی' : 'View Ad →'}
            </Link>
          </div>
        )}
      </div>

      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 flex-shrink-0">
        {isRTL ? 'پیام‌های مربوط به این آگهی' : 'Messages about this ad'}
      </h1>

      {isLoading ? (
        <div className="text-center py-6 sm:py-8 text-sm">
          {isRTL ? 'در حال بارگذاری پیام‌ها...' : 'Loading messages...'}
        </div>
      ) : !messages || messages.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-md">
          <p className="text-sm text-gray-500 mb-3 sm:mb-4">
            {isRTL ? 'هنوز پیامی وجود ندارد. گفتگو را شروع کنید!' : 'No messages yet. Start the conversation!'}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`bg-white rounded-lg border p-3 sm:p-4 ${
                message.senderId === user.id 
                  ? (isRTL ? 'mr-auto max-w-[85%] sm:max-w-md' : 'ml-auto max-w-[85%] sm:max-w-md')
                  : (isRTL ? 'ml-auto max-w-[85%] sm:max-w-md' : 'mr-auto max-w-[85%] sm:max-w-md')
              }`}
            >
              <div className={`flex justify-between items-start mb-1 sm:mb-2 gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                  {message.senderId === user.id ? (isRTL ? 'شما' : 'You') : message.sender?.name || (isRTL ? 'ناشناس' : 'Unknown')}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(message.createdAt).toLocaleString(locale === 'fa' ? 'fa-IR' : 'de-DE')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 break-words">{message.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Send Message Form */}
      <form onSubmit={handleSendMessage} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 flex-shrink-0">
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={isRTL ? 'پیام خود را بنویسید...' : 'Type your message...'}
          rows={3}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-3 sm:mb-4"
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        <button
          type="submit"
          disabled={sendMessageMutation.isPending || !messageText.trim()}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {sendMessageMutation.isPending 
            ? (isRTL ? 'در حال ارسال...' : 'Sending...') 
            : (isRTL ? 'ارسال پیام' : 'Send Message')}
        </button>
      </form>
    </div>
  );
}

