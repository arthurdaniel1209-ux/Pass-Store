import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { products } from '../data/mockData';
import { motion } from 'motion/react';
import { Star, ArrowRight, MessageSquare, Image as ImageIcon, ChevronLeft, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Review() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <Layout>
        <div className="text-center py-48">
          <h1 className="text-2xl font-black uppercase tracking-widest text-neutral-400">Produto não encontrado</h1>
          <Link to="/home" className="mt-6 inline-block text-[10px] font-black uppercase tracking-widest hover:underline">Voltar</Link>
        </div>
      </Layout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Por favor, selecione uma nota.');
      return;
    }
    // Simulate API call
    alert('Avaliação enviada com sucesso! Obrigado pelo seu feedback.');
    navigate(`/produtos/${id}`);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <Link to={`/produtos/${id}`} className="inline-flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-neutral-400 hover:text-black transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar ao Produto
          </Link>
        </div>

        <div className="bg-white border border-neutral-100 rounded-[3.5rem] p-10 md:p-16 shadow-xl shadow-neutral-100">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-32 h-40 bg-neutral-50 rounded-[2rem] overflow-hidden mb-8 shadow-lg">
              <img src={product.images[0]?.url || null} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase mb-2 italic">Avaliar {product.name}</h1>
            <p className="text-neutral-400 text-sm font-medium">Sua opinião é fundamental para a PASS.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Star Rating */}
            <div className="text-center">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6">Qual sua nota?</h3>
              <div className="flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      className={cn(
                        "w-10 h-10 transition-all",
                        (hoverRating || rating) >= star ? "text-black fill-current scale-110" : "text-neutral-100"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Deixe seu comentário
              </h3>
              <textarea 
                rows={5}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte-nos o que achou da peça, do tecido e do caimento..."
                className="w-full bg-neutral-50 border border-transparent focus:border-black rounded-3xl p-6 outline-none transition-all text-sm font-medium resize-none"
              />
            </div>

            {/* Photo Upload (Placeholder) */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Adicionar Fotos
              </h3>
              <div className="border-2 border-dashed border-neutral-100 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 hover:border-neutral-200 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-neutral-300" />
                </div>
                <p className="text-[10px] uppercase font-black tracking-widest text-neutral-400">Arraste fotos ou clique para enviar</p>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-black text-white rounded-[2rem] py-6 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-neutral-800 transition-all shadow-xl active:scale-95 group"
            >
              Enviar Avaliação
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
