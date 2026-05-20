import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Heart, Star, Minus, Plus, ChevronLeft, ShieldCheck, Truck, RefreshCcw, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, favorites, toggleFavorite } = useAppContext();
  
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (!product) {
    return (
      <Layout>
        <div className="text-center py-48">
          <h1 className="text-2xl font-black uppercase tracking-widest text-neutral-400">Produto não encontrado</h1>
          <Link to="/produtos" className="mt-6 inline-block text-[10px] font-black uppercase tracking-widest hover:underline">Volar para a loja</Link>
        </div>
      </Layout>
    );
  }

  const isFavorite = favorites.includes(product.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Por favor, selecione um tamanho.');
      return;
    }
    addToCart(product, selectedSize, quantity);
    navigate('/carrinho');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <Link to="/produtos" className="inline-flex items-center gap-4 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all group">
          <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> 
          </div>
          Voltar para Catálogo
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
        {/* Gallery */}
        <div className="space-y-6">
          <motion.div 
            layoutId={`product-img-${product.id}`}
            className="aspect-[3/4] bg-white rounded-[3.5rem] overflow-hidden relative border border-slate-100 shadow-2xl shadow-slate-200/50 group cursor-zoom-in"
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                src={product.images[activeImage]?.url || null} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            
            <div className="absolute top-8 left-8 flex flex-col gap-3">
              {product.is_drop && (
                <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md">
                  Drop Exclusivo
                </div>
              )}
            </div>
            
            <button 
              onClick={() => toggleFavorite(product.id)}
              className={cn(
                "absolute top-8 right-8 w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 backdrop-blur-md active:scale-90",
                isFavorite 
                  ? "bg-red-500/90 border-red-500 text-white shadow-2xl shadow-red-500/40" 
                  : "bg-white/80 border-white text-slate-400 hover:text-red-500 hover:bg-white"
              )}
            >
              <Heart className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </motion.div>
          
          <div className="grid grid-cols-4 gap-4 px-2">
            {product.images.map((img, idx) => (
              <motion.button 
                key={img.id}
                whileHover={{ y: -4 }}
                whileActive={{ scale: 0.95 }}
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "aspect-square rounded-[1.5rem] overflow-hidden border-4 transition-all relative group",
                  activeImage === idx ? "border-slate-900 shadow-xl" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img.url || null} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {activeImage === idx && (
                  <div className="absolute inset-0 bg-slate-900/10 pointer-events-none"></div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Info */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col py-4"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              {product.collection}
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] mb-8 italic text-slate-900">
            {product.name}
          </motion.h1>
          
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-8 mb-12">
            <span className="text-4xl font-black tracking-tighter text-slate-900">R$ {product.price.toFixed(2)}</span>
            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-4 h-4 text-slate-900 fill-current" />
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">(42 Reviews)</span>
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="text-slate-500 leading-relaxed text-base mb-14 max-w-lg font-medium italic">
            "{product.description}"
          </motion.p>

          {/* Size Select */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Selecione o Tamanho</h3>
              <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 underline-offset-8 underline hover:text-slate-900 transition-colors">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-4">
              {product.sizes.map((size) => (
                <motion.button
                  key={size}
                  whileHover={{ y: -2 }}
                  whileActive={{ scale: 0.95 }}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-sm font-black transition-all border-2 relative overflow-hidden",
                    selectedSize === size 
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-200 scale-105 z-10" 
                      : "bg-white text-slate-400 border-slate-100 hover:border-slate-900 hover:text-slate-900"
                  )}
                >
                  {selectedSize === size && (
                    <motion.div 
                      layoutId="size-active"
                      className="absolute inset-0 bg-slate-900 -z-10"
                    />
                  )}
                  {size}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 mb-16">
            <div className="flex items-center bg-slate-50 rounded-[2rem] p-2 h-[72px] border border-slate-100">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-14 h-14 flex items-center justify-center hover:bg-white rounded-2xl transition-all active:scale-90 text-slate-400 hover:text-slate-900"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="w-12 text-center font-black text-xl text-slate-900">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-14 h-14 flex items-center justify-center hover:bg-white rounded-2xl transition-all active:scale-90 text-slate-400 hover:text-slate-900"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="flex-1 h-[72px] bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-5 hover:bg-black transition-all shadow-2xl shadow-slate-200 active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-accent transition-colors">
                <ShoppingBag className="w-4 h-4" />
              </div>
              Adicionar ao Carrinho
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-12 border-t border-slate-100">
            {[
              { icon: Truck, label: 'Frete', sub: 'Grátis express' },
              { icon: RefreshCcw, label: 'Troca', sub: '30 dias grátis' },
              { icon: ShieldCheck, label: 'Garantia', sub: 'Original PASS' }
            ].map((prop, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3 group translate-y-0 hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <prop.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-900">{prop.label}</h4>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap mt-1">{prop.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
          
          <motion.div variants={itemVariants} className="mt-16 pt-8 text-center sm:text-left">
              <Link to={`/avaliar/${product.id}`} className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-all hover:tracking-[0.4em] duration-300">
                <Sparkles className="w-4 h-4 text-accent" /> Avaliar Produto
              </Link>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
