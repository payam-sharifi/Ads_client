// Mock API service - Replace with real API calls when connecting to backend
import { Ad, User, Category, City, mockAds, mockUsers, mockCategories, mockCities, getCategoryById, getCityById, getUserById, getAdsByCategory, getAdsByUser } from '@/data/mockData';

// Re-export types for convenience
export type { User, Ad, Category, City } from '@/data/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface CreateAdRequest {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  subcategoryId?: string;
  cityId: string;
  images: string[];
  status: 'active' | 'pending' | 'sold';
}

// Mock authentication state
let currentUser: User | null = null;
let authToken: string | null = null;

// TODO: Replace with real API endpoint
export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> => {
    await delay(800);
    // Mock: Accept any email/password for testing
    const user = mockUsers.find(u => u.email === credentials.email) || mockUsers[0];
    currentUser = user;
    authToken = `mock_token_${Date.now()}`;
    return {
      data: { user, token: authToken },
      success: true,
      message: 'Login successful',
    };
  },

  signup: async (data: SignupRequest): Promise<ApiResponse<{ user: User; token: string }>> => {
    await delay(1000);
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name: data.name,
      email: data.email,
      phone: data.phone,
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    currentUser = newUser;
    authToken = `mock_token_${Date.now()}`;
    return {
      data: { user: newUser, token: authToken },
      success: true,
      message: 'Signup successful',
    };
  },

  logout: async (): Promise<ApiResponse<null>> => {
    await delay(300);
    currentUser = null;
    authToken = null;
    return { data: null, success: true };
  },

  getCurrentUser: (): User | null => currentUser,

  isAuthenticated: (): boolean => currentUser !== null,
};

// TODO: Replace with real API endpoint
export const adsApi = {
  getAll: async (filters?: {
    categoryId?: string;
    subcategoryId?: string;
    cityId?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<Ad[]>> => {
    await delay(500);
    let filteredAds = [...mockAds];

    if (filters?.categoryId) {
      filteredAds = filteredAds.filter(
        ad => ad.categoryId === filters.categoryId || ad.subcategoryId === filters.categoryId
      );
    }
    if (filters?.subcategoryId) {
      filteredAds = filteredAds.filter(ad => ad.subcategoryId === filters.subcategoryId);
    }
    if (filters?.cityId) {
      filteredAds = filteredAds.filter(ad => ad.cityId === filters.cityId);
    }
    if (filters?.minPrice !== undefined) {
      filteredAds = filteredAds.filter(ad => ad.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      filteredAds = filteredAds.filter(ad => ad.price <= filters.maxPrice!);
    }
    if (filters?.status) {
      filteredAds = filteredAds.filter(ad => ad.status === filters.status);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredAds = filteredAds.filter(
        ad => ad.title.toLowerCase().includes(searchLower) || ad.description.toLowerCase().includes(searchLower)
      );
    }

    return { data: filteredAds, success: true };
  },

  getById: async (id: string): Promise<ApiResponse<Ad | null>> => {
    await delay(400);
    const ad = mockAds.find(a => a.id === id);
    return { data: ad || null, success: !!ad };
  },

  getByUser: async (userId: string): Promise<ApiResponse<Ad[]>> => {
    await delay(400);
    return { data: getAdsByUser(userId), success: true };
  },

  create: async (adData: CreateAdRequest): Promise<ApiResponse<Ad>> => {
    await delay(1000);
    if (!authToken) {
      return { data: null as any, success: false, message: 'Not authenticated' };
    }
    const newAd: Ad = {
      id: String(mockAds.length + 1),
      ...adData,
      userId: currentUser!.id,
      createdAt: new Date().toISOString(),
      views: 0,
      isPremium: false,
    };
    mockAds.unshift(newAd);
    return { data: newAd, success: true, message: 'Ad created successfully' };
  },

  update: async (id: string, adData: Partial<CreateAdRequest>): Promise<ApiResponse<Ad | null>> => {
    await delay(800);
    const index = mockAds.findIndex(a => a.id === id);
    if (index === -1) {
      return { data: null, success: false, message: 'Ad not found' };
    }
    mockAds[index] = { ...mockAds[index], ...adData };
    return { data: mockAds[index], success: true, message: 'Ad updated successfully' };
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    await delay(600);
    const index = mockAds.findIndex(a => a.id === id);
    if (index === -1) {
      return { data: null, success: false, message: 'Ad not found' };
    }
    mockAds.splice(index, 1);
    return { data: null, success: true, message: 'Ad deleted successfully' };
  },
};

// TODO: Replace with real API endpoint
export const categoriesApi = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    await delay(300);
    return { data: mockCategories, success: true };
  },

  getById: async (id: string): Promise<ApiResponse<Category | null>> => {
    await delay(200);
    return { data: getCategoryById(id) || null, success: !!getCategoryById(id) };
  },
};

// TODO: Replace with real API endpoint
export const citiesApi = {
  getAll: async (): Promise<ApiResponse<City[]>> => {
    await delay(200);
    return { data: mockCities, success: true };
  },
};

// TODO: Replace with real API endpoint
export const messagesApi = {
  send: async (adId: string, message: string): Promise<ApiResponse<null>> => {
    await delay(800);
    // Mock: Just return success
    return { data: null, success: true, message: 'Message sent successfully' };
  },
};

// TODO: Replace with real API endpoint
export const reportsApi = {
  reportAd: async (adId: string, reason: string): Promise<ApiResponse<null>> => {
    await delay(600);
    // Mock: Just return success
    return { data: null, success: true, message: 'Report submitted successfully' };
  },
};

