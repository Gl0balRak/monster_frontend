// client/config/api.config.js

// Используем import.meta.env для Vite вместо process.env
const AUTH_API_URL = 'http://127.0.0.1:3001';
const ANALYZER_API_URL = 'http://127.0.0.1:3001';
const PAYMENT_API_URL = 'http://127.0.0.1:3001';

export const API_ENDPOINTS = {
  // Auth endpoints (порт 1001)
  auth: {
    register: `${AUTH_API_URL}/auth/register`,
    login: `${AUTH_API_URL}/auth/login`,
    refresh: `${AUTH_API_URL}/auth/refresh`,
    logout: `${AUTH_API_URL}/auth/logout`,
    me: `${AUTH_API_URL}/auth/me`,
    changePassword: `${AUTH_API_URL}/auth/change-password`,
    availableServices: `${AUTH_API_URL}/auth/available_services`,
  },
  // Analyzer endpoints (порт 1002)
  analyzer: {
    base: `${ANALYZER_API_URL}/analyzer`,
    // Основной endpoint для запуска анализа
    start: `${ANALYZER_API_URL}/start`, // <-- ИСПРАВЛЕНО! Без /analyzer
    // Текстовый анализ
    analyzeATags: `${ANALYZER_API_URL}/analyzer/analyze-a-tags`,
    analyzeATagsProgress: `${ANALYZER_API_URL}/analyzer/analyze-a-tags-progress`,
    analyzeSinglePage: `${ANALYZER_API_URL}/analyzer/analyze-single-page`,
    // LSI анализ
    compareNgrams: `${ANALYZER_API_URL}/analyzer/ngrams/compare`,
    compareNgramsTable: `${ANALYZER_API_URL}/analyzer/ngrams/compare-table`,
    compareNgramsFiltered: `${ANALYZER_API_URL}/analyzer/ngrams/compare-table-filtered`,
    // Анализ ключевых слов
    keywordsAnalyzeFull: `${ANALYZER_API_URL}/analyzer/keywords/analyze-full`,
    countWordsAverage: `${ANALYZER_API_URL}/analyzer/keywords/count-words-average`,
    recalculate_src: `${ANALYZER_API_URL}/analyzer/recalculate-src`,
    recalculate_progress: `${ANALYZER_API_URL}/analyzer/recalculate-src-progress`,
  },
  payment: {
    create_payment: `${PAYMENT_API_URL}/payment/create_payment`,
    result: `${PAYMENT_API_URL}/payment/result`,
    success: `${PAYMENT_API_URL}/payment/success`,
    fail: `${PAYMENT_API_URL}/payment/fail`,
    tariffs: {
      list: `${PAYMENT_API_URL}/tariffs`,
      current: `${PAYMENT_API_URL}/tariffs/user`,
      change: `${PAYMENT_API_URL}/tariffs/change`,
    },
  },
  limits: {
    balance: `${PAYMENT_API_URL}/payment/balance`,
    transactionHistory: `${PAYMENT_API_URL}/payment/operations-log`
  }
};

export { AUTH_API_URL, ANALYZER_API_URL, PAYMENT_API_URL };
