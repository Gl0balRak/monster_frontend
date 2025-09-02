import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Импорт файлов переводов
import ru from './locales/ru.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector) // автодетект языка браузера
  .use(initReactI18next) // связка с React
  .init({
    fallbackLng: 'ru', // язык по умолчанию
    debug: process.env.NODE_ENV === 'development',

    // Ресурсы переводов
    resources: {
      ru: {
        translation: ru
      },
      en: {
        translation: en
      }
    },

    interpolation: {
      escapeValue: false, // React уже защищает от XSS
    },

    // Настройки детектора языка
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;