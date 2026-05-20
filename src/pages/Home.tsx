import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { ArrowRight, Star, TrendingUp, Sparkles, Package, Instagram } from 'lucide-react';
import { cn } from '../lib/utils';
import ScrollReveal from '../components/ScrollReveal';
import GradientBlinds from '../components/GradientBlinds';

const ProfileCard = lazy(() => import('../components/ProfileCard'));
const LineWaves = lazy(() => import('../components/LineWaves'));

export default function Home() {
  const { products, ceoConfig } = useAppContext();
  
  // Use config values or fallbacks
  const ceo = ceoConfig || {
    name: "Alex Alv Jr.",
    title: "CEO & Founder da PASS",
    handle: "alexalvjr",
    status: "Visionaire",
    description: "Sua visão transcende o vestuário, mergulhando na intersecção entre arte, subcultura e o futuro do streetwear global.",
    avatarUrl: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format",
    behindGlowColor: "rgba(254, 58, 74, 0.3)",
    innerGradient: "linear-gradient(135deg, rgba(8, 8, 8, 0.95) 0%, rgba(20, 20, 20, 0.8) 100%)"
  };

  const dropsInFocus = products.filter(p => p.is_drop);
  const newLançamentos = products.slice(0, 3);

  // Group active drops by collection
  const dropCollectionsWithProducts = React.useMemo(() => {
    const groups: { [key: string]: typeof products } = {};
    products.forEach(p => {
      if (p.is_drop && p.collection) {
        if (!groups[p.collection]) {
          groups[p.collection] = [];
        }
        groups[p.collection].push(p);
      }
    });
    return groups;
  }, [products]);

  // Fallback: If no collections are marked as drops in the database, 
  // we create a virtual "Pass Sports" drop as an example containing registered products
  const activeDrops = React.useMemo(() => {
    const groups = { ...dropCollectionsWithProducts };
    
    if (Object.keys(groups).length === 0 && products.length > 0) {
      groups["Pass Sports"] = products.slice(1, 4).map(p => ({
        ...p,
        is_drop: true,
        collection: "Pass Sports"
      }));
    }
    return groups;
  }, [dropCollectionsWithProducts, products]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <Layout>
      {/* Stats/Highlight Bar */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mb-24 grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {[
          { label: 'Entrega Rápida', desc: 'Em todo o Brasil', icon: TrendingUp },
          { label: 'Qualidade Premium', desc: 'Tecidos Importados', icon: Sparkles },
          { label: 'Drops Exclusivos', desc: 'Edições Limitadas', icon: Package },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className="flex items-center gap-5 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm shadow-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-500">
              <stat.icon className="w-6 h-6 transition-transform group-hover:scale-110 group-hover:rotate-6" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-tight text-slate-900">{stat.label}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{stat.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.section>



      {/* New Releases Section */}
      <section className="mb-24">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter font-display italic leading-none">Novidades</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Recém chegados</p>
          </div>
          <Link to="/produtos" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all">
            Explorar <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all"><ArrowRight className="w-3 h-3" /></div>
          </Link>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-14"
        >
          {newLançamentos.map((product) => (
            <motion.div key={product.id} variants={itemVariants} className="group flex flex-col h-full active:scale-[0.98] transition-transform">
              <Link to={`/produtos/${product.id}`} className="flex-1 flex flex-col">
                <div className="relative aspect-[3/4] bg-white rounded-[3rem] overflow-hidden mb-8 border border-slate-100 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 ease-[0.16, 1, 0.3, 1]">
                  <img 
                    src={product.images[0]?.url || null} 
                    alt={product.name} 
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.2s] ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {product.is_drop && (
                      <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md">
                        Drop Limitado
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-5 transition-opacity duration-700"></div>
                </div>
                <div className="px-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{product.collection}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 text-yellow-400 fill-current opacity-40 group-hover:opacity-100 transition-opacity" />)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase font-display italic text-slate-900 mb-4 group-hover:text-accent transition-colors duration-300 leading-none">{product.name}</h3>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-black tracking-tighter text-slate-900">R$ {product.price.toFixed(2)}</span>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 group-hover:rotate-12 transition-all duration-500">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Active Drops Section */}
      {(Object.entries(activeDrops) as [string, typeof products][]).map(([dropName, dropProducts], dropIndex) => (
        <motion.section 
          key={dropName}
          id={`active-drop-${dropName.toLowerCase().replace(/\s+/g, '-')}`}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24 px-0 sm:px-2"
        >
          <div className="bg-slate-950 rounded-[3rem] sm:rounded-[4rem] p-8 md:p-16 lg:p-20 overflow-hidden relative shadow-[0_50px_100px_-20px_rgba(15,23,42,0.4)] border border-slate-900">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-[0.12] pointer-events-none z-0 overflow-hidden">
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
                distortAmount={0}
                shineDirection="left"
              />
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.02] pointer-events-none">
              <TrendingUp className="w-full h-full text-white" />
            </div>
            
            <div className="relative z-10">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-900 pb-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FE3A4A]"></span>
                    </span>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#FE3A4A]">
                      Drop Ativo • Edição Limitada
                    </span>
                  </div>
                  <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-none font-display uppercase italic">
                    {dropName}
                  </h2>
                  <p className="text-slate-400 text-sm max-w-lg font-medium">
                    Garanta as peças exclusivas do último lançamento. Estoque extremamente limitado, sem previsão de reposição.
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="px-5 py-2.5 bg-slate-900 rounded-2xl border border-slate-800">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center">Itens Cadastrados</p>
                    <p className="text-xl font-black text-white text-center mt-1">{dropProducts.length}</p>
                  </div>
                  <Link 
                    to={`/produtos?collection=${encodeURIComponent(dropName)}`}
                    id={`view-drop-btn-${dropName.toLowerCase().replace(/\s+/g, '-')}`}
                    className="h-14 px-8 bg-accent hover:bg-white text-white hover:text-slate-950 rounded-[1.5rem] font-black uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-accent/10"
                  >
                    Ver Drop Completo
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Registered Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {dropProducts.map((product) => (
                  <motion.div 
                    key={product.id}
                    id={`drop-product-card-${product.id}`}
                    whileHover={{ y: -6 }}
                    className="bg-slate-900/40 border border-slate-900 rounded-[2.5rem] p-5 hover:border-slate-800 hover:bg-slate-900/80 transition-all duration-300 flex flex-col justify-between group h-full"
                  >
                    <Link to={`/produtos/${product.id}`} className="space-y-4 flex flex-col h-full justify-between">
                      {/* Product Image */}
                      <div className="relative aspect-[3/4] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/80">
                        {product.images?.[0]?.url ? (
                          <img 
                            src={product.images[0].url} 
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Sem Foto</span>
                          </div>
                        )}
                        <span className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md text-[#FE3A4A] border border-[#FE3A4A]/20 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest">
                          R$ {product.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Info & Buy Button */}
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-accent transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                            {product.sizes ? `Tamanhos: ${product.sizes.join(', ')}` : 'Tamanho Único'}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                            Comprar Agora <ArrowRight className="w-3 h-3 text-accent" />
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-accent/80">
                            Disponível
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      ))}

      {/* CEO Section: Alex Alv Jr */}
      <section className="mb-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-32">
          <div className="flex-1 space-y-10 order-2 md:order-1">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-3 px-5 py-2 bg-slate-900 text-white rounded-full"
                >
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{ceo.status}</span>
                </motion.div>
                
                {ceo.title && (
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#FE3A4A] tracking-[0.2em]">{ceo.title}</span>
                )}
              </div>
              
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] italic group">
                {ceo.name.split(' ')[0] || ''} 
                {ceo.name.split(' ').length > 1 && (
                  <>
                    <br />
                    <span className="group-hover:text-accent transition-colors duration-500">
                      {ceo.name.split(' ').slice(1).join(' ')}
                    </span>
                  </>
                )}
              </h2>
              
              <p className="text-slate-500 text-xl max-w-lg leading-relaxed font-medium">
                {ceo.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <a 
                href={`https://www.instagram.com/${ceo.handle}/`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-4 px-10 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all duration-500 shadow-2xl shadow-slate-300"
              >
                <Instagram className="w-5 h-5 text-accent" />
                Seguir @{ceo.handle}
              </a>
              
              <div className="flex items-center gap-6">
                <div className="h-12 w-px bg-slate-100 hidden sm:block" />
                <div>
                  <p className="text-2xl font-black italic tracking-tighter">Impacto</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Criativo / Global</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-[600px] order-1 md:order-2 relative group mt-12 md:mt-0">
            {/* Background Waves Integration */}
            <div className="absolute inset-0 -z-10 scale-150 opacity-50 pointer-events-none overflow-hidden">
              <Suspense fallback={null}>
                <LineWaves
                  speed={0.3}
                  innerLineCount={32}
                  outerLineCount={36}
                  warpIntensity={1}
                  rotation={-45}
                  edgeFadeWidth={0}
                  colorCycleSpeed={1}
                  brightness={0.2}
                  color1="#ffffff"
                  color2="#ffffff"
                  color3="#ffffff"
                  enableMouseInteraction
                  mouseInfluence={2}
                />
              </Suspense>
            </div>

            <Suspense fallback={<div className="aspect-[3/4] w-full bg-slate-100 rounded-[3rem] animate-pulse" />}>
               <ProfileCard 
                name={ceo.name}
                title={ceo.title}
                handle={ceo.handle}
                status={ceo.status}
                contactText="Ver no Instagram"
                avatarUrl={ceo.avatarUrl}
                showUserInfo={true}
                enableTilt={true}
                innerGradient={ceo.innerGradient}
                behindGlowColor={ceo.behindGlowColor}
                onContactClick={() => window.open(`https://www.instagram.com/${ceo.handle}/`, '_blank')}
              />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Scroll Reveal Teaser Section */}
      <section className="mb-32 px-4 py-32 bg-slate-50/50 rounded-[4rem] border border-slate-100 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal 
            containerClassName="mb-12"
            textClassName="text-4xl md:text-7xl font-black uppercase tracking-tighter font-display italic leading-[0.9]"
            baseRotation={-10}
            blurStrength={10}
          >
            A moda de rua evolui. O estilo permanece eterno. Descubra a essência do streetwear premium conosco.
          </ScrollReveal>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-slate-400 text-sm font-medium max-w-lg">
              Nossas peças são desenhadas para quem busca autenticidade em cada detalhe. 
              Feito por entusiastas, para entusiastas.
            </p>
            <Link 
              to="/produtos" 
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-colors shadow-xl shadow-slate-200"
            >
              Coleção Completa
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
