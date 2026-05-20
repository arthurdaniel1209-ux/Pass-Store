import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { CreditCard, Wallet, QrCode, Truck, MapPin, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Order } from '../types';
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

  const handleSimulatedConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !zipCode || !city) return;
    
    setIsProcessing(true);
    // Simulação de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    handlePaymentSuccess();
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-48 text-center bg-white border border-neutral-100 rounded-[3.5rem] shadow-xl shadow-neutral-100">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-green-100"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-6 leading-none">Pedido Confirmado.</h1>
          <p className="text-neutral-500 font-medium mb-10 max-w-sm px-6">
            Obrigado pela sua compra! Seu pedido foi recebido e está sendo processado com todo cuidado.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 px-6 w-full max-w-md">
            <button 
              onClick={() => navigate('/pedidos')}
              className="flex-1 bg-black text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-100 active:scale-95"
            >
              Ver Meus Pedidos
            </button>
            <button 
              onClick={() => navigate('/home')}
              className="flex-1 bg-neutral-100 text-black px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none mb-12">Finalizar Compra</h1>
          
          <div className="space-y-12">
            {/* Delivery Info */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-neutral-900 rounded-2xl flex items-center justify-center text-white font-black italic">01.</div>
                <h2 className="text-xl font-black uppercase tracking-tight">Entrega</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 grid grid-cols-4 gap-6">
                  <div className="col-span-3 space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-neutral-400 ml-1">Rua / Logradouro</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                      <input 
                        type="text" 
                        required
                        placeholder="Nome da rua"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-neutral-50 border border-transparent focus:border-black rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-neutral-400 ml-1">Número</label>
                    <input 
                      type="text" required
                      placeholder="123"
                      value={addressNumber}
                      onChange={(e) => setAddressNumber(e.target.value)}
                      className="w-full bg-neutral-50 border border-transparent focus:border-black rounded-2xl py-4 px-6 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-neutral-400 ml-1">CEP</label>
                  <input 
                    type="text" 
                    required
                    placeholder="00000-000"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full bg-neutral-50 border border-transparent focus:border-black rounded-2xl py-4 px-6 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-neutral-400 ml-1">Cidade</label>
                    <input 
                      type="text" required
                      placeholder="São Paulo"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-neutral-50 border border-transparent focus:border-black rounded-2xl py-4 px-6 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-neutral-400 ml-1">UF</label>
                    <input 
                      type="text" required
                      placeholder="SP"
                      maxLength={2}
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      className="w-full bg-neutral-50 border border-transparent focus:border-black rounded-2xl py-4 px-6 outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Method (Simulated) */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-neutral-900 rounded-2xl flex items-center justify-center text-white font-black italic">02.</div>
                <h2 className="text-xl font-black uppercase tracking-tight">Pagamento</h2>
              </div>

              <div className="space-y-4">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={cn(
                    "w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all",
                    paymentMethod === 'card' ? "border-black bg-neutral-50" : "border-neutral-100 hover:border-neutral-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 flex items-center justify-center rounded-2xl", paymentMethod === 'card' ? "bg-black text-white" : "bg-neutral-100 text-neutral-400")}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-black uppercase tracking-tight">Cartão de Crédito</h4>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Até 12x sem juros</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 p-1", paymentMethod === 'card' ? "border-black bg-black" : "border-neutral-200")}>
                    <div className="w-full h-full rounded-full bg-white scale-0 transition-transform" style={{ transform: paymentMethod === 'card' ? 'scale(1)' : 'scale(0)' }}></div>
                  </div>
                </button>

                <button 
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={cn(
                    "w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all",
                    paymentMethod === 'pix' ? "border-black bg-neutral-50" : "border-neutral-100 hover:border-neutral-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 flex items-center justify-center rounded-2xl", paymentMethod === 'pix' ? "bg-black text-white" : "bg-neutral-100 text-neutral-400")}>
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-black uppercase tracking-tight">PIX</h4>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Aprovação imediata</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 p-1", paymentMethod === 'pix' ? "border-black bg-black" : "border-neutral-200")}>
                    <div className="w-full h-full rounded-full bg-white scale-0 transition-transform" style={{ transform: paymentMethod === 'pix' ? 'scale(1)' : 'scale(0)' }}></div>
                  </div>
                </button>

                <button 
                  type="button"
                  onClick={() => setPaymentMethod('boleto')}
                  className={cn(
                    "w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all",
                    paymentMethod === 'boleto' ? "border-black bg-neutral-50" : "border-neutral-100 hover:border-neutral-200"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 flex items-center justify-center rounded-2xl", paymentMethod === 'boleto' ? "bg-black text-white" : "bg-neutral-100 text-neutral-400")}>
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-black uppercase tracking-tight">Boleto Bancário</h4>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Vencimento em 3 dias</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 p-1", paymentMethod === 'boleto' ? "border-black bg-black" : "border-neutral-200")}>
                    <div className="w-full h-full rounded-full bg-white scale-0 transition-transform" style={{ transform: paymentMethod === 'boleto' ? 'scale(1)' : 'scale(0)' }}></div>
                  </div>
                </button>
              </div>

              {address && city && zipCode ? (
                <button 
                  onClick={handleSimulatedConfirm}
                  disabled={isProcessing}
                  className={cn(
                    "w-full h-[80px] bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 hover:bg-neutral-800 transition-all shadow-2xl active:scale-95 disabled:opacity-50",
                    isProcessing && "animate-pulse"
                  )}
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                  {isProcessing ? 'Processando...' : `Confirmar Compra (R$ ${total.toFixed(2)})`}
                </button>
              ) : (
                <div className="bg-neutral-50 p-12 rounded-[2.5rem] border border-dashed border-neutral-200 text-center">
                  <MapPin className="w-8 h-8 text-neutral-300 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Preencha o endereço para liberar o pagamento</p>
                </div>
              )}

              {/* Stripe code preserved for future use below */}
              {/* 
              <div className="hidden">
                  <Elements stripe={stripePromise} options={{ ... }}>
                    <CheckoutForm ... />
                  </Elements>
              </div>
              */}
            </section>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="w-full max-w-[450px] mx-auto lg:mx-0">
          <div className="bg-white border border-neutral-100 rounded-[3.5rem] p-12 sticky top-24 shadow-xl shadow-neutral-100 overflow-hidden">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 italic">Resumo do Pedido</h3>
            
            <div className="max-h-[300px] overflow-y-auto pr-4 mb-8 space-y-6">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-4">
                  <div className="w-20 h-24 bg-neutral-50 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={item.product.images[0]?.url || null} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black truncate uppercase tracking-tight">{item.product.name}</h4>
                    <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">{item.size} × {item.quantity}</p>
                    <p className="text-xs font-mono font-bold mt-1">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6 pt-8 border-t border-neutral-50">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-neutral-400 uppercase tracking-widest text-[10px] font-black">Subtotal</span>
                <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-400 uppercase tracking-widest text-[10px] font-black">Frete</span>
                </div>
                <span className="font-mono">{freight === 0 ? 'Grátis' : `R$ ${freight.toFixed(2)}`}</span>
              </div>
              <div className="pt-6 border-t border-neutral-100 flex justify-between items-end">
                <span className="text-[10px] uppercase font-black tracking-widest italic translate-y-1">Total Final</span>
                <span className="text-4xl font-black tracking-tighter italic leading-none">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-300" />
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-neutral-300">Pagamento 100% Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
