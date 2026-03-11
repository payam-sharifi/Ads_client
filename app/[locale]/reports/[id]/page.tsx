'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useReport, useUpdateReportStatus } from '@/lib/hooks/useReports';
import { useAdminStore } from '@/lib/stores/adminStore';
import { toast } from 'react-toastify';
import Link from 'next/link';

/**
 * Report Detail Page
 * 
 * API: GET /api/reports/:id (Admin/Super Admin only - requires messages.view permission)
 * API: PATCH /api/reports/:id/status (Admin/Super Admin only - requires messages.view permission)
 */
export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;
  const { data: report, isLoading } = useReport(reportId);
  const { hasPermission } = useAdminStore();
  const updateStatusMutation = useUpdateReportStatus();
  const [status, setStatus] = useState<'pending' | 'reviewed' | 'resolved' | 'dismissed'>('pending');
  const [adminNotes, setAdminNotes] = useState('');

  React.useEffect(() => {
    if (report) {
      setStatus(report.status);
      setAdminNotes(report.adminNotes || '');
    }
  }, [report]);

  const handleUpdateStatus = async () => {
    if (!hasPermission('reports.manage')) {
      toast.error('You do not have permission to manage reports');
      return;
    }

    try {
      // API: PATCH /api/reports/:id/status
      await updateStatusMutation.mutateAsync({
        id: reportId,
        data: {
          status,
          adminNotes: adminNotes || undefined,
        },
      });
      toast.success('Report status updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update report status');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading report...</div>;
  }

  if (!report) {
    return <div className="container mx-auto px-4 py-8 text-center">Report not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 mb-4">
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Report Details</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <span className="text-sm text-gray-500">Type:</span>
          <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
            {report.type}
          </span>
        </div>

        <div>
          <span className="text-sm text-gray-500">Status:</span>
          <span
            className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
              report.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : report.status === 'resolved'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {report.status}
          </span>
        </div>

        <div>
          <span className="text-sm text-gray-500">Reporter:</span>
          <span className="ml-2 font-medium">{report.reporter?.name || 'Unknown'}</span>
          <span className="ml-2 text-sm text-gray-500">({report.reporter?.email})</span>
        </div>

        {report.ad && (
          <div>
            <span className="text-sm text-gray-500">Reported Ad:</span>
            <Link href={`/ad/${report.adId}`} className="ml-2 text-blue-600 hover:text-blue-800">
              {report.ad.title}
            </Link>
          </div>
        )}

        {report.message && (
          <div>
            <span className="text-sm text-gray-500">Reported Message:</span>
            <p className="mt-2 p-3 bg-gray-50 rounded-lg">{report.message.content}</p>
          </div>
        )}

        <div>
          <span className="text-sm text-gray-500">Reason:</span>
          <p className="mt-2 p-3 bg-gray-50 rounded-lg">{report.reason}</p>
        </div>

        {report.adminNotes && (
          <div>
            <span className="text-sm text-gray-500">Admin Notes:</span>
            <p className="mt-2 p-3 bg-blue-50 rounded-lg">{report.adminNotes}</p>
          </div>
        )}

        <div className="text-sm text-gray-500">
          Created: {new Date(report.createdAt).toLocaleString()}
        </div>

        {/* Update Status Form (Admin only) */}
        {hasPermission('reports.manage') && (
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold mb-4">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                onClick={handleUpdateStatus}
                disabled={updateStatusMutation.isPending}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

