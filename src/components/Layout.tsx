import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Home, Package, Heart, LogOut, Menu, X, ShieldAlert, Bell, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';
import BubbleMenu from './BubbleMenu';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, cart, setUser, notifications, markNotificationAsRead, showToast } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { name: 'Início', path: '/home', icon: Home },
    { name: 'Produtos', path: '/produtos', icon: Package },
    { name: 'Pedidos', path: '/pedidos', icon: ShoppingBag, protected: true },
    { name: 'Perfil', path: '/perfil', icon: User, protected: true },
  ];

  if (user?.role === UserRole.ADMIN) {
    navItems.push({ name: 'Admin', path: '/admin', icon: ShieldAlert, protected: true });
  }

  const handleLogout = () => {
    setUser(null);
    showToast('Sessão encerrada com sucesso.', 'info');
    navigate('/');
  };
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col justify-between p-8 shrink-0">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-12 px-2">
            <Link to="/home" className="flex items-center gap-2 group transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-accent transition-colors shadow-lg shadow-slate-200">
                <span className="text-white font-black text-lg italic">P</span>
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase font-display italic">PASS</h1>
            </Link>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item, index) => (
              (!item.protected || user) && (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
                >
                  <Link 
                    to={item.path}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm group relative overflow-hidden",
                      location.pathname === item.path 
                        ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {location.pathname === item.path && (
                      <motion.div 
                        layoutId="nav-bg"
                        className="absolute inset-0 bg-slate-900 -z-10"
                      />
                    )}
                    <item.icon className={cn(
                      "w-5 h-5 transition-transform group-hover:scale-110",
                      location.pathname === item.path ? "text-white" : "text-slate-400 group-hover:text-slate-900"
                    )} />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                </motion.div>
              )
            ))}
          </nav>


        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border-t border-slate-100 pt-8"
        >
          {user ? (
            <div className="flex items-center justify-between group">
              <Link to="/perfil" className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors shrink-0 max-w-[calc(100%-40px)]">
                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase overflow-hidden shadow-inner">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate text-slate-900">{user.name}</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Ver Perfil</p>
                </div>
              </Link>
              <button 
                onClick={handleLogout} 
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link to="/" className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all text-sm shadow-xl shadow-slate-200 active:scale-95">
              <User className="w-4 h-4" /> Entrar
            </Link>
          )}
        </motion.div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header - Mobile & Desktop Top Bar */}
        <header className={cn(
          "h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 lg:px-12 shrink-0 sticky top-0 z-40 shadow-sm transition-all",
          isMenuOpen ? "bg-white" : ""
        )}>
          <div className="flex items-center gap-3 sm:gap-6">
            <button 
              className={cn(
                "p-2 text-slate-900 hover:bg-slate-50 rounded-lg transition-all active:scale-90 lg:hidden",
                isMenuOpen && "opacity-0 pointer-events-none"
              )}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="hidden lg:flex relative w-full max-w-lg mx-8 group">
            <span className="absolute inset-y-0 left-5 flex items-center text-slate-400 group-focus-within:text-slate-900 transition-colors">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              placeholder="Pesquisar produtos, coleções..." 
              className="w-full bg-[#F3F4F6] border border-transparent rounded-2xl py-3.5 pl-14 pr-6 text-sm focus:ring-4 focus:ring-slate-900/5 focus:bg-white focus:border-slate-200 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-6">
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 text-slate-900 hover:bg-slate-50 rounded-xl relative transition-all group active:scale-90"
                >
                  <Bell className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:rotate-12" />
                  {unreadCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-[8px] flex items-center justify-center rounded-full font-black ring-2 ring-white"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsNotificationsOpen(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-80 sm:w-96 bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 z-50 overflow-hidden"
                      >
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                          <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Notificações</h3>
                            {unreadCount > 0 && <span className="text-[9px] font-black uppercase bg-accent/10 text-accent px-2 py-0.5 rounded-lg">{unreadCount} Novas</span>}
                          </div>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
                          {notifications.length > 0 ? (
                            notifications.map((notif) => (
                              <div 
                                key={notif.id}
                                onClick={() => !notif.read && markNotificationAsRead(notif.id)}
                                className={cn(
                                  "p-6 border-b border-slate-50 transition-colors cursor-pointer group",
                                  !notif.read ? "bg-white" : "bg-slate-50/30 opacity-70"
                                )}
                              >
                                <div className="flex gap-4">
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                    !notif.read ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                                  )}>
                                    {notif.type === 'order_status' ? <ShoppingBag className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between gap-4">
                                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{notif.title}</h4>
                                      {!notif.read && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{notif.message}</p>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-12 text-center">
                              <Bell className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Nenhuma notificação</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
            <Link to="/carrinho" className="p-2 text-slate-900 hover:bg-slate-50 rounded-xl relative transition-all group active:scale-90">
              <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:rotate-6" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-slate-900 text-white text-[10px] flex items-center justify-center rounded-full font-black ring-2 ring-white shadow-lg shadow-slate-200"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>
            
            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
            
            <Link 
              to={user?.role === UserRole.ADMIN ? "/admin" : user ? "/perfil" : "/"} 
              className={cn(
                "hidden sm:flex items-center justify-center px-4 md:px-8 py-3 rounded-2xl transition-all active:scale-95",
                user?.role === UserRole.ADMIN 
                  ? "bg-slate-900 text-white border-2 border-slate-800 shadow-xl shadow-slate-200" 
                  : "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
              )}
            >
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">
                {user?.role === UserRole.ADMIN ? 'Admin' : user ? user.name.split(' ')[0] : 'Entrar'}
              </span>
            </Link>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 z-50 lg:hidden px-2 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto">
            {navItems.filter(item => !item.protected || user).map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full min-w-[64px] gap-1 transition-all active:scale-90",
                  location.pathname === item.path ? "text-slate-900" : "text-slate-400"
                )}
              >
                <item.icon className={cn("w-5 h-5", location.pathname === item.path && "scale-110")} />
                <span className="text-[9px] font-black uppercase tracking-widest">{item.name}</span>
                {location.pathname === item.path && (
                  <motion.div layoutId="mobile-indicator" className="w-1 h-1 bg-slate-900 rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 bg-white lg:hidden flex flex-col p-8"
            >
              <div className="flex items-center justify-between mb-12">
                <Link to="/home" className="text-2xl font-black italic tracking-tighter uppercase font-display">PASS</Link>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <nav className="flex flex-col gap-6">
                {navItems.map((item, index) => (
                  (!item.protected || user) && (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link 
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "text-5xl font-black uppercase tracking-tighter italic transition-all block",
                          location.pathname === item.path ? "text-slate-900 translate-x-2" : "text-slate-200 hover:text-slate-400"
                        )}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  )
                ))}
              </nav>
              <div className="mt-auto pt-8 border-t border-slate-100">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-lg shadow-inner">{user.name.charAt(0)}</div>
                      <div className="flex flex-col">
                        <span className="font-black text-xl tracking-tight">{user.name}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Membro Premium</span>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="p-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-colors">Sair</button>
                  </div>
                ) : (
                  <Link to="/" className="w-full bg-slate-900 text-white text-center py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-slate-200 active:scale-95 transition-all">Entrar na Conta</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-7xl mx-auto px-6 lg:px-12 py-10 pb-20"
          >
            {children}

            {/* Footer - Simplified within main content */}
            <footer className="mt-32 pt-16 border-t border-slate-200">
              <div className="mb-16">
                <div className="max-w-md">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-6">PASS</h2>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    Design minimalista, qualidade excepcional. Redefinindo o streetwear contemporâneo com peças que transcendem o tempo.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-8 pb-12">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">© 2024 Pass Store. Definitive Streetwear.</p>
                <div className="flex gap-3">
                  {['Visa', 'Mastercard', 'Pix', 'Apple Pay'].map(p => (
                    <div key={p} className="h-8 px-4 bg-white border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 flex items-center justify-center uppercase tracking-widest hover:bg-slate-50 transition-colors">{p}</div>
                  ))}
                </div>
              </div>
            </footer>
          </motion.div>
        </div>
      </main>

      <div className="fixed bottom-10 right-10 z-[100] hidden sm:block">
        <BubbleMenu
          logo={<span className="font-black italic text-sm">PASS</span>}
          items={[
            {
              label: 'home',
              href: '/home',
              ariaLabel: 'Home',
              rotation: -8,
              hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' }
            },
            {
              label: 'produtos',
              href: '/produtos',
              ariaLabel: 'Produtos',
              rotation: 8,
              hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' }
            },
            {
              label: 'pedidos',
              href: '/pedidos',
              ariaLabel: 'Pedidos',
              rotation: 8,
              hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' }
            },
            {
              label: 'perfil',
              href: '/perfil',
              ariaLabel: 'Perfil',
              rotation: 8,
              hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
            },
            {
              label: 'carrinho',
              href: '/carrinho',
              ariaLabel: 'Carrinho',
              rotation: -8,
              hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' }
            }
          ]}
          menuAriaLabel="Toggle navigation"
          menuBg="#ffffff"
          menuContentColor="#111111"
          useFixedPosition={false}
          animationEase="back.out(1.5)"
          animationDuration={0.5}
          staggerDelay={0.12}
        />
      </div>
    </div>
  );
}
