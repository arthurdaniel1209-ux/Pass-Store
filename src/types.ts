/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  is_primary: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_active: boolean;
  images: ProductImage[];
  sizes: string[];
  collection?: string;
  is_drop?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  stars: number;
  comment: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order_status' | 'general';
  read: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  user_name?: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  address: {
    street: string;
    city?: string;
    state?: string;
    zipCode: string;
  };
  paymentMethod: 'card' | 'pix' | 'boleto';
  created_at: string;
}

export interface CEOConfig {
  name: string;
  title: string;
  handle: string;
  status: string;
  description: string;
  avatarUrl: string;
  behindGlowColor: string;
  innerGradient: string;
  updatedAt: any;
}
