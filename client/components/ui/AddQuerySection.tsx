import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { commonClasses } from '@/lib/design-system';
import { Input } from '@/components/forms';
import { Button } from '@/components/buttons';

interface AddQuerySectionProps {
  label?: string;
  maxCount?: number;
  buttonText?: string;
  placeholder?: string;
  onChange?: (queries: string[]) => void;
  initialQueries?: string[];
  className?: string;
  labelClassName?: string;
  buttonClassName?: string;
}

export const AddQuerySection: React.FC<AddQuerySectionProps> = ({
  label = 'Дополнительные запросы',
  maxCount = 5,
  buttonText = '+ Добавить запрос',
  placeholder = 'Введите запрос',
  onChange,
  initialQueries = [],
  className,
  labelClassName,
  buttonClassName,
}) => {
  const [queries, setQueries] = useState<string[]>(initialQueries);

  const showButton = queries.length < maxCount;
  const countText = maxCount ? ` (до ${maxCount} шт)` : '';

  // Добавление нового запроса
  const addQuery = () => {
    const newQueries = [...queries, ''];
    setQueries(newQueries);
    onChange?.(newQueries);
  };

  // Обновление запроса по индексу
  const updateQuery = (index: number, value: string) => {
    const newQueries = [...queries];
    newQueries[index] = value;
    setQueries(newQueries);
    onChange?.(newQueries);
  };

  // Удаление запроса
  const removeQuery = (index: number) => {
    const newQueries = queries.filter((_, i) => i !== index);
    setQueries(newQueries);
    onChange?.(newQueries);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Заголовок и кнопка добавления */}
      <div className="space-y-2">
        <label
          className={cn(
            'block text-sm font-medium text-gray-700',
            commonClasses.font,
            labelClassName
          )}
        >
          {label}{countText}
        </label>

        {showButton && (
          <button
            onClick={addQuery}
            className={cn(
              'text-red-600 hover:text-red-700 text-sm transition-colors duration-200',
              'inline-flex items-center gap-1',
              commonClasses.font,
              buttonClassName
            )}
            type="button"
          >
            {buttonText}
          </button>
        )}
      </div>

      {/* Список запросов */}
      {queries.length > 0 && (
        <div className="space-y-2">
          {queries.map((query, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder={`${placeholder} ${index + 1}`}
                value={query}
                onChange={(value) => updateQuery(index, value)}
              />
              <Button
                variant="outline"
                onClick={() => removeQuery(index)}
                className="px-3 py-2 text-red-600 hover:text-red-700 whitespace-nowrap"
              >
                Удалить
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};