# Frontend Implementation Guide

This document provides a complete overview of the Next.js frontend implementation, including all pages, components, and their API connections.

## Project Structure

```
client/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Home page (list of approved ads)
│   ├── login/                    # Authentication pages
│   ├── signup/
│   ├── dashboard/                # User dashboard (my ads)
│   ├── profile/                  # User profile management
│   ├── ad/                       # Ad detail pages
│   │   └── [id]/
│   ├── category/                 # Category pages
│   │   └── [id]/
│   ├── categories/               # All categories list
│   ├── create-ad/                # Create new ad
│   ├── edit-ad/                  # Edit existing ad
│   │   └── [id]/
│   ├── messages/                 # Messages pages
│   │   ├── page.tsx              # Inbox
│   │   └── [adId]/               # Conversation about an ad
│   ├── reports/                  # Report detail (admin)
│   │   └── [id]/
│   └── admin/                    # Admin dashboard pages
│       ├── page.tsx              # Admin dashboard overview
│       ├── ads/                  # Ads management
│       ├── users/                # Users management
│       ├── categories/           # Categories management
│       ├── cities/               # Cities management
│       ├── messages/             # Messages monitoring
│       ├── reports/              # Reports & flags
│       └── admins/               # Admins & permissions (Super Admin)
│
├── components/
│   ├── common/                   # Reusable components
│   │   ├── AdCard.tsx           # Ad card component (divar.ir style)
│   │   ├── Button.tsx            # Button component
│   │   ├── DataTable.tsx        # Table with pagination & sorting
│   │   ├── FilterBar.tsx        # Filter component
│   │   └── Alert.tsx            # Alert component
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx           # Main navigation
│   │   ├── MainNavigation.tsx  # Enhanced navigation (divar.ir style)
│   │   └── Footer.tsx           # Footer
│   └── admin/                    # Admin-specific components
│       ├── AdminLayout.tsx      # Admin layout with sidebar
│       ├── AdminRouteGuard.tsx  # Route protection
│       ├── RequirePermission.tsx # Permission-based rendering
│       ├── RequireSuperAdmin.tsx # Super Admin only rendering
│       ├── StatusBadge.tsx     # Status badge component
│       ├── LoadingSpinner.tsx   # Loading spinner
│       └── ConfirmModal.tsx     # Confirmation modal
│
├── lib/
│   ├── hooks/                    # React Query hooks
│   │   ├── useAuth.ts           # Authentication hooks
│   │   ├── useAds.ts            # Ads API hooks
│   │   ├── useUsers.ts          # Users API hooks
│   │   ├── useMessages.ts       # Messages API hooks
│   │   ├── useReports.ts        # Reports API hooks
│   │   ├── useCategories.ts    # Categories API hooks
│   │   ├── useCities.ts         # Cities API hooks
│   │   ├── useImages.ts        # Images API hooks
│   │   ├── usePermissions.ts    # Permissions API hooks
│   │   └── admin/               # Admin-specific hooks
│   │       ├── useAdminAds.ts
│   │       ├── useAdminUsers.ts
│   │       ├── useAdminReports.ts
│   │       ├── useAdminStats.ts
│   │       └── ...
│   ├── stores/                   # Zustand stores
│   │   ├── authStore.ts         # Authentication state
│   │   └── adminStore.ts        # Admin state & permissions
│   ├── api/                      # API client
│   │   └── client.ts            # Axios instance with interceptors
│   └── contexts/                 # React contexts
│       └── I18nContext.tsx      # Internationalization
│
└── API_MAPPING.md               # Complete API endpoint mapping

```

## Key Features

### 1. **Reusable Components**

#### DataTable Component
- **Location**: `components/common/DataTable.tsx`
- **Features**:
  - Pagination support
  - Column sorting
  - Loading states
  - Empty states
  - Row actions
  - Clickable rows (optional)
- **Usage**:
```tsx
<DataTable
  data={items}
  columns={columns}
  pagination={paginationData}
  onPageChange={handlePageChange}
  onSort={handleSort}
  loading={isLoading}
  actions={(item) => <ActionButtons item={item} />}
  rowLink={(item) => `/detail/${item.id}`}
/>
```

#### FilterBar Component
- **Location**: `components/common/FilterBar.tsx`
- **Features**:
  - Multiple filter types (text, select, number, date)
  - Reset functionality
  - Responsive grid layout
- **Usage**:
```tsx
<FilterBar
  filters={filterState}
  filterOptions={filterOptions}
  onFilterChange={handleFilterChange}
  onReset={handleReset}
/>
```

### 2. **Page Types**

#### Public Pages
- **Home** (`/`): Lists all approved ads with search and filters
- **Category List** (`/categories`): Grid view of all categories
- **Category Detail** (`/category/[id]`): Ads in a specific category with filters
- **Ad Detail** (`/ad/[id]`): Full ad details with images, contact, report

