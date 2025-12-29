// Mock data for development and testing
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: {
    fa: string;
    de: string;
  };
  icon: string;
  subcategories?: Category[];
}

export interface City {
  id: string;
  name: {
    fa: string;
    de: string;
  };
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  subcategoryId?: string;
  cityId: string;
  userId: string;
  images: string[];
  status: 'active' | 'pending' | 'sold';
  condition?: 'new' | 'like-new' | 'used'; // نو, در حد نو, کارکرده
  createdAt: string;
  views: number;
  isPremium: boolean;
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'علی احمدی',
    email: 'ali@example.com',
    phone: '+49 123 456789',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Maria Schmidt',
    email: 'maria@example.com',
    phone: '+49 987 654321',
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'رضا کریمی',
    email: 'reza@example.com',
    phone: '+49 555 123456',
    createdAt: '2024-02-01T09:15:00Z',
  },
];

export const mockCities: City[] = [
  { id: '1', name: { fa: 'برلین', de: 'Berlin' } },
  { id: '2', name: { fa: 'مونیخ', de: 'München' } },
  { id: '3', name: { fa: 'هامبورگ', de: 'Hamburg' } },
  { id: '4', name: { fa: 'کلن', de: 'Köln' } },
  { id: '5', name: { fa: 'فرانکفورت', de: 'Frankfurt' } },
  { id: '6', name: { fa: 'اشتوتگارت', de: 'Stuttgart' } },
  { id: '7', name: { fa: 'دوسلدورف', de: 'Düsseldorf' } },
  { id: '8', name: { fa: 'دورتموند', de: 'Dortmund' } },
];

export const mockCategories: Category[] = [
  {
    id: '1',
    name: { fa: 'خودرو', de: 'Fahrzeuge' },
    icon: '🚗',
    subcategories: [
      { id: '1-1', name: { fa: 'خودرو', de: 'Autos' }, icon: '🚙' },
      { id: '1-2', name: { fa: 'موتورسیکلت', de: 'Motorräder' }, icon: '🏍️' },
      { id: '1-3', name: { fa: 'قطعات', de: 'Ersatzteile' }, icon: '🔧' },
    ],
  },
  {
    id: '2',
    name: { fa: 'املاک', de: 'Immobilien' },
    icon: '🏠',
    subcategories: [
      { id: '2-1', name: { fa: 'اجاره', de: 'Mieten' }, icon: '🏘️' },
      { id: '2-2', name: { fa: 'خرید', de: 'Kaufen' }, icon: '🏡' },
      { id: '2-3', name: { fa: 'تجاری', de: 'Gewerbe' }, icon: '🏢' },
    ],
  },
  {
    id: '3',
    name: { fa: 'الکترونیک', de: 'Elektronik' },
    icon: '📱',
    subcategories: [
      { id: '3-1', name: { fa: 'موبایل', de: 'Handys' }, icon: '📲' },
      { id: '3-2', name: { fa: 'لپ‌تاپ', de: 'Laptops' }, icon: '💻' },
      { id: '3-3', name: { fa: 'تلویزیون', de: 'TV' }, icon: '📺' },
    ],
  },
  {
    id: '4',
    name: { fa: 'مبلمان', de: 'Möbel' },
    icon: '🪑',
    subcategories: [
      { id: '4-1', name: { fa: 'میز و صندلی', de: 'Tische & Stühle' }, icon: '🪑' },
      { id: '4-2', name: { fa: 'کمد', de: 'Schränke' }, icon: '🗄️' },
      { id: '4-3', name: { fa: 'تخت', de: 'Betten' }, icon: '🛏️' },
    ],
  },
  {
    id: '5',
    name: { fa: 'پوشاک', de: 'Kleidung' },
    icon: '👕',
    subcategories: [
      { id: '5-1', name: { fa: 'مردانه', de: 'Herren' }, icon: '👔' },
      { id: '5-2', name: { fa: 'زنانه', de: 'Damen' }, icon: '👗' },
      { id: '5-3', name: { fa: 'کودک', de: 'Kinder' }, icon: '👶' },
    ],
  },
  {
    id: '6',
    name: { fa: 'خدمات', de: 'Dienstleistungen' },
    icon: '🔧',
    subcategories: [
      { id: '6-1', name: { fa: 'تعمیرات', de: 'Reparatur' }, icon: '🔨' },
      { id: '6-2', name: { fa: 'آموزش', de: 'Unterricht' }, icon: '📚' },
      { id: '6-3', name: { fa: 'حمل و نقل', de: 'Transport' }, icon: '🚚' },
    ],
  },
];

