'use client';

import React, { useState } from 'react';
import { useAdminUsers, useAdminUser } from '@/lib/hooks/admin/useAdminUsers';
import { useAdminPermissions, useAssignPermission, useRevokePermission } from '@/lib/hooks/admin/useAdminPermissions';
import { useAdminUserPermissions } from '@/lib/hooks/admin/useAdminUserPermissions';
import { useAdminStore } from '@/lib/stores/adminStore';
import { useCreateAdmin } from '@/lib/hooks/admin/useAdminUsers';
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
  const { isSuperAdmin, hasPermission } = useAdminStore();
  const { t } = useI18n();
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
        await revokePermissionMutation.mutateAsync({ adminId, permissionId });
        toast.success('Permission revoked');
      } else {
        await assignPermissionMutation.mutateAsync({ adminId, permissionId });
        toast.success('Permission assigned');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update permission');
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
  const { data: adminPermissions } = useAdminUserPermissions(admin.id);
  const adminPermissionIds = adminPermissions?.map((p) => p.id) || [];
  const { t } = useI18n();

  // Helper function to translate permission names
  const translatePermission = (permissionName: string): string => {
    const translationKey = `permissions.${permissionName}`;
    const translated = t(translationKey);
    // If translation exists, return it; otherwise return formatted permission name
    return translated !== translationKey ? translated : permissionName.replace(/\./g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
          {t('admin.managePermissions')}: {admin.name}
        </h2>
        <div className="space-y-3">
          {allPermissions.map((permission) => {
            const hasPerm = adminPermissionIds.includes(permission.id);

            return (
              <label
                key={permission.id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={hasPerm}
                  onChange={() => onTogglePermission(admin.id, permission.id, hasPerm)}
                  className="w-4 h-4 mt-0.5 text-red-600 border-gray-300 rounded focus:ring-red-500 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm md:text-base break-words">
                    {translatePermission(permission.name)}
                  </div>
                  {permission.description && (
                    <div className="text-xs md:text-sm text-gray-500 mt-1 break-words">
                      {permission.description}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm md:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

