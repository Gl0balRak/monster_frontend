import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface CollocationAnalysisButtonProps {
  pageUrl: string;
  competitorUrls?: string[];  // Новое: URL конкурентов
  mainQuery: string;
  additionalQueries?: string[];
  lsiResults?: any;
  onStart: () => void;
  onSuccess: (data: any, originalPhrases: string[]) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export const CollocationAnalysisButton: React.FC<CollocationAnalysisButtonProps> = ({
  pageUrl,
  competitorUrls = [],
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
  const [spacyModel, setSpacyModel] = useState('ru_core_news_sm');
  const [showContexts, setShowContexts] = useState(true);
  const [useLsiWords, setUseLsiWords] = useState(false);
  const [includeCompetitors, setIncludeCompetitors] = useState(true); // Новое: включать ли конкурентов
  const [aggregateMode, setAggregateMode] = useState('combined'); // Новое: режим агрегации

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
      } else {
        // Используем оригинальные запросы (по умолчанию)
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
        throw new Error('Не найдено слов для анализа. Укажите основной запрос или дополнительные запросы.');
      }

      // Сохраняем оригинальный список фраз для отслеживания
      const originalPhrases = [...targetPhrases];

      // Формируем список URL для анализа
      const urlsToAnalyze = [pageUrl];
      if (includeCompetitors && competitorUrls && competitorUrls.length > 0) {
        urlsToAnalyze.push(...competitorUrls);
        console.log('📊 Анализ с конкурентами:', urlsToAnalyze);
      } else {
        console.log('📊 Анализ только нашего сайта:', pageUrl);
      }

      const requestData: any = {
        target_phrases: targetPhrases,
        window_size: windowSize,
        min_frequency: minFrequency,
        top_n: topN,
        spacy_model: spacyModel,
        show_contexts: showContexts ? 3 : 0,
        aggregate_mode: aggregateMode
      };

      // Добавляем URLs или URL в зависимости от количества
      if (urlsToAnalyze.length > 1) {
        // Множественный анализ - используем urls
        requestData.urls = urlsToAnalyze;
      } else {
        // Одиночный анализ - используем url для обратной совместимости
        requestData.url = urlsToAnalyze[0];
      }

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

      // Передаем и данные, и оригинальный список фраз
      onSuccess(data, originalPhrases);
      setShowSettings(false);

    } catch (error) {
      console.error('❌ Ошибка анализа коллокаций:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Подсчет количества сайтов для анализа
  const sitesCount = includeCompetitors && competitorUrls ? competitorUrls.length + 1 : 1;

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
              <svg 
                className="w-5 h-5 animate-spin" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                  className="opacity-25"
                ></circle>
                <path 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  className="opacity-75"
                ></path>
              </svg>
              <span>Анализ семантики...</span>
            </>
          ) : (
            <>
              <svg 
                className="w-5 h-5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>Анализ коллокаций</span>
              {sitesCount > 1 && (
                <span className="ml-1 px-2 py-0.5 bg-purple-500 rounded text-xs">
                  {sitesCount} сайтов
                </span>
              )}
            </>
          )}
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-3 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          title="Настройки анализа"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </button>
      </div>

      {/* Панель настроек */}
      {showSettings && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[350px] max-h-[600px] overflow-y-auto z-50">
          <h4 className="font-medium mb-3">Настройки анализа</h4>

          <div className="space-y-3">
            {/* Настройка включения конкурентов */}
            {competitorUrls && competitorUrls.length > 0 && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="includeCompetitors"
                    checked={includeCompetitors}
                    onChange={(e) => setIncludeCompetitors(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="includeCompetitors" className="text-sm font-medium text-blue-900">
                    Анализировать с конкурентами ({competitorUrls.length} сайтов)
                  </label>
                </div>
                {includeCompetitors && (
                  <>
                    <div className="text-xs text-blue-700 mb-2">
                      Будет проанализирован ваш сайт + {competitorUrls.length} конкурентов
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs text-blue-700 mb-1">
                        Режим объединения результатов:
                      </label>
                      <select
                        value={aggregateMode}
                        onChange={(e) => setAggregateMode(e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="combined">Объединенный (общая статистика)</option>
                        <option value="separate">Раздельный (по каждому сайту)</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}

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
              <div className="border-t pt-3 mt-3">
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

                {/* Показываем какие слова будут использованы */}
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600 mb-1">
                    {useLsiWords ? 'Будут использованы слова из LSI:' : 'Будут использованы запросы:'}
                  </div>
                  <div className="text-xs text-gray-800 space-y-1 max-h-32 overflow-y-auto">
                    {useLsiWords ? (
                      <>
                        {getLsiWords().slice(0, 10).map((word, idx) => (
                          <span key={idx} className="inline-block bg-white px-2 py-1 rounded mr-1 mb-1">
                            {word}
                          </span>
                        ))}
                        {getLsiWords().length > 10 && (
                          <span className="text-gray-500 block mt-1">
                            ...и еще {getLsiWords().length - 10}
                          </span>
                        )}
                      </>
                    ) : (
                      [mainQuery, ...additionalQueries].filter(q => q).map((query, idx) => (
                        <span key={idx} className="inline-block bg-white px-2 py-1 rounded mr-1 mb-1">
                          {query}
                        </span>
                      ))
                    )}
                  </div>
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