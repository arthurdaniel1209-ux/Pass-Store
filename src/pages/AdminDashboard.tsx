import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { categories } from '../data/mockData';
import { Product, ProductImage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Plus, Edit3, Trash2, X, Check, Search, 
  Image as ImageIcon, Tag, Hash, Archive, AlertCircle, ShoppingBag, Clock, Truck, CheckCircle2, User as UserIcon, MapPin, Upload,
  ChevronLeft, ChevronRight, Link2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { compressImage } from '../lib/compressImage';
import { uploadToStorage } from '../lib/firebase';

export default function AdminDashboard() {
  const { products, addProduct, updateProduct, deleteProduct, orders, updateOrderStatus, ceoConfig, updateCEOConfig } = useAppContext();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'ceo'>('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // CEO Form State
  const [ceoFormData, setCeoFormData] = useState({
    name: '',
    title: '',
    handle: '',
    status: '',
    description: '',
    avatarUrl: '',
    behindGlowColor: '',
    innerGradient: ''
  });

  useEffect(() => {
    if (ceoConfig) {
      setCeoFormData({
        name: ceoConfig.name,
        title: ceoConfig.title,
        handle: ceoConfig.handle,
        status: ceoConfig.status,
        description: ceoConfig.description,
        avatarUrl: ceoConfig.avatarUrl,
        behindGlowColor: ceoConfig.behindGlowColor,
        innerGradient: ceoConfig.innerGradient
      });
    }
  }, [ceoConfig, activeTab]);

  const handleCEOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ceoConfig) return;
    try {
      await updateCEOConfig({
        ...ceoConfig,
        ...ceoFormData
      });
      showNotification('Configuração do CEO atualizada com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Erro ao atualizar configurações do CEO.', 'error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Compress image client-side to ensure lightweight upload
      const compressedBlob = await compressImage(file);
      
      let imageUrl = '';
      try {
        // Try uploading to Firebase Storage first
        imageUrl = await uploadToStorage(compressedBlob, 'ceo');
        console.log("Uploaded successfully to Firebase Storage (ceo):", imageUrl);
      } catch (storageError) {
        console.warn("Firebase Storage failed (ceo), falling back to local server upload:", storageError);
        // Fallback to local server /api/upload
        const formData = new FormData();
        formData.append('image', compressedBlob);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.url) {
          imageUrl = data.url;
        } else {
          throw new Error("Local upload failed as well");
        }
      }

      if (imageUrl) {
        setCeoFormData(prev => ({ ...prev, avatarUrl: imageUrl }));
        showNotification('Foto do CEO atualizada!', 'success');
      }
    } catch (error) {
      console.error("Upload error:", error);
      showNotification("Falha no upload da imagem.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const [productUploading, setProductUploading] = useState(false);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setProductUploading(true);
    const newImages = [...(formData.images || [])];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Compress image client-side to ensure lightweight and fast upload
        const compressedBlob = await compressImage(file);
        
        let imageUrl = '';
        try {
          // Try uploading to Firebase Storage first
          imageUrl = await uploadToStorage(compressedBlob, 'products');
          console.log("Uploaded successfully to Firebase Storage (product):", imageUrl);
        } catch (storageError) {
          console.warn("Firebase Storage failed (product), falling back to local server upload:", storageError);
          // Fallback to local server /api/upload
          const uploadForm = new FormData();
          uploadForm.append('image', compressedBlob);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: uploadForm,
          });

          const data = await response.json().catch(() => null);

          if (!response.ok) {
            const errorMsg = data?.error || 'Falha ao enviar arquivo';
            throw new Error(errorMsg);
          }

          if (data && data.url) {
            imageUrl = data.url;
          }
        }

        if (imageUrl) {
          if (index !== undefined && i === 0) {
            newImages[index] = {
              ...newImages[index],
              url: imageUrl
            };
          } else {
            newImages.push({
              id: Math.random().toString(),
              product_id: '',
              url: imageUrl,
              is_primary: newImages.length === 0
            });
          }
        }
      }

      setFormData({ ...formData, images: newImages });
      showNotification(files.length > 1 ? 'Imagens enviadas com sucesso!' : 'Imagem enviada com sucesso!', 'success');
    } catch (error) {
      console.error("Product image upload error:", error);
      showNotification("Falha ao subir imagem. Tente novamente.", "error");
    } finally {
      setProductUploading(false);
      e.target.value = '';
    }
  };

  // Image Drag-and-Drop and Reordering
  const [isDragging, setIsDragging] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const streetPresets = [
    { name: 'Tee Essential', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Cargo Tech', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Hoodie Oversized', url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Pass Cap', url: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Tee Black Model', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop' },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Simulate standard ChangeEvent
    const simulatedEvent = {
      target: { files }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    await handleProductImageUpload(simulatedEvent);
  };

  const handleAddImageUrl = (urlToAdd?: string) => {
    const url = urlToAdd || manualUrl;
    if (!url || !url.trim()) return;

    const newImages = [...(formData.images || [])];
    newImages.push({
      id: Math.random().toString(),
      product_id: '',
      url: url.trim(),
      is_primary: newImages.length === 0
    });

    setFormData({ ...formData, images: newImages });
    if (!urlToAdd) setManualUrl('');
    showNotification('Imagem adicionada com sucesso!', 'success');
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...(formData.images || [])];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    // Swap indexes
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    setFormData({ ...formData, images: newImages });
  };

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category_id: categories[0].id,
    sizes: ['P', 'M', 'G', 'GG'],
    is_active: true,
    is_drop: false,
    collection: '',
    images: []
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.collection?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category_id: categories[0].id,
        sizes: ['P', 'M', 'G', 'GG'],
        is_active: true,
        is_drop: false,
        collection: '',
        images: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
    } as Product;

    if (editingProduct) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }
    handleCloseModal();
  };

  const toggleSize = (size: string) => {
    const currentSizes = formData.sizes || [];
    if (currentSizes.includes(size)) {
      setFormData({ ...formData, sizes: currentSizes.filter(s => s !== size) });
    } else {
      setFormData({ ...formData, sizes: [...currentSizes, size] });
    }
  };

  return (
    <Layout>
      {/* Floating Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
              "fixed top-8 right-8 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border backdrop-blur-md max-w-sm",
              notification.type === 'success' 
                ? "bg-emerald-950/90 border-emerald-500/20 text-emerald-100" 
                : "bg-red-950/90 border-red-500/20 text-red-100"
            )}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-[11px] font-black uppercase tracking-wider">
                {notification.type === 'success' ? 'Sucesso' : 'Erro'}
              </p>
              <p className="text-[10px] font-bold opacity-80 mt-0.5 leading-relaxed">
                {notification.message}
              </p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              type="button"
            >
              <X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-12">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 border-b border-slate-200 pb-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white italic font-black">A</div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Administração</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic leading-none font-display text-slate-900">
              Gestão de Prod.
            </h1>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-[0.2em]">
              Gerencie inventário, drops e pedidos
            </p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => setActiveTab('products')}
              className={cn(
                "px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'products' ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Produtos
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'orders' ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Pedidos
            </button>
            <button 
              onClick={() => setActiveTab('ceo')}
              className={cn(
                "px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === 'ceo' ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50" : "text-slate-400 hover:text-slate-600"
              )}
            >
              CEO
            </button>
          </div>

          {activeTab === 'products' && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Adicionar Peça
            </button>
          )}
        </div>

        {activeTab === 'products' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou coleção..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-semibold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Products Table/Grid */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-xl shadow-slate-100">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 italic font-display">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Produto</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Preço</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                            <img src={product.images[0]?.url || null} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 uppercase tracking-tight">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.collection || 'Generic'}</p>
                              <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-black uppercase tracking-wider">
                                {categories.find(c => c.id === product.category_id)?.name || 'Outro'}
                              </span>
                            </div>
                            {product.is_drop && <span className="inline-block mt-2 px-2 py-0.5 bg-accent/10 text-accent text-[8px] font-black uppercase rounded">Drop Ativo</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-mono font-black text-lg">R$ {product.price.toFixed(2)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          product.is_active ? "bg-green-500 shadow-lg shadow-green-100" : "bg-slate-300"
                        )} />
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenModal(product)}
                            className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 shadow-sm"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteProduct(product.id)}
                            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      <img src={product.images[0]?.url || null} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{product.collection || 'Generic'}</p>
                            <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-black uppercase tracking-wider">
                              {categories.find(c => c.id === product.category_id)?.name || 'Outro'}
                            </span>
                          </div>
                        </div>
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full mt-1",
                          product.is_active ? "bg-green-500" : "bg-slate-300"
                        )} />
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-mono font-black text-base">R$ {product.price.toFixed(2)}</span>
                        {product.is_drop && <span className="px-2 py-0.5 bg-accent/10 text-accent text-[8px] font-black uppercase rounded">Drop</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => handleOpenModal(product)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100"
                    >
                      <Edit3 className="w-3 h-3" /> Editar
                    </button>
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100"
                    >
                      <Trash2 className="w-3 h-3" /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
        ) : activeTab === 'orders' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="bg-white border border-slate-200 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 italic font-display">
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Pedido / Data</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cliente</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Produtos</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Total / Status</th>
                      <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-10 py-8">
                          <div className="flex flex-col gap-2">
                            <span className="font-mono font-black text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                              <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col gap-2">
                            <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-slate-300" /> {order.user_name || 'Desconhecido'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                              <MapPin className="w-3 h-3" /> {order.address.street}, {order.address.zipCode}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col gap-1.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-[11px] font-bold text-slate-500 uppercase">
                                <span className="text-slate-900">{item.quantity}x</span> {item.product.name} ({item.size})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col gap-3">
                            <span className="font-black text-slate-900 text-lg tracking-tight">R$ {order.total.toFixed(2)}</span>
                            <div className={cn(
                              "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 w-fit",
                              order.status === 'pending' && "bg-amber-100 text-amber-700",
                              order.status === 'processing' && "bg-blue-100 text-blue-700",
                              order.status === 'shipped' && "bg-green-100 text-green-700",
                              order.status === 'delivered' && "bg-slate-900 text-white",
                              order.status === 'cancelled' && "bg-red-100 text-red-700"
                            )}>
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                order.status === 'pending' && "bg-amber-500",
                                order.status === 'processing' && "bg-blue-500",
                                order.status === 'shipped' && "bg-green-500",
                                order.status === 'delivered' && "bg-white",
                                order.status === 'cancelled' && "bg-red-500"
                              )} />
                              {order.status}
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex gap-3">
                            {order.status === 'pending' ? (
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200"
                              >
                                <Truck className="w-3.5 h-3.5" /> Marcar Enviado
                              </button>
                            ) : (
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'pending')}
                                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-400 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-amber-600 hover:border-amber-100 hover:bg-amber-50 transition-all active:scale-95"
                              >
                                <Clock className="w-3.5 h-3.5" /> Voltar Pendente
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-32 text-center">
                          <ShoppingBag className="w-12 h-12 text-slate-100 mx-auto mb-6" />
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Nenhum pedido encontrado no sistema.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-[3.5rem] p-12 shadow-2xl shadow-slate-200/50"
          >
            <div className="mb-12">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Editar Seção CEO</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Configure a visão do visionário</p>
            </div>

            <form onSubmit={handleCEOSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome</label>
                    <input 
                      type="text" required
                      value={ceoFormData.name}
                      onChange={(e) => setCeoFormData({...ceoFormData, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 px-6 outline-none focus:bg-white focus:border-slate-900 transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Título</label>
                    <input 
                      type="text" required
                      value={ceoFormData.title}
                      onChange={(e) => setCeoFormData({...ceoFormData, title: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 px-6 outline-none focus:bg-white focus:border-slate-900 transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Instagram (@handle)</label>
                    <input 
                      type="text" required
                      value={ceoFormData.handle}
                      onChange={(e) => setCeoFormData({...ceoFormData, handle: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 px-6 outline-none focus:bg-white focus:border-slate-900 transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status/Tagline</label>
                    <input 
                      type="text" required
                      value={ceoFormData.status}
                      onChange={(e) => setCeoFormData({...ceoFormData, status: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 px-6 outline-none focus:bg-white focus:border-slate-900 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Foto ProfileCard</label>
                    <div className="flex flex-col gap-4">
                      <div className="relative group aspect-[3/4] w-32 rounded-2xl overflow-hidden bg-slate-50 border-2 border-slate-100 transition-all">
                        {ceoFormData.avatarUrl ? (
                          <img src={ceoFormData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-20">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                          <Upload className="w-5 h-5 text-white" />
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {isUploading && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <Clock className="w-4 h-4 animate-spin text-slate-900" />
                          </div>
                        )}
                      </div>
                      <input 
                        type="text" required
                        placeholder="Ou URL da imagem"
                        value={ceoFormData.avatarUrl}
                        onChange={(e) => setCeoFormData({...ceoFormData, avatarUrl: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 px-6 outline-none focus:bg-white focus:border-slate-900 transition-all font-semibold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cor do Rastro (CSS)</label>
                    <input 
                      type="text" required
                      value={ceoFormData.behindGlowColor}
                      onChange={(e) => setCeoFormData({...ceoFormData, behindGlowColor: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 px-6 outline-none focus:bg-white focus:border-slate-900 transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gradiente do Card (CSS)</label>
                    <input 
                      type="text" required
                      value={ceoFormData.innerGradient}
                      onChange={(e) => setCeoFormData({...ceoFormData, innerGradient: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 px-6 outline-none focus:bg-white focus:border-slate-900 transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descrição Visionária</label>
                <textarea 
                  rows={6} required
                  value={ceoFormData.description}
                  onChange={(e) => setCeoFormData({...ceoFormData, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-6 px-6 outline-none focus:bg-white focus:border-slate-900 transition-all font-medium text-sm resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-6 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-[0.98]"
              >
                Salvar Configurações CEO
              </button>
            </form>
          </motion.div>
        )}
      </div>

      {/* Admin Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-10 md:p-14 overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
                      {editingProduct ? 'Editar Peça' : 'Nova Peça'}
                    </h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Padrão Pass Store v1</p>
                  </div>
                  <button onClick={handleCloseModal} className="p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form id="admin-form" onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Basic Info */}
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome do Produto</label>
                        <div className="relative">
                          <Package className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input 
                            type="text" required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:bg-white focus:border-slate-900 transition-all font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Preço (BRL)</label>
                        <div className="relative">
                          <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input 
                            type="number" step="0.01" required
                            value={formData.price !== undefined && !isNaN(formData.price as number) ? formData.price : ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setFormData({...formData, price: isNaN(val) ? 0 : val});
                            }}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:bg-white focus:border-slate-900 transition-all font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoria</label>
                        <div className="relative">
                          <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <select 
                            value={formData.category_id || categories[0].id}
                            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:bg-white focus:border-slate-900 transition-all font-semibold appearance-none cursor-pointer"
                          >
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descrição</label>
                        <textarea 
                          rows={4} required
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-6 px-6 outline-none focus:bg-white focus:border-slate-900 transition-all font-medium text-sm resize-none"
                        />
                      </div>
                    </div>

                    {/* Meta Data */}
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Coleção</label>
                        <div className="relative">
                          <Archive className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input 
                            type="text"
                            value={formData.collection}
                            onChange={(e) => setFormData({...formData, collection: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:bg-white focus:border-slate-900 transition-all font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tamanhos Disponíveis</label>
                        <div className="flex flex-wrap gap-4">
                          {['P', 'M', 'G', 'GG', '38', '40', '42', '44', 'Único'].map(size => (
                            <button 
                              key={size} type="button"
                              onClick={() => toggleSize(size)}
                              className={cn(
                                "min-w-[50px] h-12 rounded-xl border-2 font-bold text-xs transition-all",
                                formData.sizes?.includes(size) ? "bg-slate-900 text-white border-slate-900" : "border-slate-100 text-slate-300 hover:border-slate-200"
                              )}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, is_drop: !formData.is_drop})}
                          className={cn(
                            "flex items-center justify-between p-6 rounded-3xl border-2 transition-all group",
                            formData.is_drop 
                              ? "bg-accent/5 border-accent shadow-lg shadow-accent/10" 
                              : "bg-slate-50 border-slate-100 hover:border-slate-200"
                          )}
                        >
                          <div className="flex flex-col items-start gap-1">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              formData.is_drop ? "text-accent" : "text-slate-400"
                            )}>Drop Ativo</span>
                            <span className="text-[9px] font-medium text-slate-400">Destaque na Home</span>
                          </div>
                          <div className={cn(
                            "w-12 h-6 rounded-full transition-all relative p-1",
                            formData.is_drop ? "bg-accent" : "bg-slate-200"
                          )}>
                            <div className={cn(
                              "w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                              formData.is_drop ? "translate-x-6" : "translate-x-0"
                            )} />
                          </div>
                        </button>

                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                          className={cn(
                            "flex items-center justify-between p-6 rounded-3xl border-2 transition-all group",
                            formData.is_active 
                              ? "bg-green-50 border-green-500 shadow-lg shadow-green-100" 
                              : "bg-slate-50 border-slate-100 hover:border-slate-200"
                          )}
                        >
                          <div className="flex flex-col items-start gap-1">
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              formData.is_active ? "text-green-600" : "text-slate-400"
                            )}>Publicado</span>
                            <span className="text-[9px] font-medium text-slate-400">Visível para Clientes</span>
                          </div>
                          <div className={cn(
                            "w-12 h-6 rounded-full transition-all relative p-1",
                            formData.is_active ? "bg-green-500" : "bg-slate-200"
                          )}>
                            <div className={cn(
                              "w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                              formData.is_active ? "translate-x-6" : "translate-x-0"
                            )} />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Image Management with Drag & Drop, URL and Presets */}
                  <div className="space-y-8 border-t border-slate-100 pt-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Galeria de Imagens</label>
                      <span className="text-[9px] text-slate-400 font-medium ml-1">Suba fotos locais, cole links públicos ou escolha um de nossos modelos streetwear de alta definição para testar rápido.</span>
                    </div>

                    {/* Predefinidos / Presets Shortcuts */}
                    <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="text-[8px] font-black uppercase tracking-wider text-slate-400">Inserção Rápida de Presets Streetwear Unsplash</div>
                      <div className="flex flex-wrap gap-2.5">
                        {streetPresets.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleAddImageUrl(preset.url)}
                            className="bg-white hover:bg-slate-900 hover:text-white border border-slate-200/60 rounded-xl px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm active:scale-95"
                          >
                            + {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Manual Image URL Input */}
                    <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex-1 relative">
                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          type="text"
                          placeholder="Colar URL de imagem direta do Unsplash..."
                          value={manualUrl}
                          onChange={(e) => setManualUrl(e.target.value)}
                          className="w-full bg-white border border-slate-150 rounded-xl py-3 pl-12 pr-4 text-xs font-semibold outline-none focus:border-slate-900 transition-all font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddImageUrl()}
                        className="bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md cursor-pointer active:scale-95 shrink-0"
                      >
                        Adicionar Link
                      </button>
                    </div>

                    {/* Drag-and-Drop Area & Upload Triggers */}
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-[2rem] p-8 transition-all flex flex-col items-center justify-center gap-6",
                        isDragging 
                          ? "border-slate-900 bg-slate-100/80 scale-[0.99] shadow-inner" 
                          : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                      )}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 text-slate-400 shadow-sm">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Arraste e solte arquivos aqui</p>
                        <p className="text-[9px] text-slate-400 font-medium">Aceitamos arquivos JPG, PNG, WEBP comprimidos client-side</p>
                      </div>

                      <div className="flex items-center gap-4">
                        {productUploading && (
                          <div className="flex items-center gap-2 text-slate-900 text-[10.5px] font-black uppercase tracking-widest opacity-100">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 animate-ping" />
                            Fazendo Upload...
                          </div>
                        )}
                        <button 
                          type="button"
                          onClick={() => {
                            document.getElementById('product-bulk-upload')?.click();
                          }}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Selecionar Arquivos</span>
                        </button>
                      </div>
                      {/* Hidden multi-file input */}
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        id="product-bulk-upload" 
                        className="hidden" 
                        onChange={(e) => handleProductImageUpload(e)} 
                      />
                    </div>

                    {/* Images Sorted Grid with Controls */}
                    {(formData.images || []).length > 0 && (
                      <div className="space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fotos na Galeria (Arremate Visual)</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                          {(formData.images || []).map((img, i) => (
                            <div key={img.id} className="group relative flex flex-col gap-2">
                              <input 
                                type="file" 
                                accept="image/*" 
                                id={`product-single-upload-${img.id}`} 
                                className="hidden" 
                                onChange={(e) => handleProductImageUpload(e, i)} 
                              />
                              
                              <div className={cn(
                                "aspect-[3/4] rounded-3xl overflow-hidden bg-slate-50 border-2 transition-all relative",
                                img.is_primary ? "border-slate-900 shadow-xl shadow-slate-200/50 scale-[1.02]" : "border-slate-100 hover:border-slate-300"
                              )}>
                                {img.url && (
                                  <img src={img.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                                )}
                                
                                {/* Overlay hover actions */}
                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                  {/* Top Position: Primary button */}
                                  {!img.is_primary && (
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const newImages = (formData.images || []).map((image, index) => ({
                                          ...image,
                                          is_primary: index === i
                                        }));
                                        setFormData({ ...formData, images: newImages });
                                      }}
                                      className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-4 py-2 text-[8px] font-black uppercase tracking-widest shadow-xl cursor-pointer hover:scale-105 transition-transform"
                                    >
                                      Destacar Principal
                                    </button>
                                  )}

                                  {/* Delete button */}
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const newImages = (formData.images || []).filter((_, index) => index !== i);
                                      // If we deleted the primary, make the first item primary
                                      if (img.is_primary && newImages.length > 0) {
                                        newImages[0].is_primary = true;
                                      }
                                      setFormData({ ...formData, images: newImages });
                                    }}
                                    className="bg-red-600 text-white hover:bg-red-700 p-2.5 rounded-full shadow-xl cursor-pointer hover:scale-110 transition-transform"
                                    title="Remover Imagem"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Main indicator badge */}
                                {img.is_primary && (
                                  <div className="absolute top-4 left-4 px-2 py-1 bg-slate-900 border border-slate-800 text-white rounded-lg text-[7px] font-black uppercase tracking-widest shadow-md">Principal</div>
                                )}

                                {/* Image index badge */}
                                <div className="absolute bottom-4 right-4 w-5 h-5 rounded-full bg-slate-900/80 text-white flex items-center justify-center text-[8px] font-mono font-bold border border-white/20">
                                  {i + 1}
                                </div>
                              </div>

                              {/* Reorder and Modify Controls */}
                              <div className="flex gap-1.5 items-center justify-between">
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    disabled={i === 0}
                                    onClick={() => moveImage(i, 'left')}
                                    className={cn(
                                      "p-2 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-lg transition-colors cursor-pointer",
                                      i === 0 && "opacity-30 cursor-not-allowed"
                                    )}
                                    title="Mover para esquerda"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={i === (formData.images || []).length - 1}
                                    onClick={() => moveImage(i, 'right')}
                                    className={cn(
                                      "p-2 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-lg transition-colors cursor-pointer",
                                      i === (formData.images || []).length - 1 && "opacity-30 cursor-not-allowed"
                                    )}
                                    title="Mover para direita"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => document.getElementById(`product-single-upload-${img.id}`)?.click()}
                                  className="bg-slate-50 hover:bg-slate-100 border border-slate-150 text-slate-600 rounded-lg px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider transition-colors"
                                >
                                  Alterar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="p-10 border-t border-slate-100 bg-slate-50 flex gap-6">
                <button 
                  onClick={handleCloseModal}
                  className="flex-1 py-5 rounded-2xl border border-slate-200 font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  form="admin-form" type="submit"
                  className="flex-1 py-5 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
