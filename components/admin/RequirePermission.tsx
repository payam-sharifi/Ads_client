'use client';

import { useAdminStore } from '@/lib/stores/adminStore';

interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RequirePermission Component
 * 
 * Conditionally renders children based on user permissions
 * Super Admin always sees content
 */
export default function RequirePermission({
  permission,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const { hasPermission } = useAdminStore();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

