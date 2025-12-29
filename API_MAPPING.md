# API Mapping Documentation

This document maps all backend APIs to their corresponding frontend pages and components.

## Authentication APIs

### POST /api/auth/signup
- **Page**: `/signup`
- **Component**: `app/signup/page.tsx`
- **Hook**: `useSignup()` from `lib/hooks/useAuth.ts`
- **Input**: `{ name, email, phone, password }`
- **Output**: `{ user, accessToken, refreshToken }`
- **Access**: Public

### POST /api/auth/login
- **Page**: `/login`
- **Component**: `app/login/page.tsx`
- **Hook**: `useLogin()` from `lib/hooks/useAuth.ts`
- **Input**: `{ email, password }`
- **Output**: `{ user, accessToken, refreshToken }`
- **Access**: Public

### POST /api/auth/refresh
- **Hook**: `useRefreshToken()` from `lib/hooks/useAuth.ts`
- **Input**: `{ refreshToken }`
- **Output**: `{ user, accessToken, refreshToken }`
- **Access**: Public (with valid refresh token)

### POST /api/auth/logout
- **Hook**: `useLogout()` from `lib/hooks/useAuth.ts`
- **Input**: None (uses JWT from header)
- **Output**: `{ message: "Logged out successfully" }`
- **Access**: Authenticated

---

## Ads APIs

### GET /api/ads
- **Pages**: 
  - `/` (Home page - shows APPROVED ads)
  - `/admin/ads` (Admin - shows all ads with filters)
- **Component**: `app/page.tsx`, `app/admin/ads/page.tsx`
- **Hook**: `useAds(filters)` from `lib/hooks/useAds.ts`
- **Input**: Query params: `{ categoryId, cityId, minPrice, maxPrice, status, search, page, limit, sortBy, sortOrder }`
- **Output**: `{ data: Ad[], pagination: { total, page, limit, totalPages } }`
- **Access**: Public (only APPROVED ads), Admin (all ads)

### GET /api/ads/:id
- **Page**: `/ad/[id]`
- **Component**: `app/ad/[id]/page.tsx`
- **Hook**: `useAd(id)` from `lib/hooks/useAds.ts`
- **Input**: Ad ID (UUID)
- **Output**: `Ad` object with full details
- **Access**: Public

### GET /api/ads/user/my
- **Page**: `/dashboard`
- **Component**: `app/dashboard/page.tsx`
- **Hook**: `useMyAds()` from `lib/hooks/useAds.ts`
- **Input**: None (uses current user from JWT)
- **Output**: `Ad[]` - current user's ads
- **Access**: Authenticated

### GET /api/ads/user/:userId
- **Hook**: `useUserAds(userId)` from `lib/hooks/useAds.ts`
- **Input**: User ID (UUID)
- **Output**: `Ad[]` - user's ads
- **Access**: Authenticated (own ads or admin)

### POST /api/ads
- **Page**: `/create-ad`
- **Component**: `app/create-ad/page.tsx`
- **Hook**: `useCreateAd()` from `lib/hooks/useAds.ts`
- **Input**: `{ title, description, price, categoryId, subcategoryId?, cityId, condition? }`
- **Output**: `Ad` object (status: PENDING_APPROVAL)
- **Access**: Authenticated

### PATCH /api/ads/:id
- **Page**: `/edit-ad/[id]`
- **Component**: `app/edit-ad/[id]/page.tsx`
- **Hook**: `useUpdateAd()` from `lib/hooks/useAds.ts`
- **Input**: `{ title?, description?, price?, categoryId?, cityId?, condition? }`
- **Output**: Updated `Ad` object
- **Access**: Authenticated (owner or admin)

### DELETE /api/ads/:id
- **Hook**: `useDeleteAd()` from `lib/hooks/useAds.ts`
- **Input**: Ad ID (UUID)
- **Output**: Success message
- **Access**: Authenticated (owner or admin)

