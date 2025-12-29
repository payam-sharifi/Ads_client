'use client';

import { useAdminStore } from '@/lib/stores/adminStore';

interface RequireSuperAdminProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RequireSuperAdmin Component
 * 
 * Conditionally renders children only for Super Admin
 */
export default function RequireSuperAdmin({
  children,
  fallback = null,
}: RequireSuperAdminProps) {
  const { isSuperAdmin } = useAdminStore();

  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

