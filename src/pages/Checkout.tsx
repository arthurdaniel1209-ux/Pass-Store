import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { CreditCard, Wallet, QrCode, Truck, MapPin, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Order } from '../types';
import { GlassButton } from '../components/ui/GlassButton';
import { ShipButton } from '../components/ui/ShipButton';
import { CheckoutCreditCard, CardData } from '../components/CheckoutCreditCard';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function CheckoutForm({ total, shippingAddress, onPaymentSuccess }: { 
  total: number, 
  shippingAddress: any,
  onPaymentSuccess: (method: string) => void 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Ocorreu um erro ao processar o pagamento.");
      setProcessing(false);
      return;
    }

    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: shippingAddress.items, shippingAddress: shippingAddress.info }),
      });

      const { clientSecret } = await response.json();

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              address: {
                line1: shippingAddress.info.street,
                city: shippingAddress.info.city,
                postal_code: shippingAddress.info.zipCode,
                country: 'BR',
              }
            }
          }
        },
        redirect: 'if_required'
      });

      if (confirmError) {
        setError(confirmError.message || "Erro na confirmação do pagamento.");
      } else {
        onPaymentSuccess('stripe');
      }
    } catch (err: any) {
      setError("Falha ao conectar com o servidor.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PaymentElement />
      {error && <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold uppercase tracking-widest">{error}</div>}
      <button 
        type="submit"
        disabled={processing || !stripe || !elements}
        className={cn(
          "w-full h-[80px] bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 hover:bg-neutral-800 transition-all shadow-2xl active:scale-95 disabled:opacity-50",
          processing && "animate-pulse"
        )}
      >
        {processing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
        {processing ? 'Processando...' : `Pagar R$ ${total.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { cart, clearCart, addOrder, user } = useAppContext();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [triggerShipAnim, setTriggerShipAnim] = useState(false);
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    holder: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    isValid: false
  });

  // Form states
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const freight = subtotal > 300 ? 0 : 25;
  const total = subtotal + freight;

  const handlePaymentSuccess = () => {
    const newOrder: Order = {
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      user_id: user?.id || 'guest',
      items: [...cart],
      total,
      status: 'pending',
      address: { 
        street: `${address}, ${addressNumber}`, 
        city,
        state,
        zipCode 
      },
      paymentMethod,
      created_at: new Date().toISOString(),
    };
    
    addOrder(newOrder);
    clearCart();
    setIsSuccess(true);
  };

  const handleSimulatedConfirm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!address || !zipCode || !city) return;
    if (paymentMethod === 'card' && !cardData.isValid) return;
    
    setIsProcessing(true);
    setTriggerShipAnim(true);
    // Simulação de processamento sincronizada com a animação de despacho do caminhão (9.5 segundos)
    await new Promise(resolve => setTimeout(resolve, 9500));
    setIsProcessing(false);
    setTriggerShipAnim(false);
    handlePaymentSuccess();
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="dark relative overflow-hidden bg-[#0f0f13] text-white rounded-[2.5rem] sm:rounded-[3.5rem] py-32 px-8 text-center border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes driftBlob {
              0% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(30px, -40px) scale(1.15); }
              100% { transform: translate(-20px, 20px) scale(0.95); }
            }
            .animate-drift-blob {
              animation: driftBlob 16s ease-in-out infinite alternate;
            }
          `}} />
          
          {/* Background Blobs */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[2.5rem] sm:rounded-[3.5rem]">
            <div className="absolute w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[80px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-drift-blob" />
          </div>

          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="relative z-10 w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-10 shadow-lg shadow-green-500/20"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="relative z-10 text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-6 leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-green-400">
            Pedido Confirmado
          </h1>
          <p className="relative z-10 text-slate-400 font-bold uppercase tracking-wider mb-10 max-w-sm px-6 text-xs leading-relaxed">
            Obrigado pela sua compra! Seu pedido foi recebido e está sendo processado com todo cuidado.
          </p>
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 px-6 w-full max-w-md">
            <button 
              onClick={() => navigate('/pedidos')}
              className="flex-1 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
            >
              Ver Meus Pedidos
            </button>
            <button 
              onClick={() => navigate('/home')}
              className="flex-1 py-5 bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-purple-500/10"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dark bg-[#0f0f13] text-white border border-white/10 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-12 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes driftBlob {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(30px, -40px) scale(1.15); }
            100% { transform: translate(-20px, 20px) scale(0.95); }
          }
          .animate-drift-blob {
            animation: driftBlob 16s ease-in-out infinite alternate;
          }
        `}} />
        
        {/* Background Blobs for the layout */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[2.5rem] sm:rounded-[3.5rem]">
          <div className="absolute w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[90px] -top-[100px] -left-[100px] animate-drift-blob" />
          <div className="absolute w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] -bottom-[80px] -right-[80px] animate-drift-blob" style={{ animationDelay: '-4s' }} />
          <div className="absolute w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[70px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-drift-blob" style={{ animationDelay: '-8s' }} />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-purple-400">
              Finalizar Compra
            </h1>
            
            <div className="space-y-12">
              {/* Delivery Info */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-400 font-black italic">01.</div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-white">Endereço de Entrega</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 grid grid-cols-4 gap-6">
                    <div className="col-span-3 space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-[#a855f7] ml-1">Rua / Logradouro</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                        <input 
                          type="text" 
                          required
                          placeholder="Nome da rua"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 focus:bg-[#0f0f13]/80 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-sm font-medium text-white placeholder-white/20 focus:ring-4 focus:ring-purple-500/10"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-[#a855f7] ml-1">Número</label>
                      <input 
                        type="text" 
                        required
                        placeholder="123"
                        value={addressNumber}
                        onChange={(e) => setAddressNumber(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 focus:bg-[#0f0f13]/80 rounded-2xl py-4 px-6 outline-none transition-all text-sm font-medium text-white placeholder-white/20 focus:ring-4 focus:ring-purple-500/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-[#a855f7] ml-1">CEP</label>
                    <input 
                      type="text" 
                      required
                      placeholder="00000-000"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 focus:bg-[#0f0f13]/80 rounded-2xl py-4 px-6 outline-none transition-all text-sm font-medium text-white placeholder-white/20 focus:ring-4 focus:ring-purple-500/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-[#a855f7] ml-1">Cidade</label>
                      <input 
                        type="text" 
                        required
                        placeholder="São Paulo"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 focus:bg-[#0f0f13]/80 rounded-2xl py-4 px-6 outline-none transition-all text-sm font-medium text-white placeholder-white/20 focus:ring-4 focus:ring-purple-500/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-[#a855f7] ml-1">UF</label>
                      <input 
                        type="text" 
                        required
                        placeholder="SP"
                        maxLength={2}
                        value={state}
                        onChange={(e) => setState(e.target.value.toUpperCase())}
                        className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 focus:bg-[#0f0f13]/80 rounded-2xl py-4 px-6 outline-none transition-all text-sm font-medium text-white placeholder-white/20 focus:ring-4 focus:ring-purple-500/10"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-400 font-black italic">02.</div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-white">Forma de Pagamento</h2>
                </div>

                <div className="space-y-4">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      "w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all backdrop-blur-md",
                      paymentMethod === 'card' 
                        ? "border-purple-500 bg-purple-500/10 text-white shadow-[0_0_30px_rgba(168,85,247,0.15)]" 
                        : "border-white/5 bg-white/5 text-slate-400 hover:border-white/10 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-2xl transition-colors", 
                        paymentMethod === 'card' ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400"
                      )}>
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-black uppercase tracking-tight text-white">Cartão de Crédito</h4>
                        <p className="text-[10px] text-[#a855f7] font-bold uppercase tracking-widest">Até 12x sem juros</p>
                      </div>
                    </div>
                    <div className={cn("w-6 h-6 rounded-full border-2 p-1", paymentMethod === 'card' ? "border-purple-500 bg-purple-500" : "border-white/10")}>
                      <div className="w-full h-full rounded-full bg-white scale-0 transition-transform" style={{ transform: paymentMethod === 'card' ? 'scale(1)' : 'scale(0)' }}></div>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={cn(
                      "w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all backdrop-blur-md",
                      paymentMethod === 'pix' 
                        ? "border-purple-500 bg-purple-500/10 text-white shadow-[0_0_30px_rgba(168,85,247,0.15)]" 
                        : "border-white/5 bg-white/5 text-slate-400 hover:border-white/10 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-2xl transition-colors", 
                        paymentMethod === 'pix' ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400"
                      )}>
                        <QrCode className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-black uppercase tracking-tight text-white">PIX</h4>
                        <p className="text-[10px] text-[#a855f7] font-bold uppercase tracking-widest">Aprovação imediata</p>
                      </div>
                    </div>
                    <div className={cn("w-6 h-6 rounded-full border-2 p-1", paymentMethod === 'pix' ? "border-purple-500 bg-purple-500" : "border-white/10")}>
                      <div className="w-full h-full rounded-full bg-white scale-0 transition-transform" style={{ transform: paymentMethod === 'pix' ? 'scale(1)' : 'scale(0)' }}></div>
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('boleto')}
                    className={cn(
                      "w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all backdrop-blur-md",
                      paymentMethod === 'boleto' 
                        ? "border-purple-500 bg-purple-500/10 text-white shadow-[0_0_30px_rgba(168,85,247,0.15)]" 
                        : "border-white/5 bg-white/5 text-slate-400 hover:border-white/10 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-2xl transition-colors", 
                        paymentMethod === 'boleto' ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400"
                      )}>
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-black uppercase tracking-tight text-white">Boleto Bancário</h4>
                        <p className="text-[10px] text-[#a855f7] font-bold uppercase tracking-widest">Vencimento em 3 dias</p>
                      </div>
                    </div>
                    <div className={cn("w-6 h-6 rounded-full border-2 p-1", paymentMethod === 'boleto' ? "border-purple-500 bg-purple-500" : "border-white/10")}>
                      <div className="w-full h-full rounded-full bg-white scale-0 transition-transform" style={{ transform: paymentMethod === 'boleto' ? 'scale(1)' : 'scale(0)' }}></div>
                    </div>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <CheckoutCreditCard onChange={setCardData} />
                )}

                {paymentMethod === 'pix' && (
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center space-y-6 relative overflow-hidden backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
                    <div className="w-48 h-48 mx-auto bg-white p-4 rounded-2xl relative shadow-[0_0_30px_rgba(168,85,247,0.1)] flex items-center justify-center select-none">
                      <div className="w-full h-full relative flex flex-col justify-between p-1">
                        <div className="flex justify-between">
                          <div className="w-6 h-6 border-t-4 border-l-4 border-black" />
                          <div className="w-6 h-6 border-t-4 border-r-4 border-black" />
                        </div>
                        <div className="mx-auto text-black font-mono text-[9px] uppercase tracking-widest font-black leading-none text-center">
                          PASS PIX<br/>ONLINE
                        </div>
                        <div className="flex justify-between">
                          <div className="w-6 h-6 border-b-4 border-l-4 border-black" />
                          <div className="w-6 h-6 border-b-4 border-r-4 border-black" />
                        </div>
                        <div className="absolute left-0 right-0 h-0.5 bg-purple-500 top-1/2 -translate-y-1/2 animate-bounce" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-white">Escaneie o QR Code</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Aprovação imediata</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-4 rounded-xl max-w-sm mx-auto">
                      <input 
                        readOnly
                        type="text" 
                        value="00020126580014br.gov.bcb.pix0136e4f3a9709..." 
                        className="bg-transparent border-0 py-0 px-2 text-xs font-mono truncate select-all focus:ring-0 text-slate-300 w-full"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136e4f3a9709...");
                          alert("Código copiado!");
                        }}
                        className="text-[10px] font-black uppercase tracking-wider text-purple-400 shrink-0 hover:text-purple-300 transition-colors"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === 'boleto' && (
                  <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center space-y-6 relative overflow-hidden backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
                    <div className="w-full max-w-sm h-16 mx-auto bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between gap-1 overflow-hidden select-none">
                      {[3, 1, 4, 1, 2, 6, 2, 5, 2, 3, 5, 2, 4, 2, 3, 2, 2, 3, 4, 1, 3, 2, 1, 3, 2, 4, 3, 1].map((w, idx) => (
                        <div 
                          key={idx} 
                          className="bg-slate-300 h-full rounded-sm opacity-60" 
                          style={{ width: `${w * 1.5}px` }} 
                        />
                      ))}
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-white">Código de Barras</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Compensação em até 48 horas úteis</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-4 rounded-xl max-w-sm mx-auto">
                      <input 
                        readOnly
                        type="text" 
                        value="34191.79001 01043.513184 91020.150008 7 97320000025000" 
                        className="bg-transparent border-0 py-0 px-2 text-xs font-mono truncate select-all focus:ring-0 text-slate-300 w-full"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("34191.79001 01043.513184 91020.150008 7 97320000025000");
                          alert("Linha digitável copiada!");
                        }}
                        className="text-[10px] font-black uppercase tracking-wider text-purple-400 shrink-0 hover:text-purple-300 transition-colors"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}

                {address && city && zipCode ? (
                  <ShipButton 
                    onClick={() => handleSimulatedConfirm()}
                    isProcessing={isProcessing}
                    label={paymentMethod === 'card' && !cardData.isValid ? 'Preencha os dados do cartão' : `Confirmar Compra (R$ ${total.toFixed(2)})`}
                    disabled={isProcessing || (paymentMethod === 'card' && !cardData.isValid)}
                    triggerAnimation={triggerShipAnim}
                  />
                ) : (
                  <div className="bg-white/5 p-12 rounded-[2.5rem] border border-dashed border-white/10 text-center relative overflow-hidden backdrop-blur-md">
                    <MapPin className="w-8 h-8 text-slate-500 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Preencha o endereço para liberar o pagamento</p>
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="w-full max-w-[450px] mx-auto lg:mx-0">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-12 sticky top-24 shadow-2xl backdrop-blur-md overflow-hidden text-white">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                Resumo do Pedido
              </h3>
              
              <div className="max-h-[300px] overflow-y-auto pr-2 mb-8 space-y-6 no-scrollbar">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                    <div className="w-20 h-24 bg-white/5 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                      <img src={item.product.images[0]?.url || ''} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black truncate uppercase tracking-tight text-white">{item.product.name}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{item.size} × {item.quantity}</p>
                      <p className="text-xs font-mono font-bold mt-1 text-purple-400">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6 pt-8 border-t border-white/10">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-400 uppercase tracking-widest text-[10px] font-black">Subtotal</span>
                  <span className="font-mono text-white">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400 uppercase tracking-widest text-[10px] font-black">Frete</span>
                  </div>
                  <span className="font-mono text-white">{freight === 0 ? 'Grátis' : `R$ ${freight.toFixed(2)}`}</span>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                  <span className="text-[10px] uppercase font-black tracking-widest italic translate-y-1 text-slate-400">Total Final</span>
                  <span className="text-4xl font-black tracking-tighter italic leading-none text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">Pagamento 100% Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
