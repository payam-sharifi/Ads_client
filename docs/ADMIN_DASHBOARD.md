# Admin & Super Admin Dashboard

A comprehensive admin dashboard for managing the classified ads platform with role-based and permission-based access control.

## Features

### 🔐 Access Control
- **Role-Based Access**: Only ADMIN and SUPER_ADMIN can access
- **Permission-Based UI**: UI elements shown/hidden based on permissions
- **Super Admin Override**: Super Admin sees everything regardless of permissions

### 📊 Dashboard Overview
- Real-time statistics cards
- Quick action links
- Pending items alerts

### 📢 Ads Management
- View all ads with advanced filters (status, category, city, user)
- Approve/reject ads with reason
- Edit ad content
- Permission checks: `ads.approve`, `ads.reject`, `ads.edit`

### 👥 Users Management
- List all users with filters
- Block/unblock users
- Suspend users with date
- View user details
- Permission checks: `users.view`, `users.block`, `users.suspend`

### 💬 Messages Monitoring
- View conversations between users
- Search by user or ad
- Read-only access
- Permission check: `messages.view`

### 📂 Categories Management
- Create/edit/delete categories
- Manage parent-child relationships
- Permission check: `categories.manage`

### 🔐 Admins & Permissions (Super Admin Only)
- Create admin users
- Assign/revoke permissions via checkbox UI
- Manage admin accounts
- Permission check: `admins.manage` (Super Admin only)

### 🚩 Reports & Flags
- View all reports (ads/messages)
- Update report status
- Add admin notes
- Permission checks: `reports.view`, `reports.manage`

## File Structure

```
client/
├── app/
│   └── admin/
│       ├── layout.tsx          # Admin layout wrapper
│       ├── page.tsx            # Dashboard overview
│       ├── ads/
│       │   └── page.tsx        # Ads management
│       ├── users/
│       │   └── page.tsx        # Users management
│       ├── messages/
│       │   └── page.tsx        # Messages monitoring
│       ├── categories/
│       │   └── page.tsx        # Categories management
│       ├── admins/
│       │   └── page.tsx        # Admins & permissions
│       └── reports/
│           └── page.tsx        # Reports & flags
├── components/
│   └── admin/
│       ├── AdminLayout.tsx     # Main admin layout with sidebar
│       ├── AdminRouteGuard.tsx # Route protection
│       ├── RequirePermission.tsx # Permission-based rendering
│       ├── RequireSuperAdmin.tsx  # Super Admin only rendering
│       ├── StatusBadge.tsx     # Status badge component
│       ├── LoadingSpinner.tsx   # Loading spinner
│       └── ConfirmModal.tsx    # Confirmation modal
└── lib/
    ├── stores/
    │   └── adminStore.ts       # Admin state management
    └── hooks/
        └── admin/
            ├── useAdminAds.ts           # Ads management hooks
            ├── useAdminUsers.ts         # Users management hooks
            ├── useAdminPermissions.ts   # Permissions hooks
            ├── useAdminReports.ts       # Reports hooks
            ├── useAdminStats.ts         # Dashboard stats
            ├── useAdminMessages.ts      # Messages hooks
            ├── useCurrentAdminPermissions.ts # Current admin permissions
            └── useAdminUserPermissions.ts   # Specific admin permissions
```

## Usage

### Accessing the Dashboard

1. Login as ADMIN or SUPER_ADMIN
2. Navigate to `/admin` or click "Admin Panel" in the navbar
3. The route guard will redirect non-admins

### Permission Checks

```tsx
import { useAdminStore } from '@/lib/stores/adminStore';
import RequirePermission from '@/components/admin/RequirePermission';

// In component
const { hasPermission } = useAdminStore();

// Conditional rendering
{hasPermission('ads.approve') && (
  <button onClick={handleApprove}>Approve</button>
)}

// Or use component
<RequirePermission permission="ads.approve">
  <button onClick={handleApprove}>Approve</button>
</RequirePermission>
```

### Super Admin Checks

```tsx
import RequireSuperAdmin from '@/components/admin/RequireSuperAdmin';
import { useAdminStore } from '@/lib/stores/adminStore';

// In component
const { isSuperAdmin } = useAdminStore();

// Or use component
<RequireSuperAdmin>
  <AdminManagementPanel />
</RequireSuperAdmin>
```

## API Integration

All admin operations use React Query for:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

Example:
```tsx
const { data, isLoading } = useAdminAds({ status: 'PENDING_APPROVAL' });
const approveMutation = useApproveAd();

await approveMutation.mutateAsync({ id: adId, data: {} });
```

## Permissions Reference

- `ads.approve` - Approve ads
- `ads.reject` - Reject ads
- `ads.edit` - Edit any ad
- `ads.delete` - Delete any ad
- `users.view` - View all users
- `users.block` - Block users
- `users.suspend` - Suspend users
- `messages.view` - View all messages
- `categories.manage` - Manage categories
- `admins.manage` - Manage admin users (Super Admin only)
- `reports.view` - View reports
- `reports.manage` - Manage reports

## Notes

- Super Admin has all permissions by default
- Admin users must have permissions assigned
- UI elements are hidden if user lacks permission
- All mutations show toast notifications
- Confirmation modals for destructive actions

