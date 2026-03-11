'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminMessage } from '@/lib/hooks/admin/useAdminMessages';
import { useAdminStore } from '@/lib/stores/adminStore';
import Link from 'next/link';

/**
 * Message Detail Page
 * 
 * Displays full details of a message including:
 * - Sender and receiver information
 * - Message content
 * - Related ad information
 * - Timestamp
 * - Read status
 */
export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const messageId = params?.id as string;
  const { data: message, isLoading, error } = useAdminMessage(messageId);
  const { hasPermission } = useAdminStore();

  if (!hasPermission('messages.view')) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">You do not have permission to view messages</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Loading message...</p>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600">Message not found or failed to load</p>
        <button
          onClick={() => router.push('/admin/messages')}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Back to Messages
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Message Details</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Message Header */}
        <div className="border-b border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  message.isRead
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {message.isRead ? 'Read' : 'Unread'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(message.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* From */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">From</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-base font-semibold text-gray-900">
                {message.sender?.name || 'Unknown'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {message.sender?.email || 'N/A'}
              </div>
            </div>
          </div>

          {/* To */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">To</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-base font-semibold text-gray-900">
                {message.receiver?.name || 'Unknown'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {message.receiver?.email || 'N/A'}
              </div>
            </div>
          </div>

          {/* Ad */}
          {message.ad && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Related Ad</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <Link
                  href={`/ad/${message.adId}`}
                  className="text-base font-semibold text-blue-600 hover:text-blue-800"
                >
                  {message.ad.title}
                </Link>
              </div>
            </div>
          )}

          {/* Message Content */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Message</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-base text-gray-900 whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Sent At</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-900">
                {new Date(message.createdAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

