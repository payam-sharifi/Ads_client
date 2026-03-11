'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useConversations } from '@/lib/hooks/useMessages';
import { useAuthStore } from '@/lib/stores/authStore';
import { useI18n } from '@/lib/contexts/I18nContext';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

type SortOption = 'newest' | 'oldest' | 'unread';

/**
 * Messages Inbox Page
 * 
 * API: GET /api/messages/conversations
 * Displays all conversations grouped by ad and user
 */
export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { locale, isRTL } = useI18n();
  const { data: conversations, isLoading } = useConversations();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Sort conversations
  const sortedConversations = React.useMemo(() => {
    if (!conversations) return [];
    
    const sorted = [...conversations];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
        );
      case 'oldest':
        return sorted.sort((a, b) => 
          new Date(a.lastMessage.createdAt).getTime() - new Date(b.lastMessage.createdAt).getTime()
        );
      case 'unread':
        return sorted.sort((a, b) => {
          if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
        });
      default:
        return sorted;
    }
  }, [conversations, sortBy]);

  const getSortLabel = () => {
    if (isRTL) {
      switch (sortBy) {
        case 'newest': return 'جدیدترین';
        case 'oldest': return 'قدیمی‌ترین';
        case 'unread': return 'خوانده نشده';
        default: return 'مرتب‌سازی';
      }
    } else {
      switch (sortBy) {
        case 'newest': return 'Newest';
        case 'oldest': return 'Oldest';
        case 'unread': return 'Unread';
        default: return 'Sort';
      }
    }
  };

  const handleConversationClick = (adId: string, otherUserId: string) => {
    router.push(`/messages/${adId}?userId=${otherUserId}`);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          {isRTL ? 'چت و تماس' : 'Chat & Contact'}
        </h1>
        
        {/* Sort Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>{getSortLabel()}</span>
            <svg className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showSortMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowSortMenu(false)}
              />
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20`}>
                <button
                  onClick={() => {
                    setSortBy('newest');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'newest' ? 'bg-red-50 text-red-600' : ''} ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {isRTL ? 'جدیدترین' : 'Newest'}
                </button>
                <button
                  onClick={() => {
                    setSortBy('oldest');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'oldest' ? 'bg-red-50 text-red-600' : ''} ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {isRTL ? 'قدیمی‌ترین' : 'Oldest'}
                </button>
                <button
                  onClick={() => {
                    setSortBy('unread');
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'unread' ? 'bg-red-50 text-red-600' : ''} ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {isRTL ? 'خوانده نشده' : 'Unread'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-6 sm:py-8 text-sm">
          {isRTL ? 'در حال بارگذاری...' : 'Loading...'}
        </div>
      ) : !conversations || conversations.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-md">
          <p className="text-sm text-gray-500">
            {isRTL ? 'هنوز پیامی وجود ندارد.' : 'No messages yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {sortedConversations.map((conversation) => (
            <div
              key={`${conversation.adId}_${conversation.otherUser.id}`}
              onClick={() => handleConversationClick(conversation.adId, conversation.otherUser.id)}
              className={`bg-white rounded-lg border p-3 sm:p-4 cursor-pointer hover:shadow-md transition-all ${
                conversation.unreadCount > 0 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex gap-3 sm:gap-4">
                {/* Ad Image */}
                <div className="flex-shrink-0">
                  {conversation.ad.images && conversation.ad.images.length > 0 ? (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden">
                      <Image
                        src={conversation.ad.images[0].url}
                        alt={conversation.ad.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 sm:mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                        {conversation.ad.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {conversation.otherUser.name}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="flex-shrink-0 ml-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center min-w-[20px] sm:min-w-[24px]">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-xs sm:text-sm truncate mb-1 ${
                    conversation.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                  }`}>
                    {conversation.lastMessage.content}
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    {new Date(conversation.lastMessage.createdAt).toLocaleString(locale === 'fa' ? 'fa-IR' : 'de-DE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