#### User Pages (Authenticated)
- **Dashboard** (`/dashboard`): User's own ads
- **Profile** (`/profile`): Edit user profile
- **Create Ad** (`/create-ad`): Create new ad with image upload
- **Edit Ad** (`/edit-ad/[id]`): Edit existing ad
- **Messages** (`/messages`): Inbox
- **Ad Messages** (`/messages/[adId]`): Conversation about an ad

#### Admin Pages (Role-based)
- **Admin Dashboard** (`/admin`): Overview with statistics
- **Ads Management** (`/admin/ads`): Approve/reject/edit ads
- **Users Management** (`/admin/users`): Block/suspend users
- **Categories** (`/admin/categories`): CRUD operations
- **Cities** (`/admin/cities`): Create cities
- **Reports** (`/admin/reports`): Manage reports
- **Admins & Permissions** (`/admin/admins`): Super Admin only

### 3. **API Integration**

All API calls use React Query hooks for:
- Automatic caching
- Loading states
- Error handling
- Cache invalidation
- Optimistic updates

Example:
```tsx
const { data, isLoading, error } = useAds({ status: 'APPROVED' });
const createMutation = useCreateAd();
```

### 4. **Access Control**

#### Permission Checks
```tsx
const { hasPermission, isSuperAdmin } = useAdminStore();

if (!hasPermission('ads.approve')) {
  return <div>No permission</div>;
}
```

#### Route Protection
- Admin routes use `AdminRouteGuard`
- Components use `RequirePermission` and `RequireSuperAdmin`

### 5. **UI/UX Features**

#### Divar.ir Style
- Clean, modern design
- Horizontal ad cards (image left, content right)
- Category grid layout
- Sticky navigation
- Search bar in header
- User menu dropdown

#### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg
- Touch-friendly buttons
- Collapsible menus

#### Loading States
- Skeleton loaders
- Spinner components
- Optimistic UI updates

#### Error Handling
- Toast notifications (react-toastify)
- Error boundaries
- Graceful fallbacks

## API Connection Examples

### Creating an Ad
```tsx
// Page: /create-ad
const createAdMutation = useCreateAd();
const uploadImageMutation = useUploadImage();

const handleSubmit = async (data) => {
  // 1. Create ad (POST /api/ads)
  const ad = await createAdMutation.mutateAsync(data);
  
  // 2. Upload images (POST /api/images/:adId)
  for (const file of imageFiles) {
    await uploadImageMutation.mutateAsync({
      adId: ad.id,
      file,
    });
  }
};
```

### Admin Approving an Ad
```tsx
// Page: /admin/ads
const approveMutation = useApproveAd();

const handleApprove = async (adId: string) => {
  if (!hasPermission('ads.approve')) {
    toast.error('No permission');
    return;
  }
  
  // POST /api/ads/:id/approve
  await approveMutation.mutateAsync({ id: adId, notes: 'Approved' });
};
```

### Filtering Ads
```tsx
// Page: /category/[id]
const [filters, setFilters] = useState({
  cityId: '',
  minPrice: '',
  maxPrice: '',
});

const { data } = useAds({
  categoryId,
  cityId: filters.cityId || undefined,
  minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
  maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
  status: 'APPROVED',
});
```

## Navigation Flow

```
Home (/)
  ├── Search → Home with search query
  ├── Category → Category Detail
  ├── Ad → Ad Detail
  │   ├── Message → Ad Messages
  │   └── Report → Create Report
  └── Login/Signup → Dashboard

Dashboard (/dashboard)
  ├── Create Ad → Create Ad Page
  └── Edit Ad → Edit Ad Page

Admin Dashboard (/admin)
  ├── Ads → Ads Management
  ├── Users → Users Management
  ├── Categories → Categories Management
  ├── Cities → Cities Management
  ├── Reports → Reports Management
  └── Admins → Admins & Permissions (Super Admin)
```

## State Management

### Authentication State (Zustand)
- User info
- JWT token
- Refresh token
- Persisted in localStorage

### Admin State (Zustand)
- Permissions list
- Sidebar state
- Filter states
- Permission check helpers

### Server State (React Query)
- All API data
- Automatic caching
- Background refetching
- Optimistic updates

## Styling

- **Framework**: Tailwind CSS
- **Design System**: Custom (divar.ir inspired)
- **Colors**:
  - Primary: Red (#DC2626 / red-600)
  - Background: Gray-50
  - Text: Gray-900
  - Borders: Gray-200
- **Components**: Reusable with consistent styling

## Testing Checklist

- [ ] All public pages load correctly
- [ ] Authentication flow works
- [ ] CRUD operations for all resources
- [ ] Permission checks work correctly
- [ ] Admin pages are protected
- [ ] Forms validate correctly
- [ ] Images upload successfully
- [ ] Pagination works
- [ ] Filters work
- [ ] Search works
- [ ] Responsive design on mobile
- [ ] Error handling displays properly

## Next Steps

1. Add more comprehensive error boundaries
2. Implement image optimization
3. Add analytics tracking
4. Implement SEO optimization
5. Add unit tests
6. Add E2E tests
7. Implement offline support (PWA)
8. Add dark mode support

