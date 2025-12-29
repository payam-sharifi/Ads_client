'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdMessages, useSendMessage } from '@/lib/hooks/useMessages';
import { useAd } from '@/lib/hooks/useAds';
import { useAuthStore } from '@/lib/stores/authStore';
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
  const { data: ad } = useAd(adId);
  const { data: messages, isLoading, refetch } = useAdMessages(adId);
  const sendMessageMutation = useSendMessage();
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      toast.warning('Please enter a message');
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        adId,
        messageText: messageText.trim(),
      });
      setMessageText('');
      toast.success('Message sent');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 mb-3 sm:mb-4 text-sm sm:text-base">
          ← Back
        </button>
        {ad && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{ad.title}</h2>
            <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{ad.description}</p>
            <Link href={`/ad/${adId}`} className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm mt-1 sm:mt-2 inline-block">
              View Ad →
            </Link>
          </div>
        )}
      </div>

      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Messages about this ad</h1>

      {isLoading ? (
        <div className="text-center py-6 sm:py-8 text-sm">Loading messages...</div>
      ) : !messages || messages.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-md">
          <p className="text-sm text-gray-500 mb-3 sm:mb-4">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`bg-white rounded-lg border p-3 sm:p-4 ${
                message.senderId === user.id ? 'ml-auto max-w-[85%] sm:max-w-md' : 'mr-auto max-w-[85%] sm:max-w-md'
              }`}
            >
              <div className="flex justify-between items-start mb-1 sm:mb-2 gap-2">
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                  {message.senderId === user.id ? 'You' : message.sender?.name || 'Unknown'}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              </div>
              {/* #region agent log */}
              {(() => {
                fetch('http://127.0.0.1:7242/ingest/b43a6682-6986-4e79-9b73-4d93dd0f722a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'messages/[adId]/page.tsx:100',message:'displaying message content',data:{messageId:message.id,hasContent:'content' in message,hasMessageText:'messageText' in message,content:message.content,messageText:message.messageText,allKeys:Object.keys(message)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                return null;
              })()}
              {/* #endregion */}
              <p className="text-xs sm:text-sm text-gray-700 break-words">{message.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Send Message Form */}
      <form onSubmit={handleSendMessage} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
          rows={3}
          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-3 sm:mb-4"
        />
        <button
          type="submit"
          disabled={sendMessageMutation.isPending || !messageText.trim()}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}