### POST /api/ads/:id/approve
- **Page**: `/admin/ads`
- **Component**: `app/admin/ads/page.tsx`
- **Hook**: `useApproveAd()` from `lib/hooks/useAds.ts`
- **Input**: `{ notes? }`
- **Output**: Updated `Ad` object (status: APPROVED)
- **Access**: Admin/Super Admin (requires `ads.approve` permission)

### POST /api/ads/:id/reject
- **Page**: `/admin/ads`
- **Component**: `app/admin/ads/page.tsx`
- **Hook**: `useRejectAd()` from `lib/hooks/useAds.ts`
- **Input**: `{ reason }`
- **Output**: Updated `Ad` object (status: REJECTED)
- **Access**: Admin/Super Admin (requires `ads.reject` permission)

---

## Images APIs

### GET /api/images/ad/:adId
- **Pages**: `/ad/[id]`, `/edit-ad/[id]`
- **Hook**: `useAdImages(adId)` from `lib/hooks/useImages.ts`
- **Input**: Ad ID (UUID)
- **Output**: `Image[]` - all images for the ad
- **Access**: Public

### GET /api/images/:id
- **Hook**: `useImage(id)` from `lib/hooks/useImages.ts`
- **Input**: Image ID (UUID)
- **Output**: `Image` object
- **Access**: Public

### POST /api/images/:adId
- **Pages**: `/create-ad`, `/edit-ad/[id]`
- **Hook**: `useUploadImage()` from `lib/hooks/useImages.ts`
- **Input**: FormData with `file` and optional `order` query param
- **Output**: `Image` object
- **Access**: Authenticated (ad owner only)

### DELETE /api/images/:id
- **Page**: `/edit-ad/[id]`
- **Hook**: `useDeleteImage()` from `lib/hooks/useImages.ts`
- **Input**: Image ID (UUID)
- **Output**: Success message
- **Access**: Authenticated (ad owner or admin)

---

## Messages APIs

### POST /api/messages
- **Pages**: `/ad/[id]`, `/messages/[adId]`
- **Hook**: `useSendMessage()` from `lib/hooks/useMessages.ts`
- **Input**: `{ adId, messageText }`
- **Output**: `Message` object
- **Access**: Authenticated

### GET /api/messages/inbox/my
- **Page**: `/messages`
- **Component**: `app/messages/page.tsx`
- **Hook**: `useMyInbox()` from `lib/hooks/useMessages.ts`
- **Input**: None (uses current user from JWT)
- **Output**: `Message[]` - user's inbox
- **Access**: Authenticated

### GET /api/messages/ad/:adId
- **Page**: `/messages/[adId]`
- **Component**: `app/messages/[adId]/page.tsx`
- **Hook**: `useAdMessages(adId)` from `lib/hooks/useMessages.ts`
- **Input**: Ad ID (UUID)
- **Output**: `Message[]` - messages for the ad
- **Access**: Authenticated (ad owner or message participant)

### GET /api/messages/:id
- **Hook**: `useMessage(id)` from `lib/hooks/useMessages.ts`
- **Input**: Message ID (UUID)
- **Output**: `Message` object
- **Access**: Authenticated (participant only)

### PATCH /api/messages/:id/read
- **Page**: `/messages`
- **Hook**: `useMarkMessageAsRead()` from `lib/hooks/useMessages.ts`
- **Input**: Message ID (UUID)
- **Output**: Updated `Message` object
- **Access**: Authenticated (message receiver)

---

## Reports APIs

### POST /api/reports
- **Page**: `/ad/[id]` (report button)
- **Hook**: `useCreateReport()` from `lib/hooks/useReports.ts`
- **Input**: `{ type: 'ad' | 'message', entityId, reason }`
- **Output**: `Report` object
- **Access**: Authenticated

