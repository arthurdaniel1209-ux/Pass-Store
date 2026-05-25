import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../lib/firebase';
import { ArrowRight, Chrome, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Login() {
  const { showToast } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      showToast('Bem-vindo(a) à PASS!', 'success');
      navigate('/home');
    } catch (err: any) {
      // Sanitize client-side error outputs to prevent any accidental leakage of credentials or auth metadata in environments
      const errorMsg = err instanceof Error ? err.message : String(err);
      const sanitizedMsg = errorMsg.replace(/password|pass|secret|token/gi, "[REDACTED]");
      console.warn("[Auth] Falha na autenticação Google:", sanitizedMsg);
      const msg = 'Erro ao entrar com Google. Tente novamente.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
        const successMsg = 'Link de verificação enviado! Verifique seu e-mail para continuar.';
        setSuccess(successMsg);
        showToast('Sucesso! Link de verificação enviado.', 'success');
        setIsRegistering(false);
      } else {
        const user = await loginWithEmail(email, password);
        if (!user.emailVerified) {
          const warnMsg = 'Por favor, verifique seu e-mail antes de entrar.';
          setError(warnMsg);
          showToast(warnMsg, 'warning');
        } else {
          showToast('Bem-vindo(a) de volta à PASS!', 'success');
          navigate('/home');
        }
      }
    } catch (err: any) {
      // Clear raw traces containing credentials to safeguard credentials leakage in browser logs
      const errorCode = err.code || '';
      const errorMessage = typeof err.message === 'string' ? err.message : String(err);
      const sanitizedMsg = errorMessage.replace(/password|pass|secret|token/gi, "[REDACTED]");
      console.warn("[Auth] Falha na autenticação por E-mail:", sanitizedMsg);
      let msg = 'Ocorreu um erro ao processar sua solicitação. Tente novamente.';
      
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential' || errorMessage.includes('auth/invalid-credential')) {
        msg = 'E-mail ou senha incorretos. Por favor, verifique seus dados.';
      } else if (errorCode === 'auth/email-already-in-use' || errorMessage.includes('auth/email-already-in-use')) {
        msg = 'Este e-mail já está em uso. Tente fazer login ou use outro e-mail.';
      } else if (errorCode === 'auth/weak-password') {
        msg = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (errorCode === 'auth/invalid-email') {
        msg = 'E-mail inválido.';
      } else if (errorCode === 'auth/user-disabled') {
        msg = 'Esta conta foi desativada.';
      }
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-6 py-12 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] -mr-64 -mt-64"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          x: [0, -50, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-900/5 rounded-full blur-[140px] -ml-64 -mb-64"
      />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-md w-full bg-white/80 backdrop-blur-xl p-10 md:p-14 rounded-[3.5rem] border border-white/50 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] relative z-10"
      >
        <motion.div 
          key={isRegistering ? 'register' : 'login'}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileActive={{ scale: 0.95 }}
            className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-200 cursor-pointer"
          >
            <span className="text-white font-black text-3xl italic">P</span>
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter mb-4 font-display italic uppercase text-slate-900">PASS</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
            <span className="w-1 h-1 rounded-full bg-accent animate-pulse"></span>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
              {isRegistering ? 'O Futuro do Streetwear' : 'Seu Estilo Começa Aqui'}
            </p>
          </div>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-xs font-bold rounded-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
            {success}
          </motion.div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-5">
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-[0.2em] ml-1 text-slate-400">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-slate-900 focus:ring-8 focus:ring-slate-900/5 rounded-2xl py-4.5 pl-14 pr-4 outline-none transition-all text-sm font-bold"
                placeholder="seu@email.com"
                required
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-[0.2em] ml-1 text-slate-400">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-slate-900 focus:ring-8 focus:ring-slate-900/5 rounded-2xl py-4.5 pl-14 pr-12 outline-none transition-all text-sm font-bold"
                placeholder="********"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>

          <motion.button 
            variants={itemVariants}
            key={isRegistering ? 'btn-reg' : 'btn-log'}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white rounded-[1.8rem] py-5 font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 hover:bg-black transition-all group shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Processando...' : isRegistering ? 'Criar Conta' : 'Entrar na Conta'}
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-accent transition-colors">
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        </form>

        <motion.div variants={itemVariants} className="relative py-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="bg-white px-6 text-slate-300">ou explore com</span>
          </div>
        </motion.div>

        <motion.button 
          variants={itemVariants}
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white border border-slate-100 text-slate-900 rounded-[1.8rem] py-5 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 hover:border-slate-900 hover:bg-slate-50 transition-all group shadow-sm active:scale-95 disabled:opacity-50"
        >
          <div className="w-7 h-7 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
            <Chrome className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </div>
          Vincular Google
        </motion.button>

        <motion.div variants={itemVariants} className="mt-10 text-center">
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setSuccess(null);
            }}
            className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 transition-all hover:tracking-[0.4em] duration-300"
          >
            {isRegistering ? 'Já sou membro' : 'Criar nova conta'}
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12 pt-10 border-t border-slate-100 text-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] leading-loose max-w-[200px] mx-auto">
            Ao entrar você concorda com nossos <span className="text-slate-400 hover:text-slate-900 cursor-pointer transition-colors">termos</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
