import React from 'react';
import { KeywordsComparisonTable } from '@/components/tables/KeywordsComparisonTable';

interface KeywordData {
  keyword: string;
  [key: string]: any; // Для динамических полей тегов
}

interface TotalWordsData {
  [key: string]: number;
}

type SearchEngine = 'google' | 'yandex' | string;

interface KeywordsResultsProps {
  keywordsData: KeywordData[] | null;
  keywordsTotalWords: TotalWordsData | null;
  searchEngine: SearchEngine;
  onBack: () => void;
}

export const KeywordsResults: React.FC<KeywordsResultsProps> = ({
  keywordsData,
  keywordsTotalWords,
  searchEngine,
  onBack
}) => {
  if (!keywordsData || keywordsData.length === 0) {
    return null;
  }

  const isGoogle = searchEngine === 'google';

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">
            Анализ ключевых слов по HTML-тегам
          </h2>
          {isGoogle && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Google анализ
            </span>
          )}
        </div>

        {isGoogle ? (
          <GoogleAnalysisDescription />
        ) : (
          <StandardAnalysisDescription />
        )}
      </div>

      <KeywordsComparisonTable
        data={keywordsData}
        totalWordsData={keywordsTotalWords}
        searchEngine={searchEngine}
        onBack={onBack}
      />
    </div>
  );
};

const GoogleAnalysisDescription: React.FC = () => (
  <div className="space-y-2 text-sm text-gray-600">
    <p className="mb-2">
      Для Google анализ упрощен и фокусируется на двух основных зонах:
    </p>
    <ul className="space-y-1">
      <li>
        • <strong>&lt;title&gt;</strong> — заголовок страницы, критически важен для ранжирования
      </li>
      <li>
        • <strong>&lt;all-text&gt;</strong> — весь остальной текстовый контент страницы
        (включая ссылки, текстовые фрагменты и основной контент)
      </li>
    </ul>
    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
      <p className="text-blue-800">
        💡 Google больше фокусируется на общей релевантности контента,
        чем на распределении по конкретным HTML-тегам
      </p>
    </div>
  </div>
);

const StandardAnalysisDescription: React.FC = () => (
  <div className="space-y-2 text-sm text-gray-600">
    <p className="mb-2">
      Таблица показывает распределение ключевых фраз по различным HTML-тегам страницы.
      Система автоматически генерирует все возможные комбинации слов из ваших запросов.
    </p>
    <ul className="space-y-1">
      <li>
        • <strong>Исходные запросы</strong> — точные вхождения основного и дополнительных запросов
      </li>
      <li>
        • <strong>Комбинации слов</strong> — все пары слов из запросов в разном порядке
      </li>
      <li>
        • <strong>Фразы со звездочкой (*)</strong> — любое слово вместо *, кроме слов из запросов
      </li>
      <li>
        • <strong>Фразы в [скобках]</strong> — словоформы, кроме тех, что есть в запросах
      </li>
      <li>
        • <strong>Отдельные слова</strong> — каждое уникальное слово из запросов
      </li>
      <li>
        • <strong>Комбинированные варианты</strong> — сочетания вышеперечисленных типов
      </li>
    </ul>
  </div>
);