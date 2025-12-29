# Quick Start Guide

## Running the Application

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Testing the Application

### Mock Authentication
- **Login**: Use any email and password (e.g., `test@example.com` / `password123`)
- The app will automatically create or use a mock user

### Features to Test

1. **Language Switching**
   - Click the language toggle button (FA/DE) in the navbar
   - Notice the RTL/LTR layout changes

2. **Browse Categories**
   - Click on any category from the home page
   - Use filters to narrow down results

3. **View Ad Details**
   - Click on any ad card
   - View image gallery, seller info, and contact options

4. **Create an Ad**
   - Login first (any credentials work)
   - Click "Create Ad" in navbar or dashboard
   - Fill out the form and upload images
   - Submit to see it in your dashboard

5. **Search**
   - Use the search bar in the navbar
   - Search by title or description

## Mock Data

All data is stored in memory and will reset on page refresh. The mock data includes:
- 6 sample ads
- 3 users
- 6 categories with subcategories
- 8 cities in Germany

## API Integration Notes

All API calls are mocked in `lib/api/mockApi.ts`. When ready to connect to a real backend:

1. Replace functions in `lib/api/mockApi.ts` with real API calls
2. Update authentication to use real tokens
3. Replace mock data with database queries
4. Add proper error handling

All integration points are marked with `// TODO: Replace with real API endpoint` comments.

## Project Structure

- `app/` - Next.js pages (App Router)
- `components/` - Reusable React components
- `lib/` - Utilities, contexts, and API services
- `data/` - Mock data definitions
- `public/` - Static assets

## Troubleshooting

- **Build errors**: Run `npm run build` to check for TypeScript errors
- **Missing dependencies**: Run `npm install` again
- **Port already in use**: Change port with `npm run dev -- -p 3001`

