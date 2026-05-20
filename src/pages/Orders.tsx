import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { ShoppingBag, ChevronRight, Package, Truck, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Orders() {
  const { orders } = useAppContext();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'processing': return <Package className="w-5 h-5" />;
      case 'shipped': return <Truck className="w-5 h-5" />;
      case 'delivered': return <CheckCircle2 className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'delivered': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Em Processamento';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 mb-12">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">Meus Pedidos</h1>
          <span className="font-mono text-neutral-400 font-bold uppercase tracking-widest text-xs">{orders.length} Histórico</span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white border border-neutral-100 rounded-[3rem]">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-6 h-6 text-neutral-300" />
            </div>
            <p className="text-neutral-400 uppercase tracking-widest text-xs font-black">Você ainda não realizou nenhum pedido.</p>
            <Link to="/produtos" className="mt-6 inline-block text-[10px] font-black uppercase tracking-widest hover:underline">Ir para a Loja</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 md:p-10 hover:shadow-xl hover:shadow-neutral-50 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">ID: {order.id}</span>
                    <h3 className="text-xl font-bold font-mono">Pedido em {new Date(order.created_at).toLocaleDateString()}</h3>
                  </div>
                  
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest",
                    getStatusColor(order.status)
                  )}>
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                  {order.items.map((item, idx) => (
                    <div key={`${order.id}-${idx}`} className="w-16 h-20 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-50">
                      <img src={item.product.images[0]?.url || null} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {order.items.length > 5 && (
                    <div className="w-16 h-20 bg-neutral-50 rounded-xl flex items-center justify-center text-[10px] font-black">
                      +{order.items.length - 5}
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-8 border-t border-neutral-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-neutral-400">Total</span>
                    <span className="text-2xl font-black italic">R$ {order.total.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex gap-4">
                    <button className="flex-1 md:flex-none border border-neutral-100 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-colors">
                      Detalhes
                    </button>
                    <button className="flex-1 md:flex-none bg-black text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
                      Comprar Novamente <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
