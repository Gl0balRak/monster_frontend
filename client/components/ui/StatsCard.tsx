import React from 'react';
import { cn } from '@/lib/utils';
import { commonClasses } from '@/lib/design-system';

interface StatsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  variant?: 'default' | 'highlight';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  unit,
  variant = 'default',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col p-4 rounded-lg border',
        {
          'bg-white border-gray-2': variant === 'default',
          'bg-red-0 border-red-9': variant === 'highlight',
        },
        className
      )}
    >
      <div className={cn('text-sm text-gray-5', commonClasses.font)}>
        {label}
      </div>
      <div className={cn('flex items-baseline gap-1 mt-1', commonClasses.font)}>
        <span className="text-2xl font-bold text-black">{value}</span>
        {unit && <span className="text-sm text-gray-5">{unit}</span>}
      </div>
    </div>
  );
};
