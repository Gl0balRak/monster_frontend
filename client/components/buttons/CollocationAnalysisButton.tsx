import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface CollocationAnalysisButtonProps {
  pageUrl: string;
  mainQuery: string;
  additionalQueries?: string[];
  lsiResults?: any; // Добавляем LSI результаты
  onStart: () => void;
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const CollocationAnalysisButton: React.FC<CollocationAnalysisButtonProps> = ({
  pageUrl,
  mainQuery,
  additionalQueries = [],
  lsiResults,
  onStart,
  onSuccess,
  onError,
  disabled = false,
  className
}) => {
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Настройки анализа
  const [windowSize, setWindowSize] = useState(10);
  const [minFrequency, setMinFrequency] = useState(2);
  const [topN, setTopN] = useState(20);
  const [spacyModel, setSpacyModel] = useState('ru_core_news_sm'); // Обратно в нижний регистр
  const [showContexts, setShowContexts] = useState(true);
  const [useLsiWords, setUseLsiWords] = useState(true); // По умолчанию используем LSI слова

  // Извлекаем слова из LSI результатов
  const getLsiWords = () => {
    if (!lsiResults) return [];

    const words = [];

    // Добавляем униграммы (топ-8)
    if (lsiResults.unigrams && Array.isArray(lsiResults.unigrams)) {
      lsiResults.unigrams.slice(0, 8).forEach(item => {
        if (item && item.ngram && typeof item.ngram === 'string') {
          words.push(item.ngram.trim());
        }
      });
    }

    // Добавляем биграммы (топ-8)
    if (lsiResults.bigrams && Array.isArray(lsiResults.bigrams)) {
      lsiResults.bigrams.slice(0, 8).forEach(item => {
        if (item && item.ngram && typeof item.ngram === 'string') {
          words.push(item.ngram.trim());
        }
      });
    }

    // Можно добавить и триграммы (топ-4)
    if (lsiResults.trigrams && Array.isArray(lsiResults.trigrams)) {
      lsiResults.trigrams.slice(0, 4).forEach(item => {
        if (item && item.ngram && typeof item.ngram === 'string') {
          words.push(item.ngram.trim());
        }
      });
    }

    // Убираем дубликаты, пустые строки и ограничиваем до 20 элементов
    return [...new Set(words)].filter(word => word.length > 0).slice(0, 20);
  };

  const handleAnalysis = async () => {
    if (!pageUrl) {
      onError('Не указан URL страницы');
      return;
    }

    setLoading(true);
    onStart();

    try {
      // Определяем целевые фразы
      let targetPhrases = [];

      if (useLsiWords && lsiResults) {
        // Используем слова из LSI анализа
        targetPhrases = getLsiWords();
        console.log('🔍 Используем LSI слова для анализа:');
        console.log('Количество слов:', targetPhrases.length);
        console.log('Первые 5 слов:', targetPhrases.slice(0, 5));
        console.log('Все слова:', targetPhrases);
      } else {
        // Используем оригинальные запросы
        targetPhrases = [mainQuery, ...additionalQueries].filter(q => q);
        console.log('🔍 Используем оригинальные запросы:', targetPhrases);
      }

      // Проверка, что все элементы - строки и не пустые
      targetPhrases = targetPhrases.filter(phrase =>
        typeof phrase === 'string' && phrase.trim().length > 0
      ).map(phrase => phrase.trim());

      // Ограничиваем до 20 фраз максимум (требование сервера)
      if (targetPhrases.length > 20) {
        console.log(`⚠️ Слишком много фраз (${targetPhrases.length}), обрезаем до 20`);
        targetPhrases = targetPhrases.slice(0, 20);
      }

      if (targetPhrases.length === 0) {
        throw new Error('Не найдено слов для анализа. Проверьте наличие LSI результатов или укажите основной запрос.');
      }

      const requestData = {
        url: pageUrl,
        target_phrases: targetPhrases,
        window_size: windowSize,
        min_frequency: minFrequency,
        top_n: topN,
        spacy_model: spacyModel, // Это должно быть значение из enum SpacyModel
        show_contexts: showContexts
      };

      console.log('📊 Запуск анализа коллокаций:', requestData);

      const response = await fetch('http://localhost:3001/analyzer/collocation_analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      // Получаем тело ответа для отладки
      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Не удалось распарсить ответ:', responseText);
        throw new Error(`Некорректный ответ от сервера: ${responseText}`);
      }

      if (!response.ok) {
        console.error('Ошибка от сервера:', data);

        // Если detail - это массив (Pydantic validation errors)
        if (Array.isArray(data.detail)) {
          const errors = data.detail.map(err =>
            `${err.loc ? err.loc.join('.') : 'field'}: ${err.msg}`
          ).join('; ');
          console.error('Детали ошибок валидации:', data.detail);
          throw new Error(`Ошибки валидации: ${errors}`);
        }

        throw new Error(data.detail || data.error || `Ошибка анализа: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Неизвестная ошибка анализа');
      }

      console.log('✅ Анализ коллокаций завершён:', data);
      onSuccess(data);
      setShowSettings(false);

    } catch (error) {
      console.error('❌ Ошибка анализа коллокаций:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <button
          onClick={handleAnalysis}
          disabled={disabled || loading}
          className={cn(
            'px-6 py-3 rounded-md font-medium transition-colors',
            'bg-purple-600 text-white hover:bg-purple-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'inline-flex items-center justify-center gap-2',
            className
          )}
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin">⏳</span>
              <span>Анализ семантики...</span>
            </>
          ) : (
            <>
              <span>🔍</span>
              <span>Анализ коллокаций</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          title="Настройки анализа"
        >
          ⚙️
        </button>
      </div>

      {/* Панель настроек */}
      {showSettings && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[300px]">
          <h4 className="font-medium mb-3">Настройки анализа</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Размер окна контекста
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={windowSize}
                onChange={(e) => setWindowSize(Number(e.target.value))}
                className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Минимальная частота
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={minFrequency}
                onChange={(e) => setMinFrequency(Number(e.target.value))}
                className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Топ слов для показа
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Языковая модель
              </label>
              <select
                value={spacyModel}
                onChange={(e) => setSpacyModel(e.target.value)}
                className="w-full px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="ru_core_news_sm">Русский (маленькая)</option>
                <option value="ru_core_news_md">Русский (средняя)</option>
                <option value="ru_core_news_lg">Русский (большая)</option>
                <option value="en_core_web_sm">English (small)</option>
                <option value="en_core_web_md">English (medium)</option>
                <option value="en_core_web_lg">English (large)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showContexts"
                checked={showContexts}
                onChange={(e) => setShowContexts(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showContexts" className="text-sm text-gray-600">
                Показывать контексты
              </label>
            </div>

            {/* Опция использования LSI слов */}
            {lsiResults && (
              <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                <input
                  type="checkbox"
                  id="useLsiWords"
                  checked={useLsiWords}
                  onChange={(e) => setUseLsiWords(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="useLsiWords" className="text-sm font-medium text-purple-700">
                  Использовать слова из LSI анализа
                </label>
              </div>
            )}

            {/* Показываем какие слова будут использованы */}
            {useLsiWords && lsiResults && (
              <div className="mt-2 p-2 bg-gray-50 rounded max-h-32 overflow-y-auto">
                <div className="text-xs text-gray-600 mb-1">Будут проанализированы:</div>
                <div className="text-xs text-gray-800 space-y-1">
                  {getLsiWords().slice(0, 10).map((word, idx) => (
                    <span key={idx} className="inline-block bg-white px-2 py-1 rounded mr-1 mb-1">
                      {word}
                    </span>
                  ))}
                  {getLsiWords().length > 10 && (
                    <span className="text-gray-500">...и еще {getLsiWords().length - 10}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="mt-4 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm"
          >
            Закрыть
          </button>
        </div>
      )}
    </div>
  );
};