// Mock data for development - will be replaced with Prisma queries

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  gender: 'MEN' | 'WOMEN' | 'UNISEX';
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  description: string;
  stock: number;
  isNewArrival: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  category: string[];
  variants: {
    id: string;
    size: string;
    price: number;
    stock: number;
  }[];
}

export const mockProducts: Product[] = [
  {
    id: '1',
    slug: 'oud-royal',
    name: 'Oud Royal',
    brand: 'Maison Francis Kurkdjian',
    gender: 'UNISEX',
    price: 45000,
    originalPrice: 52000,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    ],
    description: 'Une composition luxueuse et profonde, mêlant oud précieux et rose de Damas.',
    stock: 12,
    isNewArrival: true,
    isFeatured: true,
    isOnSale: true,
    category: ['Oriental', 'Woody'],
    variants: [
      { id: 'v1', size: '30ml', price: 28000, stock: 5 },
      { id: 'v2', size: '50ml', price: 45000, stock: 12 },
      { id: 'v3', size: '100ml', price: 78000, stock: 8 },
    ],
  },
  {
    id: '2',
    slug: 'la-vie-est-belle',
    name: 'La Vie Est Belle',
    brand: 'Lancôme',
    gender: 'WOMEN',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&q=80',
    ],
    description: 'Un parfum gourmand floral, symbole de liberté et de bonheur.',
    stock: 8,
    isNewArrival: false,
    isFeatured: true,
    isOnSale: false,
    category: ['Floral', 'Gourmand'],
    variants: [
      { id: 'v4', size: '30ml', price: 18000, stock: 8 },
      { id: 'v5', size: '50ml', price: 32000, stock: 4 },
      { id: 'v6', size: '100ml', price: 58000, stock: 0 },
    ],
  },
  {
    id: '3',
    slug: 'sauvage',
    name: 'Sauvage',
    brand: 'Dior',
    gender: 'MEN',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80',
    ],
    description: 'Frais et puissant, un parfum masculin inspiré par les grands espaces.',
    stock: 15,
    isNewArrival: true,
    isFeatured: false,
    isOnSale: false,
    category: ['Fresh', 'Aromatic'],
    variants: [
      { id: 'v7', size: '60ml', price: 38000, stock: 15 },
      { id: 'v8', size: '100ml', price: 62000, stock: 10 },
    ],
  },
  {
    id: '4',
    slug: 'black-opium',
    name: 'Black Opium',
    brand: 'Yves Saint Laurent',
    gender: 'WOMEN',
    price: 35000,
    originalPrice: 42000,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80',
    ],
    description: 'Addiction olfactive sensuelle, un parfum féminin énergique et mystérieux.',
    stock: 3,
    isNewArrival: false,
    isFeatured: true,
    isOnSale: true,
    category: ['Oriental', 'Gourmand'],
    variants: [
      { id: 'v9', size: '30ml', price: 20000, stock: 3 },
      { id: 'v10', size: '50ml', price: 35000, stock: 2 },
      { id: 'v11', size: '90ml', price: 58000, stock: 5 },
    ],
  },
  {
    id: '5',
    slug: 'acqua-di-gio',
    name: 'Acqua di Giò',
    brand: 'Giorgio Armani',
    gender: 'MEN',
    price: 36000,
    image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80',
    ],
    description: 'Fraîcheur aquatique et élégance méditerranéenne.',
    stock: 0,
    isNewArrival: false,
    isFeatured: false,
    isOnSale: false,
    category: ['Aquatic', 'Fresh'],
    variants: [
      { id: 'v12', size: '50ml', price: 36000, stock: 0 },
      { id: 'v13', size: '100ml', price: 60000, stock: 0 },
    ],
  },
  {
    id: '6',
    slug: 'coco-mademoiselle',
    name: 'Coco Mademoiselle',
    brand: 'Chanel',
    gender: 'WOMEN',
    price: 48000,
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80',
    ],
    description: 'Fraîcheur pétillante et élégance intemporelle, un classique moderne.',
    stock: 18,
    isNewArrival: true,
    isFeatured: true,
    isOnSale: false,
    category: ['Floral', 'Fresh'],
    variants: [
      { id: 'v14', size: '35ml', price: 28000, stock: 18 },
      { id: 'v15', size: '50ml', price: 48000, stock: 12 },
      { id: 'v16', size: '100ml', price: 85000, stock: 7 },
    ],
  },
  {
    id: '7',
    slug: 'one-million',
    name: 'One Million',
    brand: 'Paco Rabanne',
    gender: 'MEN',
    price: 29000,
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80',
    ],
    description: 'Explosif et sexy, un parfum qui ne passe pas inaperçu.',
    stock: 22,
    isNewArrival: false,
    isFeatured: false,
    isOnSale: false,
    category: ['Spicy', 'Woody'],
    variants: [
      { id: 'v17', size: '50ml', price: 29000, stock: 22 },
      { id: 'v18', size: '100ml', price: 48000, stock: 15 },
    ],
  },
  {
    id: '8',
    slug: 'good-girl',
    name: 'Good Girl',
    brand: 'Carolina Herrera',
    gender: 'WOMEN',
    price: 41000,
    originalPrice: 48000,
    image: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80',
    ],
    description: 'Dualité séduisante entre lumière et obscurité, innocence et audace.',
    stock: 6,
    isNewArrival: false,
    isFeatured: true,
    isOnSale: true,
    category: ['Floral', 'Oriental'],
    variants: [
      { id: 'v19', size: '30ml', price: 22000, stock: 6 },
      { id: 'v20', size: '50ml', price: 41000, stock: 4 },
      { id: 'v21', size: '80ml', price: 65000, stock: 8 },
    ],
  },
];

export const brands = [
  'Maison Francis Kurkdjian',
  'Lancôme',
  'Dior',
  'Yves Saint Laurent',
  'Giorgio Armani',
  'Chanel',
  'Paco Rabanne',
  'Carolina Herrera',
];

export const categories = [
  'Oriental',
  'Woody',
  'Floral',
  'Gourmand',
  'Fresh',
  'Aromatic',
  'Aquatic',
  'Spicy',
];