### GET /api/reports
- **Page**: `/admin/reports`
- **Component**: `app/admin/reports/page.tsx`
- **Hook**: `useReports(filters)` from `lib/hooks/useReports.ts`
- **Input**: Query params: `{ type?, status?, page?, limit? }`
- **Output**: `{ data: Report[], total, page, limit }`
- **Access**: Admin/Super Admin (requires `messages.view` permission)

### GET /api/reports/:id
- **Page**: `/reports/[id]`
- **Component**: `app/reports/[id]/page.tsx`
- **Hook**: `useReport(id)` from `lib/hooks/useReports.ts`
- **Input**: Report ID (UUID)
- **Output**: `Report` object with full details
- **Access**: Admin/Super Admin (requires `messages.view` permission)

### PATCH /api/reports/:id/status
- **Page**: `/reports/[id]`
- **Hook**: `useUpdateReportStatus()` from `lib/hooks/useReports.ts`
- **Input**: `{ status, adminNotes? }`
- **Output**: Updated `Report` object
- **Access**: Admin/Super Admin (requires `messages.view` permission)

---

## Users APIs

### GET /api/users/profile
- **Page**: `/profile`
- **Component**: `app/profile/page.tsx`
- **Hook**: `useUserProfile()` from `lib/hooks/useUsers.ts`
- **Input**: None (uses current user from JWT)
- **Output**: `User` object (without password)
- **Access**: Authenticated

### PUT /api/users/profile
- **Page**: `/profile`
- **Hook**: `useUpdateProfile()` from `lib/hooks/useUsers.ts`
- **Input**: `{ name?, email?, phone?, password? }`
- **Output**: Updated `User` object
- **Access**: Authenticated

### GET /api/users
- **Page**: `/admin/users`
- **Component**: `app/admin/users/page.tsx`
- **Hook**: `useUsers(filters)` from `lib/hooks/useUsers.ts`
- **Input**: Query params: `{ roleId?, isBlocked?, isSuspended?, page?, limit? }`
- **Output**: `{ data: User[], total, page, limit }`
- **Access**: Admin/Super Admin (requires `users.view` permission)

### GET /api/users/:id
- **Hook**: `useUser(id)` from `lib/hooks/useUsers.ts`
- **Input**: User ID (UUID)
- **Output**: `User` object
- **Access**: Admin/Super Admin (requires `users.view` permission)

### POST /api/users/admin
- **Page**: `/admin/admins`
- **Component**: `app/admin/admins/page.tsx`
- **Hook**: `useCreateAdmin()` from `lib/hooks/useUsers.ts`
- **Input**: `{ name, email, phone, password, role?: 'ADMIN' }`
- **Output**: `User` object
- **Access**: Super Admin only (requires `admins.manage` permission)

### PATCH /api/users/:id/block
- **Page**: `/admin/users`
- **Hook**: `useBlockUser()` from `lib/hooks/useUsers.ts`
- **Input**: User ID (UUID)
- **Output**: Updated `User` object
- **Access**: Admin/Super Admin (requires `users.block` permission)

### PATCH /api/users/:id/unblock
- **Page**: `/admin/users`
- **Hook**: `useUnblockUser()` from `lib/hooks/useUsers.ts`
- **Input**: User ID (UUID)
- **Output**: Updated `User` object
- **Access**: Admin/Super Admin (requires `users.block` permission)

### PATCH /api/users/:id/suspend
- **Page**: `/admin/users`
- **Hook**: `useSuspendUser()` from `lib/hooks/useUsers.ts`
- **Input**: `{ id, until: Date }`
- **Output**: Updated `User` object
- **Access**: Admin/Super Admin (requires `users.suspend` permission)

---

## Categories APIs

### GET /api/categories
- **Pages**: `/`, `/categories`, `/admin/categories`
- **Components**: `app/page.tsx`, `app/categories/page.tsx`, `app/admin/categories/page.tsx`
- **Hook**: `useCategories()` from `lib/hooks/useCategories.ts`
- **Input**: None
- **Output**: `Category[]` - root categories with nested children
- **Access**: Public

