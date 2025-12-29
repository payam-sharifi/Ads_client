# Classified Ads Website - Persian & German

A complete frontend for a bilingual (Persian RTL / German LTR) classified ads website built with Next.js, React, and TypeScript.

## Features

- ✅ **Bilingual Support**: Persian (RTL) and German (LTR) with language switching
- ✅ **i18n**: All texts, messages, and errors are translatable
- ✅ **Mock Data**: Complete mock data for ads, users, categories, cities, and messages
- ✅ **Responsive Design**: Fully optimized for mobile and desktop
- ✅ **RTL/LTR Layout**: Proper support for both text directions

## Pages

1. **Home Page** (`/`)
   - Categories with icons
   - Quick search functionality
   - Recent ads list with images, title, price, and city

2. **Category Page** (`/category/[id]`)
   - Filters: subcategories, city, price, date, status
   - Ads list with pagination
   - Display ad status (active, pending, sold)

3. **Ad Detail Page** (`/ad/[id]`)
   - Full ad details with image gallery
   - Seller information
   - Message functionality (mock)
   - Report ad option

4. **Authentication Pages**
   - Sign-up (`/signup`)
   - Login (`/login`)
   - Password Recovery (`/forgot-password`)
   - Mock authentication flow

5. **User Dashboard** (`/dashboard`)
   - List of user's ads
   - Edit and delete ads
   - Premium ad status

6. **Create/Edit Ad** (`/create-ad`, `/edit-ad/[id]`)
   - Complete form with all fields
   - Image upload with preview
   - Category and subcategory selection
   - City selection
   - Status selection

## Project Structure

```
classified-ads/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout with providers
│   ├── login/             # Authentication pages
│   ├── signup/
│   ├── forgot-password/
│   ├── dashboard/         # User dashboard
│   ├── create-ad/         # Create new ad
│   ├── edit-ad/[id]/      # Edit existing ad
│   ├── category/[id]/     # Category page with filters
│   ├── ad/[id]/           # Ad detail page
│   └── categories/         # All categories listing
├── components/
│   ├── common/            # Reusable components
│   │   ├── Button.tsx
│   │   ├── Alert.tsx
│   │   └── AdCard.tsx
│   └── layout/            # Layout components
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/
│   ├── contexts/          # React contexts
│   │   ├── I18nContext.tsx
│   │   └── AuthContext.tsx
│   ├── api/               # API service layer
│   │   └── mockApi.ts     # Mock API (TODO: Replace with real API)
│   └── i18n.ts           # i18n configuration
├── data/
│   └── mockData.ts        # Mock data for development
└── public/
    └── locales/          # Translation files (if needed)
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Mock Data

The application uses mock data for development and testing. All API calls are mocked in `lib/api/mockApi.ts`. 

**Important**: When connecting to a real backend, replace the mock API calls with actual endpoints. All API integration points are marked with `// TODO: Replace with real API endpoint` comments.

## API Integration Points

All mock API calls are in `lib/api/mockApi.ts`:

- `authApi`: Login, signup, logout
- `adsApi`: Get all ads, get by ID, create, update, delete
- `categoriesApi`: Get all categories, get by ID
- `citiesApi`: Get all cities
- `messagesApi`: Send message to seller
- `reportsApi`: Report an ad

## Technologies Used

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **react-dropzone** - Image upload
- **react-image-gallery** - Image gallery
- **react-datepicker** - Date selection (available but not used yet)

## RTL/LTR Support

The application automatically switches between RTL (Persian) and LTR (German) layouts based on the selected language. The HTML `dir` attribute is updated dynamically.

## Future Backend Integration

The project is structured to easily connect to a real backend (Node.js/NestJS). To integrate:

1. Replace mock API calls in `lib/api/mockApi.ts` with real API endpoints
2. Update authentication to use real tokens
3. Replace mock data with real database queries
4. Add proper error handling and loading states

## Notes

- All text content comes from translation files (`lib/i18n.ts`)
- Mock authentication accepts any email/password for testing
- Images use placeholder service (picsum.photos) for development
- The app is fully functional with mock data

## License

MIT
