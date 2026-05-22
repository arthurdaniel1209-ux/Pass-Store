import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { cn } from '../lib/utils';
import { Star, ArrowRight, Zap } from 'lucide-react';
import GradientBlinds from './GradientBlinds';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  className?: string;
  enableTilt?: boolean;
}

const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v: number, precision = 3) => parseFloat(v.toFixed(precision));
const adjust = (v: number, fMin: number, fMax: number, tMin: number, tMax: number) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

export default function ProductCard({ product, className = '', enableTilt = true }: ProductCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  
  // Custom states for visual styles
  const isDrop = !!product.is_drop;
  
  // Interactive Mouse Move Engine for the premium 3D tilt + glare spotlight
  const handlePointerMove = useCallback((event: PointerEvent) => {
    const shell = shellRef.current;
    const container = containerRef.current;
    if (!shell || !container || !enableTilt) return;

    const rect = shell.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const width = rect.width || 1;
    const height = rect.height || 1;

    const percentX = clamp((100 / width) * x);
    const percentY = clamp((100 / height) * y);

    const centerX = percentX - 50;
    const centerY = percentY - 50;

    // Apply tilt calculations to raw CSS variables
    container.style.setProperty('--prod-pointer-x', `${percentX}%`);
    container.style.setProperty('--prod-pointer-y', `${percentY}%`);
    container.style.setProperty('--prod-background-x', `${adjust(percentX, 0, 100, 35, 65)}%`);
    container.style.setProperty('--prod-background-y', `${adjust(percentY, 0, 100, 35, 65)}%`);
    container.style.setProperty('--prod-pointer-from-center', `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`);
    container.style.setProperty('--prod-pointer-from-top', `${percentY / 100}`);
    container.style.setProperty('--prod-pointer-from-left', `${percentX / 100}`);
    
    // Smooth tilt limit: -14 to 14 degrees for immersive depth
    container.style.setProperty('--prod-rotate-x', `${round(-(centerX / 3.5))}deg`);
    container.style.setProperty('--prod-rotate-y', `${round(centerY / 3.5)}deg`);
  }, [enableTilt]);

  const handlePointerEnter = useCallback(() => {
    const shell = shellRef.current;
    if (shell) {
      shell.classList.add('active');
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    const shell = shellRef.current;
    const container = containerRef.current;
    if (shell && container) {
      shell.classList.remove('active');
      
      // Animate card smoothly back to perfect center
      container.style.setProperty('--prod-pointer-x', '50%');
      container.style.setProperty('--prod-pointer-y', '50%');
      container.style.setProperty('--prod-rotate-x', '0deg');
      container.style.setProperty('--prod-rotate-y', '0deg');
    }
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell || !enableTilt) return;

    shell.addEventListener('pointerenter', handlePointerEnter);
    shell.addEventListener('pointermove', handlePointerMove);
    shell.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      shell.removeEventListener('pointerenter', handlePointerEnter);
      shell.removeEventListener('pointermove', handlePointerMove);
      shell.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [enableTilt, handlePointerEnter, handlePointerMove, handlePointerLeave]);

  // Set card ambient glow color depending on drop status
  // Drops get a nice purple glow, whereas standard products get a slate-indigo look
  const customGlowStyle = useMemo(() => {
    return {
      '--prod-behind-glow-color': isDrop ? 'rgba(168, 85, 247, 0.22)' : 'rgba(99, 102, 241, 0.08)',
    } as React.CSSProperties;
  }, [isDrop]);

  return (
    <div 
      ref={containerRef} 
      className={cn("prod-card-wrapper select-none", className)}
      style={customGlowStyle}
    >
      {/* Blurred background glow following the cursor */}
      <div className="prod-behind" />

      <div ref={shellRef} className="prod-card-shell">
        <div className="prod-card">
          <Link to={`/produtos/${product.id}`} className="block h-full flex flex-col group">
            
            {/* Aspect image section wrapping our core image & visual components */}
            <div className={cn(
              "prod-inside relative aspect-[3/4] overflow-hidden mb-6 sm:mb-10 border transition-all duration-700 ease-[0.16, 1, 0.3, 1]",
              isDrop 
                ? "border-violet-500/40 shadow-[0_20px_50px_rgba(82,39,255,0.12)] ring-2 ring-violet-500/15 group-hover:border-pink-400 group-hover:ring-pink-500/30" 
                : "border-slate-100 shadow-xl shadow-slate-200/40"
            )}>
              
              {/* If it's a Drop, inject GradientBlinds with retro-tech animation overlay */}
              {isDrop && (
                <div className="absolute inset-0 z-0 overflow-hidden opacity-30 group-hover:opacity-60 transition-opacity duration-700">
                  <GradientBlinds
                    gradientColors={["#FF9FFC", "#5227FF"]}
                    angle={0}
                    noise={0.3}
                    blindCount={12}
                    blindMinWidth={50}
                    mouseDampening={0.12}
                    mirrorGradient
                    spotlightRadius={0.45}
                    spotlightSoftness={0.9}
                    spotlightOpacity={1}
                    distortAmount={5}
                    shineDirection="left"
                  />
                </div>
              )}

              {/* Spotlight reflective overlay */}
              <div className="prod-glare" />

              {/* Holographic light sheen for exclusive drop cards */}
              {isDrop && <div className="prod-shine" />}

              {/* Extra micro-textured lines for high tech feel */}
              <div className="prod-scanlines" />

              {/* Render Primary Product Image */}
              <img 
                src={product.images[0]?.url || ''} 
                alt={product.name} 
                loading="lazy"
                className={cn(
                  "w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out pointer-events-none relative z-10",
                  isDrop && "mix-blend-multiply opacity-90 group-hover:opacity-15 transition-all duration-700"
                )}
                referrerPolicy="no-referrer"
              />

              {/* Drop tag container */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-2 pointer-events-none z-20">
                {isDrop ? (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#5227FF] to-[#FF9FFC] text-white px-3 py-1.5 sm:px-4.5 sm:py-2 rounded-xl sm:rounded-2xl text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(82,39,255,0.3)] backdrop-blur-md animate-pulse">
                    <Zap className="w-2.5 h-2.5 fill-current text-white shrink-0 animate-bounce" />
                    <span>DROP EXCLUSIVO</span>
                  </div>
                ) : null}
              </div>

              {/* Subtle hover overlay to darken the background slightly on hover */}
              <div className={cn(
                "absolute inset-0 transition-opacity duration-700 pointer-events-none z-20",
                isDrop 
                  ? "bg-gradient-to-t from-violet-950/25 via-transparent to-transparent opacity-0 group-hover:opacity-100"
                  : "bg-slate-900/10 opacity-0 group-hover:opacity-100"
              )}></div>

            </div>

            {/* Product Meta Info Bottom Section */}
            <div className="px-3 sm:px-4">
              <div className="flex items-center gap-3 mb-2 sm:mb-4">
                {isDrop ? (
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-[#5227FF] flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-current text-[#5227FF]" />
                    {product.collection || 'Drop'}
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">{product.collection || 'Coleção'}</span>
                )}
                <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star 
                      key={s} 
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-slate-900 fill-current opacity-20 group-hover:opacity-100 transition-opacity" 
                    />
                  ))}
                </div>
              </div>

              <h3 className={cn(
                "text-xl sm:text-2xl font-black tracking-tighter transition-colors duration-300 leading-[0.9] uppercase font-display italic text-slate-900 mb-4 sm:mb-6 max-w-[200px] truncate",
                isDrop ? "group-hover:text-[#5227FF]" : "group-hover:text-accent"
              )}>
                {product.name}
              </h3>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4 sm:pt-6">
                <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900">
                  R$ {product.price.toFixed(2)}
                </span>
                
                <div className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white border flex items-center justify-center transition-all duration-500 group-hover:text-white group-hover:rotate-12",
                  isDrop
                    ? "border-violet-100 text-violet-500 group-hover:bg-[#5227FF] group-hover:border-[#5227FF]"
                    : "border-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900"
                )}>
                  <ArrowRight className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>

          </Link>
        </div>
      </div>
    </div>
  );
}
