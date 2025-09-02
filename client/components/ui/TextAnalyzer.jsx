// client/components/analyzer/TextAnalyzer.jsx

import React, { useState } from 'react';
import analyzerService from '../../services/analyzer.service';
import { useAuth } from '../../hooks/useAuth';

const TextAnalyzer = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    page_url: '',
    main_query: '',
    additional_queries: [],
    search_engine: 'yandex',
    region: '213',
    top_size: 10,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAnalyze = async () => {
    if (!isAuthenticated) {
      setError('Необходима авторизация');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(null);
    setResults(null);

    try {
      const result = await analyzerService.analyzePageWithProgress(
        formData,
        (progressData) => {
          // Обработка прогресса
          setProgress(progressData);
          console.log('Progress:', progressData);
        }
      );

      setResults(result);
      console.log('Analysis complete:', result);
    } catch (err) {
      setError(err.message || 'Ошибка анализа');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-analyzer p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Анализ текста страницы</h2>

      {/* Форма ввода */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            URL страницы для анализа:
          </label>
          <input
            type="url"
            name="page_url"
            value={formData.page_url}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Основной поисковый запрос:
          </label>
          <input
            type="text"
            name="main_query"
            value={formData.main_query}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="продвижение сайта"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Поисковая система:
          </label>
          <select
            name="search_engine"
            value={formData.search_engine}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="yandex">Яндекс</option>
            <option value="google">Google</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Количество конкурентов (TOP):
          </label>
          <input
            type="number"
            name="top_size"
            value={formData.top_size}
            onChange={handleInputChange}
            min="1"
            max="50"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      {/* Кнопка запуска */}
      <button
        onClick={handleAnalyze}
        disabled={loading || !formData.main_query}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Анализ...' : 'Начать анализ'}
      </button>

      {/* Отображение ошибки */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Отображение прогресса */}
      {progress && (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h3 className="font-semibold mb-2">Прогресс анализа:</h3>
          <div className="text-sm">
            {progress.type === 'stage_start' && (
              <p>Начало этапа: {progress.stage}</p>
            )}
            {progress.type === 'url_success' && (
              <p>✓ Обработан URL: {progress.url}</p>
            )}
            {progress.type === 'lsi_complete' && (
              <p>✓ LSI анализ завершен: найдено {progress.ngrams_count} n-грамм</p>
            )}
            {progress.progress_percent !== undefined && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress.progress_percent}%` }}
                  />
                </div>
                <span className="text-xs">{progress.progress_percent}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Отображение результатов */}
      {results && (
        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <h3 className="font-semibold mb-2">Результаты анализа:</h3>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TextAnalyzer;