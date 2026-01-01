'use client';

import React from 'react';
import Link from 'next/link';
import { useUnreadMessagesCountForAd } from '@/lib/hooks/useMessages';
import Button from '@/components/common/Button';
import { useI18n } from '@/lib/contexts/I18nContext';

interface AdMessagesButtonProps {
  adId: string;
}

export default function AdMessagesButton({ adId }: AdMessagesButtonProps) {
  const { isRTL } = useI18n();
  const { data: unreadCount = 0 } = useUnreadMessagesCountForAd(adId);
  const hasUnread = unreadCount > 0;

  return (
    <Link href={`/messages/${adId}`} className="w-full">
      <Button
        variant="outline"
        size="sm"
        className={`w-full text-xs px-2 py-1 flex items-center justify-center gap-1 transition-all ${
          hasUnread
            ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {isRTL ? 'پیام‌ها' : 'Messages'}
        {hasUnread && (
          <span className="ml-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    </Link>
  );
}

