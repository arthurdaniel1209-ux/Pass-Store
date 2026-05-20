import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, Tag, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity } = useAppContext();
  const navigate = useNavigate();
  
  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const freight = subtotal > 300 ? 0 : 25;
  const total = subtotal + freight;

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="text-center py-48 bg-white border border-neutral-100 rounded-[3.5rem] shadow-sm">
          <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-10 h-10 text-neutral-300" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-4 italic">Seu carrinho está vazio.</h1>
          <p className="text-neutral-400 font-medium mb-10 max-w-sm mx-auto">
            Explore nossas coleções e adicione suas peças favoritas para vê-las aqui.
          </p>
          <Link 
            to="/produtos" 
            className="inline-flex items-center gap-4 bg-black text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all shadow-xl"
          >
            Começar a Comprar
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">Seu Carrinho</h1>
            <span className="font-mono text-neutral-400 font-bold uppercase tracking-widest text-xs">{cart.length} Itens</span>
          </div>

          <div className="space-y-8">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div 
                  key={`${item.product.id}-${item.size}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-6 pb-8 border-b border-neutral-100 group"
                >
                  <div className="w-32 h-40 bg-neutral-100 rounded-3xl overflow-hidden relative flex-shrink-0">
                    <img src={item.product.images[0]?.url || null} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-black tracking-tight mb-1">{item.product.name}</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Tamanho: <span className="text-black">{item.size}</span></span>
                        <div className="w-[1px] h-3 bg-neutral-200"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Coleção: <span className="text-black">{item.product.collection}</span></span>
                      </div>
                      <div className="mt-4 font-mono font-bold text-lg">R$ {item.product.price.toFixed(2)}</div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center bg-neutral-100 rounded-2xl p-1.5">
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center font-mono font-black">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        className="w-12 h-12 flex items-center justify-center text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-12">
            <Link to="/produtos" className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-neutral-400 hover:text-black transition-colors group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Continuar Comprando
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white border border-neutral-100 rounded-[3rem] p-10 sticky top-24 shadow-xl shadow-neutral-100">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 italic">Resumo</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between font-medium">
                <span className="text-neutral-500 text-sm">Subtotal</span>
                <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-neutral-500 text-sm">Frete</span>
                <span className="font-mono">{freight === 0 ? 'Grátis' : `R$ ${freight.toFixed(2)}`}</span>
              </div>
              <div className="pt-4 border-t border-dashed border-neutral-200 flex justify-between items-end">
                <span className="text-[10px] uppercase font-black tracking-widest">Total</span>
                <span className="text-3xl font-black tracking-tighter italic leading-none">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                <input 
                  type="text" 
                  placeholder="Cupom de desconto" 
                  className="w-full bg-neutral-50 border border-transparent focus:border-black rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-sm font-medium"
                />
              </div>
              <button className="w-full bg-neutral-100 text-[10px] font-black uppercase tracking-widest py-4 rounded-xl hover:bg-neutral-200 transition-colors">
                Aplicar Cupom
              </button>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-black text-white rounded-2xl py-6 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-neutral-800 transition-all shadow-xl active:scale-95 group"
            >
              Finalizar Pedido
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="mt-8 text-center text-[10px] text-neutral-400 font-medium uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed">
              Dúvidas sobre o pedido? Fale com nosso suporte.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
