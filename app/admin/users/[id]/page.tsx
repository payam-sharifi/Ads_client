'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminUser, useUpdateUser } from '@/lib/hooks/admin/useAdminUsers';
import { useUserMessages } from '@/lib/hooks/admin/useAdminMessages';
import { useUserReports } from '@/lib/hooks/admin/useAdminReports';
import { useUserAds } from '@/lib/hooks/useAds';
import { useAdminPermissions, useAssignPermission, useRevokePermission, useAdminUserPermissions } from '@/lib/hooks/admin/useAdminPermissions';
import { useAdminStore } from '@/lib/stores/adminStore';
import { toast } from 'react-toastify';
import Link from 'next/link';

type TabType = 'profile' | 'messages' | 'ads' | 'reports' | 'permissions';

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const { isSuperAdmin } = useAdminStore();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [messagesPage, setMessagesPage] = useState(1);
  const [reportsPage, setReportsPage] = useState(1);

  const { data: user, isLoading: userLoading } = useAdminUser(userId);
  const { data: messagesData, isLoading: messagesLoading } = useUserMessages(userId, { page: messagesPage, limit: 20 });
  const { data: reportsData, isLoading: reportsLoading } = useUserReports(userId, { page: reportsPage, limit: 20 });
  const { data: ads, isLoading: adsLoading } = useUserAds(userId);
  const { data: allPermissions } = useAdminPermissions();
  const { data: userPermissions = [] } = useAdminUserPermissions(user?.role?.name === 'ADMIN' ? userId : '');
  const updateUserMutation = useUpdateUser();
  const assignPermissionMutation = useAssignPermission();
  const revokePermissionMutation = useRevokePermission();

  React.useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      const updateData: any = {};
      if (editForm.name !== user.name) updateData.name = editForm.name;
      if (editForm.email !== user.email) updateData.email = editForm.email;
      if (editForm.phone !== user.phone) updateData.phone = editForm.phone;
      if (editForm.password) updateData.password = editForm.password;

      await updateUserMutation.mutateAsync({
        userId: user.id,
        data: updateData,
      });

      toast.success('User updated successfully');
      setEditing(false);
      setEditForm({ ...editForm, password: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update user');
    }
  };

  const handleTogglePermission = async (permissionId: string, hasPermission: boolean) => {
    if (!user || user.role?.name !== 'ADMIN') return;

    try {
      if (hasPermission) {
        await revokePermissionMutation.mutateAsync({
          adminId: user.id,
          permissionId,
        });
        toast.success('Permission revoked');
      } else {
        await assignPermissionMutation.mutateAsync({
          adminId: user.id,
          permissionId,
        });
        toast.success('Permission assigned');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update permission');
    }
  };

  if (userLoading) {
    return <div className="container mx-auto px-4 py-8">Loading user...</div>;
  }

  if (!user) {
    return <div className="container mx-auto px-4 py-8">User not found</div>;
  }

  if (!isSuperAdmin()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Only Super Admin can view user details</p>
        </div>
      </div>
    );
  }

  const messages = messagesData?.data || [];
  const reports = reportsData?.data || [];
  const adsCount = ads?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/users')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Users
        </button>
        <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['profile', 'messages', 'ads', 'reports', user.role?.name === 'ADMIN' ? 'permissions' : null].filter(Boolean) as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">Profile Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave empty to keep current)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={updateUserMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {updateUserMutation.isPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditForm({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      password: '',
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-gray-900">{user.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="text-gray-900">{user.role?.name?.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="flex gap-2">
                  {user.isBlocked && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Blocked
                    </span>
                  )}
                  {user.isSuspended && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Suspended
                    </span>
                  )}
                  {!user.isBlocked && !user.isSuspended && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Ads</label>
                <p className="text-gray-900">{adsCount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="text-gray-900">{new Date(user.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Messages</h2>
          {messagesLoading ? (
            <div className="text-center py-8">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No messages found</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message) => {
                const truncateMessage = (text: string, maxWords: number = 3) => {
                  const words = text.trim().split(/\s+/);
                  if (words.length <= maxWords) return text;
                  return words.slice(0, maxWords).join(' ') + '...';
                };
                
                const messageUrl = message.adId ? `/messages/${message.adId}` : '#';
                
                return (
                  <Link
                    key={message.id}
                    href={messageUrl}
                    className="block border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                          From: {message.sender?.name || 'Unknown'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {message.sender?.email}
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-gray-900 mt-1 truncate">
                          To: {message.receiver?.name || 'Unknown'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {message.receiver?.email}
                        </p>
                        {message.ad && (
                          <p className="text-xs sm:text-sm text-blue-600 mt-1 truncate">
                            Re: {message.ad.title}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 line-clamp-2">
                      {truncateMessage(message.content, 3)}
                    </p>
                  </Link>
                );
              })}
              {messagesData && messagesData.total > 20 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-6">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMessagesPage((prev) => Math.max(1, prev - 1));
                    }}
                    disabled={messagesPage === 1}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm sm:text-base"
                  >
                    Previous
                  </button>
                  <span className="text-sm sm:text-base">
                    Page {messagesPage} of {Math.ceil(messagesData.total / 20)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMessagesPage((prev) => prev + 1);
                    }}
                    disabled={messagesPage >= Math.ceil(messagesData.total / 20)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm sm:text-base"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ads Tab */}
      {activeTab === 'ads' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Ads ({adsCount})</h2>
          {adsLoading ? (
            <div className="text-center py-8">Loading ads...</div>
          ) : !ads || ads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No ads found</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {ads.map((ad) => (
                <Link
                  key={ad.id}
                  href={`/ad/${ad.id}`}
                  className="block border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-blue-600 hover:text-blue-800 mb-1 line-clamp-2">
                        {ad.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mt-1 line-clamp-2">
                        {ad.description}
                      </p>
                      <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                        <span className="whitespace-nowrap">Price: {ad.price}€</span>
                        <span className="whitespace-nowrap">Status: {ad.status}</span>
                        <span className="whitespace-nowrap">Views: {ad.views}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                      {new Date(ad.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4">Reports</h2>
          {reportsLoading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reports found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">Type: {report.type}</p>
                      <p className="text-sm text-gray-600">Reason: {report.reason}</p>
                      <p className="text-sm text-gray-600">Status: {report.status}</p>
                      {report.ad && (
                        <Link href={`/ad/${report.adId}`} className="text-sm text-blue-600 hover:text-blue-800 block">
                          Ad: {report.ad.title}
                        </Link>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(report.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              {reportsData && reportsData.total > 20 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 mt-6">
                  <button
                    onClick={() => setReportsPage((prev) => Math.max(1, prev - 1))}
                    disabled={reportsPage === 1}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm sm:text-base"
                  >
                    Previous
                  </button>
                  <span className="text-sm sm:text-base">
                    Page {reportsPage} of {Math.ceil(reportsData.total / 20)}
                  </span>
                  <button
                    onClick={() => setReportsPage((prev) => prev + 1)}
                    disabled={reportsPage >= Math.ceil(reportsData.total / 20)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm sm:text-base"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && user.role?.name === 'ADMIN' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4">Permissions</h2>
          {!allPermissions ? (
            <div className="text-center py-8">Loading permissions...</div>
          ) : (
            <div className="space-y-2">
              {allPermissions.map((permission) => {
                const hasPermission = userPermissions.some((p) => p.id === permission.id);
                return (
                  <div key={permission.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{permission.name}</p>
                      {permission.description && (
                        <p className="text-sm text-gray-600">{permission.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleTogglePermission(permission.id, hasPermission)}
                      disabled={assignPermissionMutation.isPending || revokePermissionMutation.isPending}
                      className={`px-4 py-2 rounded-lg ${
                        hasPermission
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } disabled:opacity-50`}
                    >
                      {hasPermission ? 'Revoke' : 'Assign'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

