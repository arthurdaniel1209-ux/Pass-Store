import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CartItem, Product, Order, UserRole, Notification, OrderStatus, CEOConfig } from '../types';
import { products as initialProducts, categories as initialCategories } from '../data/mockData';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, doc, setDoc, getDoc, onSnapshot, 
  addDoc, updateDoc, deleteDoc, query, where, orderBy,
  writeBatch, serverTimestamp
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  products: Product[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  ceoConfig: CEOConfig | null;
  updateCEOConfig: (config: CEOConfig) => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [ceoConfig, setCeoConfig] = useState<CEOConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pass_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('pass_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pass_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pass_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Auth Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          // Use getDoc with a more permissive error handling for the initial sync
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // New user identification
            const isAdminEmail = firebaseUser.email === 'admin@pass.com' || 
                            firebaseUser.email === 'arthur@gmail.com' || 
                            firebaseUser.email === 'arthurdaniel1209@gmail.com';
            
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Usuário Pass',
              email: firebaseUser.email || '',
              role: isAdminEmail ? UserRole.ADMIN : UserRole.CUSTOMER
            };

            try {
              await setDoc(userRef, newUser);
              setUser(newUser);
            } catch (createError: any) {
              // If we're "offline", we might see a failure here. 
              // We'll set the user locally anyway for a better UX, 
              // Firestore will sync the write when back online.
              setUser(newUser);
              if (!createError?.message?.includes('offline')) {
                handleFirestoreError(createError, OperationType.CREATE, `users/${firebaseUser.uid}`);
              }
            }
          }
        } catch (error: any) {
          // If the getDoc fails because the client is offline, we just use the firebaseUser 
          // info as a fallback so the app can continue to load.
          if (error?.message?.includes('offline')) {
            const isAdminEmail = firebaseUser.email === 'admin@pass.com' || 
                            firebaseUser.email === 'arthur@gmail.com' || 
                            firebaseUser.email === 'arthurdaniel1209@gmail.com';
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Usuário',
              email: firebaseUser.email || '',
              role: isAdminEmail ? UserRole.ADMIN : UserRole.CUSTOMER
            });
          } else {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Products Sync
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => doc.data() as Product);
      setProducts(prods);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });
    return () => unsubscribe();
  }, []);

  // Initial Seeding Logic (Runs once when app is ready and state is empty)
  useEffect(() => {
    if (!isLoading && products.length === 0) {
      const seedData = async () => {
        try {
          const batch = writeBatch(db);
          initialProducts.forEach(p => {
            batch.set(doc(db, 'products', p.id), p);
          });
          initialCategories.forEach(c => {
            batch.set(doc(db, 'categories', c.id), c);
          });
          await batch.commit();
        } catch (err) {
          console.warn("Seeding failed (permissions?):", err);
        }
      };
      seedData();
    }
  }, [isLoading, products.length]);

  // Orders Sync
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    
    const q = user.role === UserRole.ADMIN 
      ? query(collection(db, 'orders'), orderBy('created_at', 'desc'))
      : query(collection(db, 'orders'), where('user_id', '==', user.id), orderBy('created_at', 'desc'));
      
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => doc.data() as Order));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });
    return () => unsubscribe();
  }, [user]);

  // Notifications Sync
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', user.id),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });
    return () => unsubscribe();
  }, [user]);

  // CEO Config Sync & Default Seeding
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'ceo', 'config'), (snapshot) => {
      if (snapshot.exists()) {
        setCeoConfig(snapshot.data() as CEOConfig);
      } else if (!isLoading && user?.role === UserRole.ADMIN) {
        // Seed default CEO config if it doesn't exist
        const defaultCEO: CEOConfig = {
          name: "Alex Alv Jr.",
          title: "CEO & Founder da PASS",
          handle: "alexalvjr",
          status: "Visionaire",
          description: "Sua visão transcende o vestuário, mergulhando na intersecção entre arte, subcultura e o futuro do streetwear global.",
          avatarUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format",
          behindGlowColor: "rgba(254, 58, 74, 0.3)",
          innerGradient: "linear-gradient(135deg, rgba(8, 8, 8, 0.95) 0%, rgba(20, 20, 20, 0.8) 100%)",
          updatedAt: serverTimestamp()
        };
        setDoc(doc(db, 'ceo', 'config'), defaultCEO).catch(err => {
          console.warn("Failed to seed CEO config (probably no permission yet):", err);
        });
      }
    });

    return () => unsubscribe();
  }, [isLoading, user]);

  const addProduct = async (product: Product) => {
    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `products/${product.id}`);
    }
  };
  
  const updateProduct = async (product: Product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), { ...product });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${product.id}`);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    }
  };

  const addOrder = async (order: Order) => {
    try {
      await setDoc(doc(db, 'orders', order.id), {
        ...order,
        user_name: user?.name || 'Unknown'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `orders/${order.id}`);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) return;
      
      const orderData = orderDoc.data() as Order;
      await updateDoc(orderRef, { status });

      // Create notification for user
      const notification: Omit<Notification, 'id'> = {
        user_id: orderData.user_id,
        title: 'Atualização do Pedido',
        message: `Seu pedido #${orderId.slice(0, 8)} agora está: ${status.toUpperCase()}`,
        type: 'order_status',
        read: false,
        created_at: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'notifications'), notification);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
    }
  };

  const addToCart = (product: Product, size: string, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size === size);
      if (existing) {
        return prev.map(item => 
          (item.product.id === product.id && item.size === size) 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { product, size, quantity }];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
  };

  const updateCartQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart(prev => prev.map(item => 
      (item.product.id === productId && item.size === size) 
        ? { ...item, quantity } 
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const updateCEOConfig = async (config: CEOConfig) => {
    try {
      // updatedAt is enforced in rules as request.time, but we set it here for type safety and local optimisim if needed
      // Actually rules say data.updatedAt == request.time, so we must send a serverTimestamp placeholder
      // and update doc supports serverTimestamp
      const { serverTimestamp } = await import('firebase/firestore');
      await setDoc(doc(db, 'ceo', 'config'), {
        ...config,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'ceo/config');
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, 
      products, addProduct, updateProduct, deleteProduct,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
      orders, addOrder, updateOrderStatus,
      notifications, markNotificationAsRead,
      favorites, toggleFavorite,
      ceoConfig, updateCEOConfig,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
