import React from "react";
import { cn } from "@/lib/utils";

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  required?: boolean;
  caption?: string;
  error?: string;
  suffix?: string;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: "text" | "url" | "number";
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onFocus,
  onKeyDown,
  required = false,
  caption,
  error,
  suffix,
  rightIcon,
  disabled = false,
  className,
  type = "text",
}) => {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <div className="flex items-center">
          <label className="text-sm font-medium text-gray-900 font-['Open_Sans',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
            {label}
          </label>
          {required && (
            <span className="text-base font-bold text-red-500 ml-0.5">*</span>
          )}
        </div>
      )}

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 rounded-lg text-base',
            'bg-white border border-gray-300',
            'placeholder:text-gray-500 text-gray-900',
            'font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]',
            'transition-all duration-200',
            'hover:border-gray-400',
            'focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500',
            {
              'pr-20': suffix && rightIcon,
              'pr-12': rightIcon && !suffix,
              'pr-16': suffix && !rightIcon,
              'cursor-not-allowed opacity-50': disabled,
            }
          )}
        />

        {(suffix || rightIcon) && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {suffix && (
              <span className="text-base text-gray-500 font-['Open_Sans',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
                {suffix}
              </span>
            )}
            {rightIcon && <div className="text-gray-500">{rightIcon}</div>}
          </div>
        )}
      </div>

      {(caption || error) && (
        <div className="text-xs font-['Open_Sans',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
          {error ? (
            <span className="text-red-500">{error}</span>
          ) : (
            <span className="text-gray-600">{caption}</span>
          )}
        </div>
      )}
    </div>
  );
};