// Generate mock images using placeholder service
const generateImageUrl = (seed: number, width = 400, height = 300) => 
  `https://picsum.photos/seed/${seed}/${width}/${height}`;

export const mockAds: Ad[] = [
  {
    id: '1',
    title: 'BMW 320d سال 2020',
    description: 'خودروی عالی با شرایط خوب. تمام سرویس‌ها انجام شده است.',
    price: 25000,
    categoryId: '1',
    subcategoryId: '1-1',
    cityId: '1',
    userId: '1',
    images: [generateImageUrl(1), generateImageUrl(11), generateImageUrl(111)],
    status: 'active',
    condition: 'like-new',
    createdAt: '2024-12-20T10:00:00Z',
    views: 245,
    isPremium: true,
  },
  {
    id: '2',
    title: 'iPhone 15 Pro Max 256GB',
    description: 'نو و بدون استفاده. با گارانتی و جعبه اصلی.',
    price: 1200,
    categoryId: '3',
    subcategoryId: '3-1',
    cityId: '2',
    userId: '2',
    images: [generateImageUrl(2), generateImageUrl(22)],
    status: 'active',
    condition: 'new',
    createdAt: '2024-12-22T14:30:00Z',
    views: 189,
    isPremium: false,
  },
  {
    id: '3',
    title: 'آپارتمان 3 خوابه در برلین',
    description: 'آپارتمان زیبا و روشن در منطقه خوب. نزدیک به حمل و نقل عمومی.',
    price: 450000,
    categoryId: '2',
    subcategoryId: '2-2',
    cityId: '1',
    userId: '3',
    images: [generateImageUrl(3), generateImageUrl(33), generateImageUrl(333), generateImageUrl(3333)],
    status: 'pending',
    condition: 'new',
    createdAt: '2024-12-25T09:15:00Z',
    views: 567,
    isPremium: true,
  },
  {
    id: '4',
    title: 'MacBook Pro M2 14 اینچ',
    description: 'لپ‌تاپ عالی برای کار و طراحی. 16GB RAM و 512GB SSD.',
    price: 1800,
    categoryId: '3',
    subcategoryId: '3-2',
    cityId: '3',
    userId: '1',
    images: [generateImageUrl(4)],
    status: 'active',
    condition: 'like-new',
    createdAt: '2024-12-18T16:45:00Z',
    views: 312,
    isPremium: false,
  },
  {
    id: '5',
    title: 'مبلمان کامل اتاق نشیمن',
    description: 'مبلمان مدرن و راحت. شامل کاناپه، میز و صندلی.',
    price: 850,
    categoryId: '4',
    subcategoryId: '4-1',
    cityId: '4',
    userId: '2',
    images: [generateImageUrl(5), generateImageUrl(55)],
    status: 'sold',
    condition: 'like-new',
    createdAt: '2024-12-10T11:20:00Z',
    views: 98,
    isPremium: false,
  },
  {
    id: '6',
    title: 'خدمات تعمیرات لوله‌کشی',
    description: 'تعمیرات حرفه‌ای لوله‌کشی و گرمایش. با گارانتی.',
    price: 0,
    categoryId: '6',
    subcategoryId: '6-1',
    cityId: '5',
    userId: '3',
    images: [generateImageUrl(6)],
    status: 'active',
    condition: 'used',
    createdAt: '2024-12-24T08:00:00Z',
    views: 156,
    isPremium: false,
  },
];

// Helper functions
export function getCategoryById(id: string): Category | undefined {
  for (const cat of mockCategories) {
    if (cat.id === id) return cat;
    if (cat.subcategories) {
      const sub = cat.subcategories.find(s => s.id === id);
      if (sub) return sub;
    }
  }
  return undefined;
}

export function getCityById(id: string): City | undefined {
  return mockCities.find(c => c.id === id);
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find(u => u.id === id);
}

export function getAdsByCategory(categoryId: string): Ad[] {
  return mockAds.filter(ad => ad.categoryId === categoryId || ad.subcategoryId === categoryId);
}

export function getAdsByUser(userId: string): Ad[] {
  return mockAds.filter(ad => ad.userId === userId);
}

