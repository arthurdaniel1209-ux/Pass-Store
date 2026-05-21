import React from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { User, Mail, Shield, UserCircle, Bell, Heart, CreditCard, LogOut, Package, User as UserIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Profile() {
  const { user, favorites, orders, showToast } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Sessão encerrada com sucesso.', 'info');
      navigate('/');
    } catch (error) {
      console.error(error);
      showToast('Erro ao encerrar sessão.', 'error');
    }
  };

  if (!user) return null;

  const stats = [
    { label: 'Favoritos', value: favorites.length, icon: Heart, color: 'text-red-500' },
    { label: 'Pedidos', value: orders.length, icon: Package, color: 'text-black' },
    { label: 'Nível', value: 'Silver', icon: Shield, color: 'text-neutral-400' },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12 mb-16 px-6">
          <div className="relative group">
            <div className="w-40 h-40 bg-neutral-900 rounded-[3rem] flex items-center justify-center overflow-hidden border-8 border-white shadow-2xl">
              <UserCircle className="w-24 h-24 text-white opacity-20" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-[10px] text-white font-black uppercase tracking-widest">Alterar Foto</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-lime-500 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-black" />
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">{user.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-100 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-400">
                <Mail className="w-3 h-3" /> {user.email}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-black rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                <User className="w-3 h-3" /> {user.role === 'admin' ? 'Administrador' : 'Comprador Frequente'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 flex items-center justify-between group hover:border-black transition-all">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{stat.label}</p>
                <p className="text-3xl font-black font-mono">{stat.value}</p>
              </div>
              <stat.icon className={cn("w-8 h-8 group-hover:scale-110 transition-transform", stat.color)} />
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-neutral-100 rounded-[3rem] p-4 flex flex-col gap-2">
            <h3 className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-300">Configurações</h3>
            <button className="flex items-center gap-4 p-6 hover:bg-neutral-50 rounded-[2rem] transition-all group">
              <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm">Dados Pessoais</h4>
                <p className="text-[10px] text-neutral-400">Edite suas informações e contato</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-6 hover:bg-neutral-50 rounded-[2rem] transition-all group">
              <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm">Cartões Salvos</h4>
                <p className="text-[10px] text-neutral-400">Gerencie seus métodos de pagamento</p>
              </div>
            </button>
            <button className="flex items-center gap-4 p-6 hover:bg-neutral-50 rounded-[2rem] transition-all group">
              <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm">Notificações</h4>
                <p className="text-[10px] text-neutral-400">Alertas de drops e promoções</p>
              </div>
            </button>
          </div>

          <div className="bg-white border border-neutral-100 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Pronto para sair?</h3>
            <p className="text-neutral-400 text-sm mb-10 max-w-[200px]">Esperamos que tenha encontrado o que procurava.</p>
            <button 
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 rounded-2xl py-6 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-red-100 transition-all border border-red-100"
            >
              <LogOut className="w-4 h-4" /> Deslogar da Conta
            </button>
            <p className="mt-8 text-[10px] text-neutral-300 font-bold uppercase tracking-widest">Pass Store v1.0.0</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
