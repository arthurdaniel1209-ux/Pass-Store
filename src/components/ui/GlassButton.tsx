import React from 'react';
import { cn } from '../../lib/utils';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  wrapperClassName?: string;
  labelClassName?: string;
  showShadow?: boolean;
  strokeWidth?: string; // e.g. '2px' or '3px'
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      children,
      className,
      wrapperClassName,
      labelClassName,
      showShadow = true,
      strokeWidth = '2px',
      type = 'button',
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div 
        className={cn("glass-btn-wrapper select-none inline-block", wrapperClassName)}
        style={{ ['--bw' as any]: strokeWidth }}
      >
        <button
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            "glass-btn w-full text-center flex items-center justify-center transition-all disabled:opacity-50 disabled:pointer-events-none",
            className
          )}
          style={style}
          {...props}
        >
          <span className={cn("glass-btn__label w-full flex items-center justify-center gap-2", labelClassName)}>
            {children}
          </span>
        </button>
        {showShadow && <div className="glass-btn-shadow" />}
      </div>
    );
  }
);

GlassButton.displayName = 'GlassButton';
