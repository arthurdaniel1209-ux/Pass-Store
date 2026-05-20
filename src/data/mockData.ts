import { Category, Product, User, UserRole } from '../types';

export const categories: Category[] = [
  { id: 'cat1', name: 'Camisetas', description: 'Camisetas casuais e versáteis' },
  { id: 'cat2', name: 'Calças', description: 'Calças confortáveis e estilosas' },
  { id: 'cat3', name: 'Moletons', description: 'Moletons para dias frios' },
  { id: 'cat4', name: 'Acessórios', description: 'Bonés, meias e mais' },
];

const clothesImages = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Camiseta Essential Black',
    description: 'Nossa camiseta mais vendida, feita com algodão premium 100% orgânico.',
    price: 129.90,
    category_id: 'cat1',
    is_active: true,
    sizes: ['P', 'M', 'G', 'GG'],
    images: [
      { id: 'img1', product_id: 'p1', url: clothesImages[0], is_primary: true }
    ],
    collection: 'Essentials',
    is_drop: false
  },
  {
    id: 'p2',
    name: 'Calça Cargo Tech',
    description: 'Calça cargo com múltiplos bolsos e tecido resistente à água.',
    price: 299.00,
    category_id: 'cat2',
    is_active: true,
    sizes: ['38', '40', '42', '44'],
    images: [
      { id: 'img2', product_id: 'p2', url: clothesImages[1], is_primary: true }
    ],
    collection: 'Urban',
    is_drop: true
  },
  {
    id: 'p3',
    name: 'Moletom Oversized Sand',
    description: 'Moletom macio com modelagem oversized para máximo conforto.',
    price: 249.00,
    category_id: 'cat3',
    is_active: true,
    sizes: ['P', 'M', 'G'],
    images: [
      { id: 'img3', product_id: 'p3', url: clothesImages[2], is_primary: true }
    ],
    collection: 'Winter 24',
    is_drop: false
  },
  {
    id: 'p4',
    name: 'Boné Pass Signature',
    description: 'Boné aba curva com logo bordado em alta definição.',
    price: 89.00,
    category_id: 'cat4',
    is_active: true,
    sizes: ['Único'],
    images: [
      { id: 'img4', product_id: 'p4', url: clothesImages[3], is_primary: true }
    ],
    collection: 'Essentials',
    is_drop: false
  },
  {
    id: 'p5',
    name: 'Camiseta Drop Especial 01',
    description: 'Edição limitada do primeiro drop da nova coleção.',
    price: 159.00,
    category_id: 'cat1',
    is_active: true,
    sizes: ['P', 'M', 'G', 'GG'],
    images: [
      { id: 'img5', product_id: 'p5', url: clothesImages[4], is_primary: true }
    ],
    collection: 'Drop 01',
    is_drop: true
  }
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'Admin Pass', email: 'admin@pass.com', role: UserRole.ADMIN },
  { id: 'u2', name: 'Arthur Admin', email: 'arthur@gmail.com', role: UserRole.ADMIN },
  { id: 'u3', name: 'Cliente Teste', email: 'cliente@test.com', role: UserRole.CUSTOMER }
];
