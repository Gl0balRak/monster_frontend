import React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked = false,
  onChange,
  label,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            'relative h-6 w-12 rounded-full transition-colors cursor-pointer border',
            {
              'bg-red-9 border-red-9': checked && !disabled,
              'bg-gray-2 border-gray-2': !checked && !disabled,
              'bg-gray-1 border-gray-1 cursor-not-allowed': disabled,
            }
          )}
          onClick={() => !disabled && onChange?.(!checked)}
        >
          <div
            className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
              {
                'translate-x-6': checked,
                'translate-x-0.5': !checked,
              }
            )}
          />
        </div>
      </div>
      
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'text-base font-normal text-black cursor-pointer',
            'font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]',
            {
              'cursor-not-allowed text-gray-5': disabled,
            }
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};
