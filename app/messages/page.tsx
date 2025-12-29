'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMyInbox, useMarkMessageAsRead } from '@/lib/hooks/useMessages';
import { useAuthStore } from '@/lib/stores/authStore';
import { toast } from 'react-toastify';
import { Message } from '@/lib/hooks/useMessages';

/**
 * Messages Inbox Page
 * 
 * API: GET /api/messages/inbox/my
 * Displays all messages received by the current user
 */
export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { data: messages, isLoading } = useMyInbox();
  const markAsReadMutation = useMarkMessageAsRead();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [senderNameFilter, setSenderNameFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markAsReadMutation.mutateAsync(messageId);
      toast.success('Message marked as read');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to mark message as read');
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  // Filter messages client-side
  const filteredMessages = messages?.filter((message) => {
    if (senderNameFilter && !message.sender?.name?.toLowerCase().includes(senderNameFilter.toLowerCase())) {
      return false;
    }
    if (startDateFilter) {
      const messageDate = new Date(message.createdAt);
      const startDate = new Date(startDateFilter);
      if (messageDate < startDate) return false;
    }
    if (endDateFilter) {
      const messageDate = new Date(message.createdAt);
      const endDate = new Date(endDateFilter);
      endDate.setHours(23, 59, 59, 999); // End of day
      if (messageDate > endDate) return false;
    }
    return true;
  }) || [];

  const handleClearFilters = () => {
    setSenderNameFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 w-full">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">My Messages</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6 w-full">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Sender Name
            </label>
            <input
              type="text"
              value={senderNameFilter}
              onChange={(e) => setSenderNameFilter(e.target.value)}
              placeholder="Search by sender name..."
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
        {(senderNameFilter || startDateFilter || endDateFilter) && (
          <div className="mt-3 sm:mt-4">
            <button
              onClick={handleClearFilters}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs sm:text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-6 sm:py-8 text-sm">Loading messages...</div>
      ) : !messages || messages.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-md">
          <p className="text-sm text-gray-500">No messages yet</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-md">
          <p className="text-sm text-gray-500">No messages match your filters</p>
          <button
            onClick={handleClearFilters}
            className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs sm:text-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4 w-full">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`bg-white rounded-lg border p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow w-full ${
                !message.isRead ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => {
                setSelectedMessage(message);
                if (!message.isRead) {
                  handleMarkAsRead(message.id);
                }
              }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4 w-full">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 break-words">
                      From: {message.sender?.name || 'Unknown'}
                    </span>
                    {!message.isRead && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex-shrink-0">
                        New
                      </span>
                    )}
                  </div>
                  {message.ad && (
                    <Link
                      href={`/ad/${message.adId}`}
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 mb-1 sm:mb-2 block break-words"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Re: {message.ad.title}
                    </Link>
                  )}
                  {/* #region agent log */}
                  {(() => {
                    fetch('http://127.0.0.1:7242/ingest/b43a6682-6986-4e79-9b73-4d93dd0f722a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'messages/page.tsx:89',message:'displaying message content',data:{messageId:message.id,hasContent:'content' in message,content:message.content,allKeys:Object.keys(message)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                    return null;
                  })()}
                  {/* #endregion */}
                  <p className="text-xs sm:text-sm text-gray-700 break-words">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
                {message.ad && (
                  <Link
                    href={`/ad/${message.adId}`}
                    className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs sm:text-sm text-center sm:text-left flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Ad
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">Message Details</h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
              <div>
                <span className="font-semibold">From:</span> {selectedMessage.sender?.name} (
                {selectedMessage.sender?.email})
              </div>
              {selectedMessage.ad && (
                <div>
                  <span className="font-semibold">About Ad:</span>{' '}
                  <Link href={`/ad/${selectedMessage.adId}`} className="text-blue-600 hover:text-blue-800 break-words">
                    {selectedMessage.ad.title}
                  </Link>
                </div>
              )}
              <div>
                <span className="font-semibold">Message:</span>
                <p className="mt-2 p-3 sm:p-4 bg-gray-50 rounded-lg text-sm break-words">{selectedMessage.content}</p>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Sent: {new Date(selectedMessage.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="flex justify-end mt-4 sm:mt-6">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

