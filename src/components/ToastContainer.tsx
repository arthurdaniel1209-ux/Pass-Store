import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Toast } from '../types';
import { cn } from '../lib/utils';

export default function ToastContainer() {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="fixed top-24 sm:top-6 right-0 sm:right-6 left-0 sm:left-auto z-[99999] pointer-events-none flex flex-col gap-3 px-4 sm:px-0 w-full sm:max-w-sm max-h-[85vh] overflow-hidden">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  key?: React.Key;
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 3000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPercentage = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPercentage);
      if (elapsed >= duration) {
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [duration]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-violet-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  };

  const borderAccentColors = {
    success: 'border-l-emerald-500',
    error: 'border-l-rose-500',
    info: 'border-l-violet-500',
    warning: 'border-l-amber-500',
  };

  const progressColors = {
    success: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    error: 'bg-gradient-to-r from-rose-500 to-red-500',
    info: 'bg-gradient-to-r from-violet-500 to-pink-500',
    warning: 'bg-gradient-to-r from-amber-500 to-yellow-500',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95, x: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 15, x: 30, transition: { duration: 0.3 } }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
      className={cn(
        "bg-slate-900/95 backdrop-blur-md text-white border-l-4 rounded-xl shadow-[0_20px_50px_rgba(15,23,42,0.3)] pointer-events-auto overflow-hidden border border-slate-800/80 w-full relative group",
        borderAccentColors[toast.type]
      )}
    >
      <div className="p-4 sm:p-5 flex items-start gap-4">
        {icons[toast.type]}
        
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs sm:text-[13px] font-black italic tracking-wide uppercase font-display leading-tight">
            {toast.type === 'success' ? 'Sucesso' : toast.type === 'error' ? 'Erro' : toast.type === 'warning' ? 'Atenção' : 'Info'}
          </p>
          <p className="text-[11px] sm:text-xs font-medium text-slate-300 mt-1 leading-relaxed">
            {toast.message}
          </p>
        </div>

        <button 
          onClick={onClose}
          className="text-slate-500 hover:text-white hover:bg-slate-800/60 p-1 rounded-lg transition-colors inline-flex shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress countdown indicator line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-800/40">
        <motion.div 
          className={cn("h-full", progressColors[toast.type])}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}
