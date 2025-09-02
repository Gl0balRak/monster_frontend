import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outline';
  size?: 'medium' | 'large' | 'small';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  size = 'medium',
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded border font-medium transition-colors',
        'font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]',
        {
          // Variants
          'bg-red-9 text-white border-red-9 hover:bg-red-7 hover:border-red-7': 
            variant === 'filled' && !disabled,
          'bg-transparent text-red-9 border-red-3 hover:bg-red-0': 
            variant === 'outline' && !disabled,
          
          // Disabled states
          'bg-gray-1 text-[#C1C2C5] border-gray-1 cursor-not-allowed': 
            disabled,
          
          // Sizes
          'px-5 py-2 text-base': size === 'medium',
          'px-6 py-3 text-base': size === 'large',
        },
        className
      )}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span>{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};
