'use client';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'ad' | 'report' | 'user';
}

/**
 * StatusBadge Component
 * 
 * Displays status badges with appropriate colors
 */
export default function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const getBadgeClass = () => {
    if (variant === 'ad') {
      const adStatuses: Record<string, string> = {
        DRAFT: 'bg-gray-100 text-gray-800',
        PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        EXPIRED: 'bg-gray-100 text-gray-800',
      };
      return adStatuses[status] || adStatuses.DRAFT;
    }

    if (variant === 'report') {
      const reportStatuses: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        reviewed: 'bg-blue-100 text-blue-800',
        resolved: 'bg-green-100 text-green-800',
        dismissed: 'bg-gray-100 text-gray-800',
      };
      return reportStatuses[status] || reportStatuses.pending;
    }

    if (variant === 'user') {
      if (status === 'blocked') return 'bg-red-100 text-red-800';
      if (status === 'suspended') return 'bg-yellow-100 text-yellow-800';
      return 'bg-green-100 text-green-800';
    }

    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeClass()}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

