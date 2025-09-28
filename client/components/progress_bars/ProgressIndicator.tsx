import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  current: number;
  target: number;
  label?: string;
  showDifference?: boolean;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  target,
  label,
  showDifference = true,
  className,
}) => {
  // Вычисляем порог толерантности для недобора (10% или 1 слово, что больше)
  const underThreshold = Math.max(target * 0.1, 1);
  const minAcceptable = target - underThreshold;

  // Вычисляем порог толерантности для перебора (10% или 2 слова, что больше)
  const overThreshold = Math.max(target * 0.1, 2);
  const maxAcceptable = target + overThreshold;

  // Определяем состояние
  const isAcceptable = current >= minAcceptable && current <= maxAcceptable;
  const isUnder = current < minAcceptable;
  const isOver = current > maxAcceptable;

  // Вычисляем процент для отображения прогресс-бара
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const difference = Number((current - target).toFixed(3));

  // Определяем цвета
  let bgColorClass = 'bg-green-500'; // По умолчанию зеленый
  let progressColorClass = '';

  if (isAcceptable) {
    // В пределах допустимого диапазона - зеленый
    bgColorClass = 'bg-green-500';
  } else if (isUnder) {
    // Значительный недобор - красный фон с зеленым прогрессом
    bgColorClass = 'bg-red-500';
    progressColorClass = 'bg-green-500';
  } else {
    // Значительный перебор - красный
    bgColorClass = 'bg-red-500';
  }

  // Определяем, нужно ли показывать разницу (только при переборе и красном индикаторе)
  const showDiff = showDifference && difference > 0 && !isAcceptable;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="text-sm text-gray-600 mb-2 text-center font-['Open_Sans',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
          {label}
        </div>
      )}

      <div className={cn('h-6 rounded relative overflow-hidden', bgColorClass)}>
        {/* Прогресс-бар для недобора */}
        {isUnder && progressColorClass && (
          <div
            className={cn('absolute left-0 top-0 h-full', progressColorClass)}
            style={{ width: `${percentage}%` }}
          />
        )}

        {/* Числовые значения */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
          <span className="text-white font-medium z-10 font-['Open_Sans',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
            {current}
            {showDiff && (
              <span className="ml-1">(-{difference})</span>
            )}
          </span>
          <span className="text-white font-medium z-10 font-['Open_Sans',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
            {target}
          </span>
        </div>
      </div>
    </div>
  );
};