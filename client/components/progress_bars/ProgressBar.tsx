import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0-100
  showPercentage?: boolean;
  label?: string;
  subLabel?: string;
  className?: string;
  color?: 'red' | 'green' | 'blue' | 'gray';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showPercentage = true,
  label,
  subLabel,
  className,
  color = 'red',
}) => {
  const colorClasses = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    gray: 'bg-gray-500',
  };

  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Animated dot indicator */}
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </div>

          <div className="flex flex-col">
            {label && (
              <span className="text-base font-semibold text-gray-900 font-['Open_Sans',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
                {label}
              </span>
            )}
            {subLabel && (
              <span className="text-sm text-gray-600 font-['Open_Sans',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
                {subLabel}
              </span>
            )}
          </div>
        </div>

        {showPercentage && (
          <span className="text-xl font-bold text-red-600 tabular-nums font-['Open_Sans',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
            {Math.round(safeProgress)}%
          </span>
        )}
      </div>

      {/* Progress bar container */}
      <div className="w-full bg-white rounded-full h-3 border border-gray-200 overflow-hidden shadow-sm">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out relative',
            colorClasses[color]
          )}
          style={{
            width: `${safeProgress}%`,
          }}
        >
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        </div>
      </div>
    </div>
  );
};