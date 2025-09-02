import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  required?: boolean;
  allowCustomValue?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Выберите...',
  value,
  onChange,
  options,
  className,
  required = false,
  allowCustomValue = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Находим label для текущего значения
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : value;

  // Фильтрация опций при изменении поискового запроса
  useEffect(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchValue, options]);

  // Закрытие dropdown при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Обработка открытия dropdown
  const handleInputClick = () => {
    setIsOpen(true);
    setSearchValue('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Обработка выбора опции
  const handleSelectOption = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchValue('');
  };

  // Обработка ввода в поле поиска
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);

    // Если разрешены произвольные значения, обновляем значение
    if (allowCustomValue) {
      onChange(newValue);
    }
  };

  // Обработка нажатия Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // Если есть отфильтрованные опции, выбираем первую
      if (filteredOptions.length > 0) {
        handleSelectOption(filteredOptions[0]);
      } else if (allowCustomValue && searchValue) {
        // Если разрешены произвольные значения, используем введенный текст
        onChange(searchValue);
        setIsOpen(false);
        setSearchValue('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchValue('');
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)} ref={containerRef}>
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
        {/* Поле ввода / отображения */}
        {!isOpen ? (
          <div
            onClick={handleInputClick}
            className={cn(
              'w-full px-4 py-3 rounded-lg text-base',
              'bg-white border border-gray-300',
              'cursor-pointer transition-all duration-200',
              'hover:border-gray-400',
              'flex items-center justify-between',
              'font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]',
              'focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500'
            )}
            tabIndex={0}
            onFocus={handleInputClick}
          >
            <span className={cn(
              displayValue ? 'text-gray-900' : 'text-gray-500'
            )}>
              {displayValue || placeholder}
            </span>
            <svg
              className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              'w-full px-4 py-3 rounded-lg text-base',
              'bg-white border border-red-500 ring-1 ring-red-500',
              'text-gray-900 placeholder:text-gray-500',
              'font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]',
              'focus:outline-none',
              'transition-all duration-200'
            )}
          />
        )}

        {/* Dropdown с опциями */}
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 w-full mt-1 bg-white border border-gray-200',
              'rounded-lg shadow-lg max-h-60 overflow-auto'
            )}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelectOption(option)}
                  className={cn(
                    'px-4 py-2.5 cursor-pointer hover:bg-gray-50',
                    'transition-colors duration-150',
                    'text-base text-gray-900',
                    'font-[\'Open_Sans\',_-apple-system,_Roboto,_Helvetica,_sans-serif]',
                    option.value === value && 'bg-red-50 text-red-600 font-medium'
                  )}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-2.5 text-gray-500 text-base font-['Open_Sans',_-apple-system,_Roboto,_Helvetica,_sans-serif]">
                {allowCustomValue ?
                  'Нет совпадений. Нажмите Enter для использования введенного значения' :
                  'Ничего не найдено'
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};