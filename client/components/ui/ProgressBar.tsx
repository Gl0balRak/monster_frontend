import React from 'react';
import { cn } from '@/lib/utils';
import { typography } from '@/lib/design-system';

interface ProgressBarProps {
  progress: number; // 0-100
  showPercentage?: boolean;
  label?: string;
  className?: string;
  color?: 'red' | 'green' | 'blue' | 'gray';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showPercentage = true,
  label,
  className,
  color = 'red'
}) => {
  const colorClasses = {
    red: 'bg-red-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    gray: 'bg-gray-600',
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className={cn(typography.bodyText)}>{label}</span>
          {showPercentage && (
            <span className={cn(typography.bodyText, 'text-gray-5')}>
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      
      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className={cn(
            'h-2 rounded-full transition-all duration-300 ease-out',
            colorClasses[color]
          )}
          style={{ 
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            transformOrigin: 'left'
          }}
        />
      </div>
      
      {!label && showPercentage && (
        <div className="text-center mt-2">
          <span className={cn(typography.bodyText, 'text-gray-5')}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};
