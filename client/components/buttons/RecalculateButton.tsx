import React, { useState } from 'react';
import { API_ENDPOINTS } from '@/config/api.config';


interface RecalculateButtonProps {
  pageUrl?: string;
  competitorData?: any[];
  mainQuery?: string;
  additionalQueries?: string[];
  searchEngine?: string;
  medianMode?: boolean;
  lsiData?: any; // Добавляем LSI данные
  keywordsData?: any[]; // Добавляем Keywords данные
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  // Новый проп для управления плавающим режимом
  floating?: boolean;
}

export const RecalculateButton: React.FC<RecalculateButtonProps> = ({
  pageUrl,
  competitorData = [],
  mainQuery = '',
  additionalQueries = [],
  searchEngine = 'yandex',
  medianMode = false,
  lsiData = null,
  keywordsData = [],
  onSuccess,
  onError,
  disabled = false,
  floating = false // По умолчанию не плавающая
}) => {
  const [loading, setLoading] = useState(false);

  const handleRecalculate = async () => {
    console.log('🔄 Начинаем пересчёт метрик');

    // Проверка обязательных данных
    if (!pageUrl) {
      const error = 'Не указан URL страницы для пересчёта';
      console.error('❌', error);
      if (onError) onError(error);
      alert(error);
      return;
    }

    try {
      setLoading(true);

      // Подготовка данных для отправки
      const requestData = {
        my_url: pageUrl,  // Исправлено: было myUrl
        lsi_data: lsiData,
        keywords_data: keywordsData,
        search_engine: searchEngine,
        main_query: mainQuery,
        additional_queries: additionalQueries,
        competitor_urls: competitorData?.map(c => c.url || c) || []  // Исправлено: было competitorUrls
      };

      console.log('📤 Отправляем запрос на пересчёт:', requestData);

      // Используем относительный путь для API
      const response = await fetch(API_ENDPOINTS.analyzer.recalculate_src, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Если статус 422 - не удалось спарсить
        if (response.status === 422) {
          throw new Error('Не удалось спарсить страницу. Проверьте доступность сайта.');
        }
        throw new Error(data.detail || `Ошибка сервера: ${response.status}`);
      }

      console.log('✅ Пересчёт успешно завершён:', data);

      // Вызываем колбэк успеха
      if (data.success && onSuccess) {
        onSuccess(data);
      }

    } catch (error) {
      console.error('❌ Ошибка при пересчёте:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';

      if (onError) {
        onError(errorMessage);
      }

      alert(`Ошибка: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading;

  // Базовые стили для кнопки
  const baseStyles = `
    inline-flex items-center gap-3 px-6 py-3 rounded-lg font-medium
    transition-all duration-200 transform hover:scale-105
    ${isDisabled
      ? 'opacity-50 cursor-not-allowed bg-gray-100 border-2 border-gray-300 text-gray-500'
      : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
    }
  `;

  // Дополнительные стили для плавающей кнопки
  const floatingStyles = floating ? 'fixed bottom-6 right-6 z-50' : 'relative';

  return (
    <button
      onClick={handleRecalculate}
      disabled={isDisabled}
      className={`${baseStyles} ${floatingStyles}`}
      title={isDisabled ? 'Кнопка недоступна' : 'Пересчитать метрики для вашего сайта'}
    >
      <span className={loading ? 'animate-spin' : ''}>
        {loading ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )}
      </span>
      <span>{loading ? 'Пересчёт...' : 'Пересчитать мой сайт'}</span>
    </button>
  );
};

export default RecalculateButton;