'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAdminReports, useUpdateReportStatus } from '@/lib/hooks/admin/useAdminReports';
import { useAdminStore } from '@/lib/stores/adminStore';
import { toast } from 'react-toastify';
import { Report } from '@/lib/hooks/admin/useAdminReports';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

/**
 * Reports & Flags Page
 * 
 * Allows admins to:
 * - View all reports
 * - Update report status
 * - Review reported content
 */
export default function AdminReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = useAdminStore();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'reviewed' | 'resolved' | 'dismissed'>('reviewed');
  const [adminNotes, setAdminNotes] = useState('');

  const type = searchParams?.get('type') || undefined;
  const status = searchParams?.get('status') || undefined;
  const page = parseInt(searchParams?.get('page') || '1', 10);

  const { data: reportsData, isLoading } = useAdminReports({
    type: type as 'ad' | 'message' | undefined,
    status,
    page,
    limit: 10,
  });

  const updateStatusMutation = useUpdateReportStatus();

  const handleUpdateStatus = async () => {
    if (!selectedReport) return;

    if (!hasPermission('reports.manage')) {
      toast.error('You do not have permission to manage reports');
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedReport.id,
        data: {
          status: newStatus,
          adminNotes: adminNotes || undefined,
        },
      });
      toast.success('Report status updated successfully');
      setShowStatusModal(false);
      setAdminNotes('');
      setSelectedReport(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update report status');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const reports = reportsData?.data || [];

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Flags</h1>
          <p className="text-gray-600 mt-2">Review and manage reported content</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <select
            value={type || ''}
            onChange={(e) => router.push(`/admin/reports?type=${e.target.value || ''}`)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Types</option>
            <option value="ad">Ads</option>
            <option value="message">Messages</option>
          </select>
          <select
            value={status || ''}
            onChange={(e) => router.push(`/admin/reports?status=${e.target.value || ''}`)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No reports found</div>
        ) : (
          <div className="overflow-x-hidden w-full">
            <div className="w-full align-middle">
              <table className="w-full max-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Reporter
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Created
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right hidden md:table-cell">
                      <div className="text-xs sm:text-sm text-gray-900">{report.reporter?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{report.reporter?.email}</div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="text-xs sm:text-sm text-gray-900 max-w-xs truncate">{report.reason}</div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm font-medium">
                      <div className="flex items-center justify-end gap-1 sm:gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setNewStatus(report.status as any);
                            setAdminNotes(report.adminNotes || '');
                            setShowStatusModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Review
                        </button>
                        {report.adId && (
                          <a
                            href={`/ad/${report.adId}`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            View Ad
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {reportsData && reportsData.total > 20 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, reportsData.total)} of{' '}
              {reportsData.total} reports
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/admin/reports?page=${page - 1}`)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => router.push(`/admin/reports?page=${page + 1}`)}
                disabled={page >= Math.ceil(reportsData.total / 20)}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedReport && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Update Report Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <div className="text-sm text-gray-900 capitalize">{selectedReport.type}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReport.reason}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes (Optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this report..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setAdminNotes('');
                  setSelectedReport(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updateStatusMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

