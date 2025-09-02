/**
 * Design System Configuration
 * Централизованные константы для шрифтов, цветов и стилей
 */

// Цвета
export const colors = {
  // Основные цвета
  primary: {
    red: '#B50102',        // red-9
    redLight: '#FFF5F5',   // red-0
    redBorder: '#FFA8A8',  // red-3
    redError: '#F03E3E',   // red-7
  },
  
  // Серые цвета
  gray: {
    background: '#F8F9FA',  // gray-0
    light: '#F1F3F5',       // gray-1
    border: '#E9ECEF',      // gray-2
    medium: '#ADB5BD',      // gray-5
    text: '#868E96',        // Цвет иконок и второстепенного текста
  },
  
  // Базовые цвета
  base: {
    white: '#FFFFFF',
    black: '#222222',
    disabled: '#C1C2C5',
  }
} as const;

// Шрифты
export const fonts = {
  // Основное семейство шрифтов
  primary: "'Open Sans', -apple-system, Roboto, Helvetica, sans-serif",
  
  // Размеры шрифтов
  sizes: {
    xs: '11px',      // 11px - мелкий вспомогательный текст
    sm: '13px',      // 13px - обычный текст (основной)
    base: '15px',    // 15px - лейблы полей и форм
    lg: '18px',      // 18px - заголовки блоков и секций
    xl: '20px',      // 20px - большие заголовки
    '2xl': '24px',   // 24px - главные заголовки страниц
  },
  
  // Высота строк
  lineHeights: {
    tight: '18px',   // 150% от 12px
    normal: '24px',  // 150% от 16px
    relaxed: '26px', // 144% от 18px
  },
  
  // Вес шрифта
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
} as const;

// Отступы и размеры
export const spacing = {
  // Базовые отступы
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  
  // Размеры компонентов
  component: {
    headerHeight: '59px',
    sidebarWidth: '360px',
    inputHeight: '48px', // padding 12px + border
    buttonHeight: {
      medium: '40px',
      large: '48px',
    }
  }
} as const;

// Радиусы скругления
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
} as const;

// Тени
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const;

// Анимации
export const transitions = {
  fast: '0.15s ease-in-out',
  normal: '0.2s ease-in-out',
  slow: '0.3s ease-in-out',
} as const;

// CSS классы для частых комбинаций
export const commonClasses = {
  // Шрифт по умолчанию
  font: `font-['Open_Sans',_-apple-system,_Roboto,_Helvetica,_sans-serif]`,

  // Переходы
  transition: 'transition-colors duration-200 ease-in-out',

  // Фокус
  focus: 'focus:outline-none focus:ring-2 focus:ring-red-9 focus:ring-opacity-20',

  // Состояния кнопок
  buttonBase: 'inline-flex items-center justify-center gap-2 rounded border font-medium transition-colors',

  // Поля ввода
  inputBase: 'w-full px-4 py-3 rounded bg-gray-1 border-0 text-base placeholder:text-gray-5 text-black',
} as const;

// Типографика
export const typography = {
  // Заголовки блоков - самые крупные
  blockTitle: `text-lg font-bold text-black ${commonClasses.font}`,

  // Лейблы полей - средние
  fieldLabel: `text-base font-medium text-black ${commonClasses.font}`,

  // Обычный текст - мелкий
  bodyText: `text-sm font-normal text-black ${commonClasses.font}`,

  // Вспомогательный текст
  helperText: `text-xs font-normal text-gray-5 ${commonClasses.font}`,

  // Ссылки
  link: `text-sm font-normal text-red-9 hover:text-red-700 ${commonClasses.font}`,
} as const;

// Типизация для TypeScript
export type ColorKeys = keyof typeof colors;
export type FontSizes = keyof typeof fonts.sizes;
export type SpacingKeys = keyof typeof spacing;
