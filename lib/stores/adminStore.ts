import { create } from 'zustand';
import { Permission } from '../hooks/admin/useAdminPermissions';

/**
 * Admin Store
 * 
 * Manages admin-specific state:
 * - User permissions
 * - UI state (modals, filters)
 * - Permission checks
 */
interface AdminState {
  permissions: Permission[];
  setPermissions: (permissions: Permission[]) => void;
  hasPermission: (permissionName: string) => boolean;
  hasAnyPermission: (permissionNames: string[]) => boolean;
  isSuperAdmin: () => boolean;
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  // Filters
  adsFilter: {
    status?: string;
    categoryId?: string;
    cityId?: string;
    userId?: string;
    search?: string;
  };
  setAdsFilter: (filter: Partial<AdminState['adsFilter']>) => void;
  usersFilter: {
    roleId?: string;
    isBlocked?: boolean;
    isSuspended?: boolean;
    search?: string;
  };
  setUsersFilter: (filter: Partial<AdminState['usersFilter']>) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  permissions: [],
  setPermissions: (permissions) => set({ permissions }),
  hasPermission: (permissionName: string) => {
    const state = get();
    // Super Admin has all permissions
    if (state.isSuperAdmin()) {
      return true;
    }
    return state.permissions.some((p) => p.name === permissionName);
  },
  hasAnyPermission: (permissionNames: string[]) => {
    const state = get();
    if (state.isSuperAdmin()) {
      return true;
    }
    return permissionNames.some((name) => state.hasPermission(name));
  },
  isSuperAdmin: () => {
    if (typeof window === 'undefined') return false;
    try {
      // Dynamically import to avoid circular dependency
      const { useAuthStore } = require('./authStore');
      const authState = useAuthStore.getState();
      return authState.user?.role?.name === 'SUPER_ADMIN';
    } catch {
      return false;
    }
  },
  // UI State
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  // Filters
  adsFilter: {},
  setAdsFilter: (filter) =>
    set((state) => ({
      adsFilter: { ...state.adsFilter, ...filter },
    })),
  usersFilter: {},
  setUsersFilter: (filter) =>
    set((state) => ({
      usersFilter: { ...state.usersFilter, ...filter },
    })),
}));

