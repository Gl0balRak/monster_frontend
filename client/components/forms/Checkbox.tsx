import React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  caption?: string;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked = false,
  indeterminate = false,
  onChange,
  label,
  caption,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-start gap-3">
        <div className="relative mt-0.5">
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
              'flex h-5 w-5 items-center justify-center rounded transition-all cursor-pointer',
              {
                'bg-red-500 border-2 border-red-500': (checked || indeterminate) && !disabled,
                'bg-white border-2 border-gray-300 hover:border-gray-400': !(checked || indeterminate) && !disabled,
                'bg-gray-100 border-2 border-gray-200 cursor-not-allowed': disabled,
              }
            )}
            onClick={() => !disabled && onChange?.(!checked)}
          >
            {checked && !indeterminate && (
              <svg
                width="12"
                height="10"
                viewBox="0 0 12 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M1 5L4.5 8.5L11 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {indeterminate && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4 8C4 7.44772 4.44772 7 5 7H11C11.5523 7 12 7.44772 12 8C12 8.55228 11.5523 9 11 9H5C4.44772 9 4 8.55228 4 8Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </div>
        </div>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-base font-normal text-gray-900 cursor-pointer select-none leading-6',
              'font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]',
              {
                'cursor-not-allowed text-gray-400': disabled,
              }
            )}
            onClick={() => !disabled && onChange?.(!checked)}
          >
            {label}
          </label>
        )}
      </div>
      {caption && (
        <div className="ml-8">
          <span className="text-xs text-gray-600 font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
            {caption}
          </span>
        </div>
      )}
    </div>
  );
};