### GET /api/categories/:id
- **Page**: `/category/[id]`
- **Component**: `app/category/[id]/page.tsx`
- **Hook**: `useCategory(id)` from `lib/hooks/useCategories.ts`
- **Input**: Category ID (UUID)
- **Output**: `Category` object with parent and children
- **Access**: Public

### POST /api/categories
- **Page**: `/admin/categories`
- **Hook**: `useCreateCategory()` from `lib/hooks/useCategories.ts`
- **Input**: `{ name: { en?, de?, fa? }, icon?, parentId? }`
- **Output**: `Category` object
- **Access**: Admin/Super Admin only

### PATCH /api/categories/:id
- **Page**: `/admin/categories`
- **Hook**: `useUpdateCategory()` from `lib/hooks/useCategories.ts`
- **Input**: `{ name?, icon?, parentId? }`
- **Output**: Updated `Category` object
- **Access**: Admin/Super Admin only

### DELETE /api/categories/:id
- **Page**: `/admin/categories`
- **Hook**: `useDeleteCategory()` from `lib/hooks/useCategories.ts`
- **Input**: Category ID (UUID)
- **Output**: Success message
- **Access**: Admin/Super Admin only

---

## Cities APIs

### GET /api/cities
- **Pages**: Multiple (used in forms)
- **Hook**: `useCities()` from `lib/hooks/useCities.ts`
- **Input**: None
- **Output**: `City[]` - all cities
- **Access**: Public

### GET /api/cities/:id
- **Hook**: `useCity(id)` from `lib/hooks/useCities.ts`
- **Input**: City ID (UUID)
- **Output**: `City` object
- **Access**: Public

### POST /api/cities
- **Page**: `/admin/cities`
- **Component**: `app/admin/cities/page.tsx`
- **Hook**: `useCreateCity()` from `lib/hooks/useCities.ts`
- **Input**: `{ name: { en?, de?, fa? } }`
- **Output**: `City` object
- **Access**: Admin/Super Admin only

---

## Permissions APIs

### GET /api/permissions
- **Page**: `/admin/admins`
- **Component**: `app/admin/admins/page.tsx`
- **Hook**: `usePermissions()` from `lib/hooks/usePermissions.ts`
- **Input**: None
- **Output**: `Permission[]` - all available permissions
- **Access**: Admin/Super Admin only

### POST /api/permissions/assign
- **Page**: `/admin/admins`
- **Hook**: `useAssignPermission()` from `lib/hooks/usePermissions.ts`
- **Input**: `{ adminId, permissionId }`
- **Output**: Success message
- **Access**: Super Admin only (requires `admins.manage` permission)

### DELETE /api/permissions/revoke
- **Page**: `/admin/admins`
- **Hook**: `useRevokePermission()` from `lib/hooks/usePermissions.ts`
- **Input**: `{ adminId, permissionId }`
- **Output**: Success message
- **Access**: Super Admin only (requires `admins.manage` permission)

---

## Access Control Summary

### Public Access (No Authentication)
- GET /api/ads (only APPROVED ads)
- GET /api/ads/:id
- GET /api/categories
- GET /api/categories/:id
- GET /api/cities
- GET /api/cities/:id
- GET /api/images/ad/:adId
- GET /api/images/:id
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/refresh

### Authenticated Users
- All user profile operations
- Create/update/delete own ads
- Send/receive messages
- Create reports
- Upload/delete images for own ads

### Admin Access (requires specific permissions)
- View all ads: `ads.view`
- Approve ads: `ads.approve`
- Reject ads: `ads.reject`
- View users: `users.view`
- Block users: `users.block`
- Suspend users: `users.suspend`
- View reports: `messages.view`
- Manage categories: Admin/Super Admin role
- Manage cities: Admin/Super Admin role

### Super Admin Only
- Create admin users: `admins.manage`
- Assign/revoke permissions: `admins.manage`
- All admin operations (no permission checks)

