import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import GradientBlinds from '../components/GradientBlinds';
import { categories } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, ChevronDown, Grid, List as ListIcon, SlidersHorizontal, Package, Tag, FilterX, Star, ArrowRight, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

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
        className="flex flex-col md:flex-row items-end justify-between gap-10 mb-20 border-b border-slate-100 pb-16"
      >
        <div className="flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 shadow-2xl shadow-slate-200 flex items-center justify-center text-white italic font-black text-lg">P</div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 italic">Pass Archiv Collection</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic leading-[0.85] font-display text-slate-900 [text-shadow:_1px_1px_0px_#cbd5e1,_2px_2px_0px_#94a3b8,_3px_3px_8px_rgba(15,23,42,0.15)]"
          >
            Drops
          </motion.h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-8 h-[1.5px] bg-accent"></span>
            Curated selection of {filteredProducts.length} pieces
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-4 border rounded-3xl py-5 px-10 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-slate-100 relative group active:scale-95",
              isFilterOpen ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-100 text-slate-900 hover:border-slate-900"
            )}
          >
            <SlidersHorizontal className={cn("w-4 h-4 transition-transform", isFilterOpen && "rotate-180")} /> 
            Configurar Filtros
            {!isFilterOpen && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping opacity-20"></div>
            )}
          </button>
          
          <div className="relative flex-1 md:flex-none">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-64 appearance-none bg-slate-50 border border-transparent rounded-3xl py-5 px-10 pr-14 text-[10px] font-black uppercase tracking-[0.2em] outline-none shadow-sm cursor-pointer focus:bg-white focus:border-slate-900 focus:ring-[12px] focus:ring-slate-900/5 transition-all text-slate-900"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Most Desired</option>
              <option value="price-low">Price: Ascending</option>
              <option value="price-high">Price: Descending</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
          </div>
        </div>
      </motion.div>

      {/* Filters Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 80 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-white/50 backdrop-blur-3xl rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-100/50 p-10 md:p-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-4 text-slate-900">
                  <div className="w-2 h-2 rounded-full bg-accent"></div> CATEGORIAS
                </h3>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('category');
                      setSearchParams(params);
                    }}
                    className={cn(
                      "group flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all text-left",
                      !activeCategory ? "bg-slate-900 text-white translate-x-2" : "text-slate-400 hover:text-slate-900 hover:bg-white"
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
                        "group flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all text-left",
                        activeCategory === cat.id ? "bg-slate-900 text-white translate-x-2" : "text-slate-400 hover:text-slate-900 hover:bg-white"
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
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-4 text-slate-900">
                  <div className="w-2 h-2 rounded-full bg-accent"></div> COLEÇÕES
                </h3>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.delete('collection');
                      setSearchParams(params);
                    }}
                    className={cn(
                      "group flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all text-left",
                      !activeCollection ? "bg-slate-900 text-white translate-x-2" : "text-slate-400 hover:text-slate-900 hover:bg-white"
                    )}
                  >
                    <span>Drop archive</span>
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
                        "group flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all text-left",
                        activeCollection === col ? "bg-slate-900 text-white translate-x-2" : "text-slate-400 hover:text-slate-900 hover:bg-white"
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
                className="flex flex-col justify-end gap-6"
              >
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose mb-6">Explore o design minimalista com curadoria exclusiva para membros premium.</p>
                  <button 
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] bg-white border border-slate-200 text-slate-900 py-6 rounded-2xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95"
                  >
                    <FilterX className="w-4 h-4" /> Resetar Arquiv
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24"
          >
            {filteredProducts.map((product) => (
              <motion.div 
                key={product.id} 
                layout
                variants={itemVariants}
                className="group active:scale-[0.98] transition-transform"
              >
                <Link to={`/produtos/${product.id}`} className="block h-full flex flex-col">
                  {/* Subtle pulsing background effect under the card if it's a drop */}
                  <div className={cn(
                    "relative aspect-[3/4] bg-white rounded-[3.5rem] overflow-hidden mb-10 border transition-all duration-700 ease-[0.16, 1, 0.3, 1] group-hover:-translate-y-4",
                    product.is_drop 
                      ? "border-violet-500/50 shadow-[0_20px_50px_rgba(82,39,255,0.15)] group-hover:shadow-[0_50px_100px_-20px_rgba(168,85,247,0.35)] ring-2 ring-violet-500/20 group-hover:border-pink-400 group-hover:ring-pink-500/30" 
                      : "border-slate-100 shadow-2xl shadow-slate-200/50 group-hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)]"
                  )}>
                    {product.is_drop && (
                      <div className="absolute inset-0 z-0 overflow-hidden rounded-[3.5rem] opacity-30 group-hover:opacity-50 transition-opacity duration-700">
                        <GradientBlinds
                          gradientColors={["#FF9FFC", "#5227FF"]}
                          angle={0}
                          noise={0.3}
                          blindCount={16}
                          blindMinWidth={60}
                          mouseDampening={0.15}
                          mirrorGradient
                          spotlightRadius={0.5}
                          spotlightSoftness={1}
                          spotlightOpacity={1}
                          distortAmount={6}
                          shineDirection="left"
                        />
                      </div>
                    )}
                    <img 
                      src={product.images[0]?.url || null} 
                      alt={product.name} 
                      className={cn(
                        "w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out pointer-events-none relative z-10",
                        product.is_drop && "mix-blend-multiply opacity-90 group-hover:opacity-20 transition-all duration-700"
                      )}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none z-20">
                      {product.is_drop ? (
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(82,39,255,0.4)] backdrop-blur-md animate-pulse">
                          <Zap className="w-3 h-3 fill-current text-white shrink-0 animate-bounce" />
                          <span>DROP EXCLUSIVO</span>
                        </div>
                      ) : null}
                    </div>
                    {/* Unique overlay for Drop items */}
                    <div className={cn(
                      "absolute inset-0 transition-opacity duration-700 pointer-events-none z-20",
                      product.is_drop 
                        ? "bg-gradient-to-t from-violet-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100"
                        : "bg-slate-900/20 opacity-0 group-hover:opacity-100"
                    )}></div>
                  </div>
                  <div className="px-4">
                    <div className="flex items-center gap-3 mb-4">
                      {product.is_drop ? (
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#5227FF] flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-current text-[#5227FF]" />
                          {product.collection || 'Drop'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">{product.collection}</span>
                      )}
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 text-slate-900 fill-current opacity-20 group-hover:opacity-100 transition-opacity" />)}
                      </div>
                    </div>
                    <h3 className={cn(
                      "text-2xl font-black tracking-tighter transition-colors duration-300 leading-[0.9] uppercase font-display italic text-slate-900 mb-6 max-w-[200px]",
                      product.is_drop ? "group-hover:text-[#5227FF]" : "group-hover:text-accent"
                    )}>
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                      <span className="text-2xl font-black tracking-tighter text-slate-900">R$ {product.price.toFixed(2)}</span>
                      <div className={cn(
                        "w-12 h-12 rounded-2xl bg-white border flex items-center justify-center transition-all duration-500 group-hover:text-white group-hover:rotate-12",
                        product.is_drop
                          ? "border-violet-100 text-violet-500 group-hover:bg-[#5227FF] group-hover:border-[#5227FF]"
                          : "border-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900"
                      )}>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
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
