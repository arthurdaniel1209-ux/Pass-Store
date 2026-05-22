import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface ShipButtonProps {
  onClick: () => void;
  isProcessing: boolean;
  label: string;
  disabled?: boolean;
  triggerAnimation?: boolean;
}

export const ShipButton = React.forwardRef<HTMLButtonElement, ShipButtonProps>(
  ({ onClick, isProcessing, label, disabled, triggerAnimation = false }, ref) => {
    const [isAnimating, setIsAnimating] = useState(false);

    // Sync animation state with prop if supplied externally
    const shouldGo = triggerAnimation || isAnimating;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (disabled || shouldGo) return;
      setIsAnimating(true);
      onClick();
    };

    return (
      <div className="flex justify-center w-full my-4">
        <button
          ref={ref}
          onClick={handleClick}
          disabled={disabled || shouldGo}
          className={cn(
            "ship-btn relative block overflow-hidden select-none outline-none mx-auto",
            shouldGo && "go",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
          style={{ width: '280px', height: '63px' }}
        >
          <span className="lbl idle font-black text-[11px] uppercase tracking-widest italic flex items-center justify-center gap-2">
            {isProcessing ? 'Processando...' : label}
          </span>
          <span className="lbl done font-black text-[11px] uppercase tracking-widest italic flex items-center justify-center gap-1.5 min-w-max">
            A caminho! PASS despachada
            <svg viewBox="0 0 12 10">
              <polyline points="1.5 6 4.5 9 10.5 1" />
            </svg>
          </span>
          <div className="cargo"></div>
          <div className="vehicle">
            <div className="cab-back"></div>
            <div className="cab-front">
              <div className="windshield"></div>
            </div>
            <div className="headlight top"></div>
            <div className="headlight bottom"></div>
          </div>
          <div className="rail"></div>
        </button>
      </div>
    );
  }
);

ShipButton.displayName = 'ShipButton';
