'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useAdminStore } from '@/lib/stores/adminStore';
import { useCurrentAdminPermissions } from '@/lib/hooks/admin/useCurrentAdminPermissions';

/**
 * Admin Route Guard
 * 
 * Protects admin routes and ensures:
 * - User is authenticated
 * - User has ADMIN or SUPER_ADMIN role
 * - Permissions are loaded for admin users
 */
export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { setPermissions } = useAdminStore();
  const { data: permissions } = useCurrentAdminPermissions();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    const roleName = user.role?.name;
    if (roleName !== 'ADMIN' && roleName !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }

    // Load permissions for admin users
    if (roleName === 'ADMIN' && permissions) {
      setPermissions(permissions);
    }
    // Super Admin doesn't need permissions loaded - they have all
  }, [isAuthenticated, user, router, permissions, setPermissions]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const roleName = user.role?.name;
  if (roleName !== 'ADMIN' && roleName !== 'SUPER_ADMIN') {
    return null;
  }

  return <>{children}</>;
}

