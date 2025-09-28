import React from "react";

// Утилита для классов (заглушка для cn)
const cn = (...classes) => classes.filter(Boolean).join(' ');

interface InputURLProps {
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
  autoProtocol?: boolean; // Новый проп для включения автоматического добавления протокола
}

export const InputURL: React.FC<InputProps> = ({
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
  autoProtocol = false, // По умолчанию выключено
}) => {

  // Функция для добавления протокола к URL
  const ensureProtocol = (url: string): string => {
    if (!url) return url;

    // Удаляем пробелы в начале и конце
    let trimmedUrl: string = url.trim();

    // Удаляем / на конце
    if (trimmedUrl.endsWith('/'))
      trimmedUrl = trimmedUrl.slice(0, trimmedUrl.length-1);

    // Проверяем, есть ли уже протокол
    const protocolRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
    if (protocolRegex.test(trimmedUrl)) {
      return trimmedUrl;
    }

    // Если URL начинается с //, добавляем https:
    if (trimmedUrl.startsWith('//')) {
      return `https:${trimmedUrl}`;
    }


    // Для localhost и IP адресов
    if (trimmedUrl.startsWith('localhost') || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(trimmedUrl)) {
      return `http://${trimmedUrl}`;
    }

    // По умолчанию добавляем https://
    return `https://${trimmedUrl}`;
  };

  // Обработчик изменения значения
  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  // Обработчик потери фокуса (blur) - добавляем протокол при выходе из поля
  const handleBlur = () => {
    if (type === "url" && autoProtocol && value) {
      const urlWithProtocol = ensureProtocol(value);
      if (urlWithProtocol !== value) {
        onChange?.(urlWithProtocol);
      }
    }
  };

  // Альтернативный вариант: обработка при нажатии Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && type === "url" && autoProtocol && value) {
      const urlWithProtocol = ensureProtocol(value);
      if (urlWithProtocol !== value) {
        onChange?.(urlWithProtocol);
      }
    }
    onKeyDown?.(e);
  };

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
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
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
