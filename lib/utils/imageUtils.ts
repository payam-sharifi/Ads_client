/**
 * Image URL utilities
 * Constructs full image URLs from relative paths returned by the backend
 */

function getImageBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  return apiUrl.replace(/\/api$/, '');
}

/**
 * Get full image URL from relative path
 * @param url - Relative path from backend (e.g., '/uploads/image.jpg')
 * @returns Full URL (e.g., 'http://localhost:3001/uploads/image.jpg')
 */
export function getImageUrl(url: string | undefined | null): string {
  if (!url) {
    return '/placeholder.svg';
  }
  
  // If already a full URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Construct full URL from relative path
  const baseUrl = getImageBaseUrl();
  const path = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${baseUrl}${path}`;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Image URL:', { original: url, constructed: fullUrl });
  }
  
  return fullUrl;
}

/**
 * Get first image URL from array of images
 * @param images - Array of image objects with url property
 * @returns Full URL of first image or placeholder
 */
export function getFirstImageUrl(images: Array<{ url: string }> | undefined | null): string {
  if (!images || images.length === 0) {
    return '/placeholder.svg';
  }
  
  return getImageUrl(images[0].url);
}

