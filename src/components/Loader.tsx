import React from 'react';
import { motion } from 'motion/react';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="relative">
        {/* Decorative background orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-slate-900/5 rounded-full blur-3xl -inset-20"
        />
        
        <div className="relative flex flex-col items-center">
          {/* Main P Animation */}
          <div className="w-32 h-32 relative mb-8">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Outer stroke path for "P" */}
              <motion.path
                d="M35 20 H65 C85 20 85 55 65 55 H35 V85"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-slate-200"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Bold Italic P */}
              <motion.path
                d="M30 15 L70 15 C90 15 90 55 70 55 L35 55 L40 85 L20 85 L30 15 Z"
                fill="currentColor"
                className="text-slate-900"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ 
                  opacity: [0, 1, 0.8, 1],
                  scale: [0.95, 1, 0.98, 1],
                  y: [5, 0, 2, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Glowing effect inside P */}
              <motion.path
                d="M30 15 L70 15 C90 15 90 55 70 55 L35 55 L40 85 L20 85 L30 15 Z"
                fill="none"
                stroke="#6366f1"
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </svg>

            {/* Scanning line effect */}
            <motion.div 
              animate={{ 
                top: ["0%", "100%", "0%"],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-accent/30 blur-sm z-20"
            />
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-3"
          >
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 font-display">PASS</h2>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-1 h-1 bg-slate-900 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
