import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { categories } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, ChevronDown, Grid, List as ListIcon, SlidersHorizontal, Package, Tag, FilterX } from 'lucide-react';
import { cn } from '../lib/utils';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const { products } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const activeCategory = searchParams.get('category');
  const activeCollection = searchParams.get('collection');
  const isDropOnly = searchParams.get('filter') === 'drop';

  const collections = useMemo(() => Array.from(new Set(products.map(p => p.collection).filter(Boolean))), []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory) {
      result = result.filter(p => p.category_id === activeCategory);
    }

    if (activeCollection) {
      result = result.filter(p => p.collection === activeCollection);
    }

    if (isDropOnly) {
      result = result.filter(p => p.is_drop);
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (a.is_drop ? -1 : 1));
        break;
    }

    return result;
  }, [activeCategory, activeCollection, isDropOnly, sortBy]);

  const clearFilters = () => {
    setSearchParams({});
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
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-10 mb-10 md:mb-20 border-b border-slate-100 pb-8 md:pb-16"
      >
        <div className="flex flex-col gap-4 md:gap-6 w-full md:w-auto">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 sm:gap-4"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-900 shadow-2xl shadow-slate-200 flex items-center justify-center text-white italic font-black text-sm sm:text-lg">P</div>
            <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-slate-300 italic">Pass Collection</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-[0.85] font-display text-slate-900 [text-shadow:_1px_1px_0px_#cbd5e1,_2px_2px_0px_#94a3b8,_3px_3px_8px_rgba(15,23,42,0.15)]"
          >
            Drops
          </motion.h1>
          <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2 sm:gap-3">
            <span className="w-6 sm:w-8 h-[1.5px] bg-accent"></span>
            Curated selection of {filteredProducts.length} pieces
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full md:w-auto">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "w-full sm:w-auto flex-1 md:flex-none flex items-center justify-center gap-3 border rounded-2xl sm:rounded-3xl py-4 px-6 sm:py-5 sm:px-10 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-100 relative group active:scale-95",
              isFilterOpen ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-100 text-slate-900 hover:border-slate-900"
            )}
          >
            <SlidersHorizontal className={cn("w-3.5 h-3.5 transition-transform", isFilterOpen && "rotate-180")} /> 
            Configurar Filtros
            {!isFilterOpen && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full animate-ping opacity-20"></div>
            )}
          </button>
          
          <div className="relative w-full sm:w-auto flex-1 md:flex-none">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-64 appearance-none bg-slate-50 border border-transparent rounded-2xl sm:rounded-3xl py-4 px-6 sm:py-5 sm:px-10 pr-12 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] outline-none shadow-sm cursor-pointer focus:bg-white focus:border-slate-900 focus:ring-[12px] focus:ring-slate-900/5 transition-all text-slate-900"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Most Desired</option>
              <option value="price-low">Price: Ascending</option>
              <option value="price-high">Price: Descending</option>
            </select>
            <ChevronDown className="absolute right-5 sm:right-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
          </div>
        </div>
      </motion.div>

      {/* Filters Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 40 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-white/50 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-100/50 p-6 sm:p-10 md:p-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-20">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-4 sm:mb-6 md:mb-10 flex items-center gap-3 sm:gap-4 text-slate-900">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent"></div> CATEGORIAS
                </h3>
                <div className="flex flex-col gap-1.5">
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('category');
                      setSearchParams(params);
                    }}
                    className={cn(
                      "group flex items-center justify-between px-5 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all text-left",
                      !activeCategory ? "bg-slate-900 text-white translate-x-1.5" : "text-slate-400 hover:text-slate-900 hover:bg-white"
                    )}
                  >
                    <span>All Products</span>
                    {!activeCategory && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('category', cat.id);
                        setSearchParams(params);
                      }}
                      className={cn(
                        "group flex items-center justify-between px-5 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all text-left",
                        activeCategory === cat.id ? "bg-slate-900 text-white translate-x-1.5" : "text-slate-400 hover:text-slate-900 hover:bg-white"
                      )}
                    >
                      <span>{cat.name}</span>
                      {activeCategory === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-4 sm:mb-6 md:mb-10 flex items-center gap-3 sm:gap-4 text-slate-900">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent"></div> COLEÇÕES
                </h3>
                <div className="flex flex-col gap-1.5">
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('collection');
                      setSearchParams(params);
                    }}
                    className={cn(
                      "group flex items-center justify-between px-5 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all text-left",
                      !activeCollection ? "bg-slate-900 text-white translate-x-1.5" : "text-slate-400 hover:text-slate-900 hover:bg-white"
                    )}
                  >
                    <span>Todas as Coleções</span>
                    {!activeCollection && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                  </button>
                  {collections.map(col => (
                    <button 
                      key={col}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('collection', col!);
                        setSearchParams(params);
                      }}
                      className={cn(
                        "group flex items-center justify-between px-5 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all text-left",
                        activeCollection === col ? "bg-slate-900 text-white translate-x-1.5" : "text-slate-400 hover:text-slate-900 hover:bg-white"
                      )}
                    >
                      <span>{col}</span>
                      {activeCollection === col && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                    </button>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col justify-end gap-4 sm:gap-6"
              >
                <div className="p-6 sm:p-8 bg-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100">
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose mb-4 sm:mb-6">Explore o design minimalista com curadoria exclusiva para membros premium.</p>
                  <button 
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] bg-white border border-slate-200 text-slate-900 py-4 sm:py-6 rounded-xl sm:rounded-2xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95"
                  >
                    <FilterX className="w-3.5 h-3.5" /> Resetar Arquiv
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filteredProducts.length > 0 ? (
          <motion.div 
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 md:gap-x-12 md:gap-y-24"
          >
            {filteredProducts.map((product) => (
              <motion.div 
                key={product.id} 
                layout
                variants={itemVariants}
                className="max-w-md md:max-w-none mx-auto w-full"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-48 bg-white border border-slate-100 rounded-[5rem] shadow-2xl shadow-slate-100/50"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner group transition-transform hover:rotate-12">
              <Package className="w-10 h-10 text-slate-200 group-hover:text-slate-900 transition-colors" />
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 mb-6">Arquiv Vazio</h2>
            <p className="text-slate-400 uppercase tracking-[0.3em] text-[10px] font-black max-w-xs mx-auto leading-loose">Explore outras coleções ou ajuste seus filtros para encontrar peças exclusivas.</p>
            <button 
              onClick={clearFilters}
              className="mt-12 bg-slate-900 text-white px-12 py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-95 shadow-2xl shadow-slate-200"
            >
              Resetar Filtros
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
