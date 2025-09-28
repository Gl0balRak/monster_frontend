import { useState, useCallback } from 'react';

interface CollocationAnalysisState {
  loading: boolean;
  progress: number;
  results: any | null;
  error: string | null;
}

interface UseCollocationAnalysisReturn extends CollocationAnalysisState {
  startCollocationAnalysis: (
    pageUrl: string,
    mainQuery: string,
    additionalQueries: string[]
  ) => Promise<any>;
  resetCollocationResults: () => void;
  setCollocationResults: (results: any) => void;
}

export const useCollocationAnalysis = (): UseCollocationAnalysisReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCollocationAnalysis = useCallback(async (
    pageUrl: string,
    mainQuery: string,
    additionalQueries: string[] = []
  ) => {
    console.log('🔍 Начало анализа коллокаций', { pageUrl, mainQuery, additionalQueries });

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Имитация прогресса
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Подготовка данных для запроса
      const targetPhrases = [mainQuery, ...additionalQueries].filter(q => q);

      const requestData = {
        url: pageUrl,
        target_phrases: targetPhrases,
        window_size: 10,
        min_frequency: 2,
        top_n: 20,
        spacy_model: 'ru_core_news_sm',
        show_contexts: true
      };

      console.log('📤 Отправка запроса на анализ коллокаций:', requestData);

      const response = await fetch('http://localhost:3001/analyzer/collocation_analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Ошибка анализа: ${response.status}`);
      }

      console.log('✅ Анализ коллокаций завершён успешно:', data);

      setResults(data);
      setError(null);

      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('❌ Ошибка анализа коллокаций:', errorMessage);

      setError(errorMessage);
      setResults(null);

      throw err;

    } finally {
      setLoading(false);
      setProgress(0);
    }
  }, []);

  const resetCollocationResults = useCallback(() => {
    setResults(null);
    setError(null);
    setProgress(0);
    setLoading(false);
  }, []);

  const setCollocationResults = useCallback((newResults: any) => {
    setResults(newResults);
    setError(null);
  }, []);

  return {
    loading,
    progress,
    results,
    error,
    startCollocationAnalysis,
    resetCollocationResults,
    setCollocationResults
  };
};