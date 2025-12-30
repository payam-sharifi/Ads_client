'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUsers, useAdminUser } from '@/lib/hooks/admin/useAdminUsers';
import { useAdminPermissions, useAssignPermission, useRevokePermission } from '@/lib/hooks/admin/useAdminPermissions';
import { useAdminUserPermissions } from '@/lib/hooks/admin/useAdminUserPermissions';
import { useAdminStore } from '@/lib/stores/adminStore';
import { useCreateAdmin } from '@/lib/hooks/admin/useAdminUsers';
import { useLogout } from '@/lib/hooks/useAuth';
import { toast } from 'react-toastify';
import { AdminUser } from '@/lib/hooks/admin/useAdminUsers';
import { Permission } from '@/lib/hooks/admin/useAdminPermissions';
import RequireSuperAdmin from '@/components/admin/RequireSuperAdmin';
import { useI18n } from '@/lib/contexts/I18nContext';

/**
 * Admins & Permissions Page
 * 
 * Super Admin only page for:
 * - Creating admin users
 * - Assigning/revoking permissions
 * - Managing admin accounts
 */
export default function AdminAdminsPage() {
  const router = useRouter();
  const { isSuperAdmin, hasPermission } = useAdminStore();
  const { t, isRTL, locale } = useI18n();
  const logoutMutation = useLogout();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const { data: usersData } = useAdminUsers({ page: 1, limit: 100 });
  const { data: allPermissions } = useAdminPermissions();
  const createAdminMutation = useCreateAdmin();
  const assignPermissionMutation = useAssignPermission();
  const revokePermissionMutation = useRevokePermission();

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  // Filter to show only ADMIN users
  const adminUsers = usersData?.data.filter((u) => u.role.name === 'ADMIN' || u.role.name === 'SUPER_ADMIN') || [];

  const handleCreateAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.warning('Please fill in all required fields');
      return;
    }

    try {
      await createAdminMutation.mutateAsync(newAdmin);
      toast.success('Admin user created successfully');
      setShowCreateModal(false);
      setNewAdmin({ name: '', email: '', phone: '', password: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleTogglePermission = async (adminId: string, permissionId: string, hasPerm: boolean) => {
    try {
      if (hasPerm) {
        // Revoke permission (remove it)
        await revokePermissionMutation.mutateAsync({ adminId, permissionId });
        toast.success(isRTL ? 'دسترسی حذف شد' : 'Permission revoked');
      } else {
        // Assign permission (add it)
        await assignPermissionMutation.mutateAsync({ adminId, permissionId });
        toast.success(isRTL ? 'دسترسی اضافه شد' : 'Permission assigned');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (isRTL ? 'خطا در به‌روزرسانی دسترسی' : 'Failed to update permission'));
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/login');
    } catch (error) {
      toast.error(locale === 'fa' ? 'خروج ناموفق بود' : 'Failed to logout');
    }
  };

  return (
    <RequireSuperAdmin
      fallback={
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Access denied. Super Admin privileges required.</p>
        </div>
      }
    >
      <div>
      {/* Mobile Header with Back and Logout buttons */}
      <div className="md:hidden flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>{isRTL ? 'بازگشت' : 'Back'}</span>
        </button>
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>{isRTL ? 'خروج' : 'Logout'}</span>
        </button>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admins & Permissions</h1>
          <p className="text-gray-600 mt-2">Manage admin users and their permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          + Create Admin
        </button>
      </div>

      {/* Admins List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            {adminUsers.map((admin) => (
              <div
                key={admin.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{admin.name}</div>
                  <div className="text-sm text-gray-500">{admin.email}</div>
                  <span
                    className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                      admin.role.name === 'SUPER_ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {admin.role.name.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex gap-2">
                  {admin.role.name === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setShowPermissionsModal(true);
                      }}
                      className="w-full md:w-auto px-3 md:px-4 py-2 text-xs md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('admin.managePermissions')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Admin User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewAdmin({ name: '', email: '', phone: '', password: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={createAdminMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {createAdminMutation.isPending ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedAdmin && allPermissions && (
        <PermissionsModal
          admin={selectedAdmin}
          allPermissions={allPermissions}
          onClose={() => {
            setShowPermissionsModal(false);
            setSelectedAdmin(null);
          }}
          onTogglePermission={handleTogglePermission}
        />
      )}
    </div>
    </RequireSuperAdmin>
  );
}

/**
 * Permissions Modal Component
 */
function PermissionsModal({
  admin,
  allPermissions,
  onClose,
  onTogglePermission,
}: {
  admin: AdminUser;
  allPermissions: Permission[];
  onClose: () => void;
  onTogglePermission: (adminId: string, permissionId: string, hasPerm: boolean) => void;
}) {
  const { data: adminPermissions, isLoading } = useAdminUserPermissions(admin.id);
  const adminPermissionIds = adminPermissions?.map((p) => p.id) || [];
  const { t, isRTL, locale } = useI18n();

  // Helper function to translate resource names
  const translateResource = (resource: string): string => {
    const resourceTranslations: Record<string, { fa: string; de: string }> = {
      ads: { fa: 'آگهی‌ها', de: 'Anzeigen' },
      users: { fa: 'کاربران', de: 'Benutzer' },
      messages: { fa: 'پیام‌ها', de: 'Nachrichten' },
      categories: { fa: 'دسته‌بندی‌ها', de: 'Kategorien' },
      admins: { fa: 'مدیران', de: 'Administratoren' },
      reports: { fa: 'گزارش‌ها', de: 'Berichte' },
    };
    const translation = resourceTranslations[resource];
    if (translation) {
      return translation[locale as 'fa' | 'de'] || resource;
    }
    return resource;
  };

  // Helper function to translate action names
  const translateAction = (action: string): string => {
    const actionTranslations: Record<string, { fa: string; de: string }> = {
      approve: { fa: 'تایید', de: 'Genehmigen' },
      reject: { fa: 'رد', de: 'Ablehnen' },
      edit: { fa: 'ویرایش', de: 'Bearbeiten' },
      delete: { fa: 'حذف', de: 'Löschen' },
      manage: { fa: 'مدیریت', de: 'Verwalten' },
      view: { fa: 'مشاهده', de: 'Anzeigen' },
      block: { fa: 'مسدود کردن', de: 'Sperren' },
      suspend: { fa: 'معلق کردن', de: 'Aussetzen' },
    };
    const translation = actionTranslations[action];
    if (translation) {
      return translation[locale as 'fa' | 'de'] || action;
    }
    return action;
  };

  // Helper function to translate permission names
  const translatePermission = (permissionName: string): string => {
    const translationKey = `permissions.${permissionName}`;
    const translated = t(translationKey);
    // If translation exists, return it; otherwise translate resource and action separately
    if (translated !== translationKey) {
      return translated;
    }
    const [resource, action] = permissionName.split('.');
    if (resource && action) {
      return `${translateResource(resource)} - ${translateAction(action)}`;
    }
    return permissionName.replace(/\./g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Group permissions by resource
  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    const resource = permission.resource || 'other';
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl p-4 max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {t('admin.managePermissions')}
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">{admin.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Permissions List */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              {isRTL ? 'در حال بارگذاری...' : 'Loading...'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                <div key={resource} className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 pb-1 border-b border-gray-300">
                    {translateResource(resource)}
                  </h3>
                  <div className="space-y-1">
                    {permissions.map((permission) => {
                      const hasPerm = adminPermissionIds.includes(permission.id);

                      return (
                        <label
                          key={permission.id}
                          className={`
                            flex items-center gap-2 p-1.5 border rounded cursor-pointer transition-all
                            ${hasPerm 
                              ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                            }
                          `}
                        >
                          {/* Checkbox */}
                          <div className="relative flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={hasPerm}
                              onChange={() => onTogglePermission(admin.id, permission.id, hasPerm)}
                              className={`
                                w-4 h-4 rounded border-2 cursor-pointer appearance-none
                                ${hasPerm 
                                  ? 'border-green-600 bg-green-600' 
                                  : 'border-gray-300 bg-white'
                                }
                                focus:ring-2 focus:ring-green-500 focus:ring-offset-1
                                checked:bg-green-600 checked:border-green-600
                              `}
                            />
                            {hasPerm && (
                              <svg 
                                className="absolute top-0.5 left-0.5 w-3 h-3 text-white pointer-events-none" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          
                          {/* Permission Info */}
                          <div className="flex-1 min-w-0">
                            <div className={`
                              font-medium text-xs break-words
                              ${hasPerm ? 'text-green-900' : 'text-gray-900'}
                            `}>
                              {translatePermission(permission.name)}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

