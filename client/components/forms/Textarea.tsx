import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  caption?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  caption,
  error,
  disabled = false,
  className,
  rows = 4,
}) => {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <div className="flex items-center">
          <label className="text-base font-medium text-black font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
            {label}
          </label>
          {required && (
            <span className="text-base font-bold text-red-7 ml-0.5">*</span>
          )}
        </div>
      )}
      
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={cn(
          'w-full px-4 py-3 rounded bg-gray-1 border-0 text-base resize-none',
          'placeholder:text-gray-5 text-black',
          'font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]',
          'focus:outline-none focus:ring-2 focus:ring-red-9 focus:ring-opacity-20',
          {
            'cursor-not-allowed opacity-50': disabled,
          }
        )}
      />
      
      {(caption || error) && (
        <div className="text-xs font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
          {error ? (
            <span className="text-red-7">{error}</span>
          ) : (
            <span className="text-[#868E96]">{caption}</span>
          )}
        </div>
      )}
    </div>
  );
};
