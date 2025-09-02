import React from 'react';
import { cn } from '@/lib/utils';

interface CompetitorResult {
  url: string;
  word_count_in_a?: number;
  word_count_outside_a?: number;
  text_fragments_count?: number;
  total_visible_words?: number;
  parsed_from?: 'saved_copy' | string;
  fallback_used?: boolean;
}

interface MySiteAnalysis {
  word_count_in_a?: number;
  word_count_outside_a?: number;
  text_fragments_count?: number;
  total_visible_words?: number;
}

interface ResultsTableProps {
  results: CompetitorResult[] | null;
  mySiteAnalysis?: MySiteAnalysis | null;
  selectedCompetitors: string[];
  onToggleCompetitor: (url: string) => void;
  onSelectAll: () => void;
  filteredCount?: number;
  parseSavedCopies?: boolean;
  additionalUrl: string;
  setAdditionalUrl: (url: string) => void;
  onAddUrl: () => void;
  addingUrl: boolean;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  mySiteAnalysis,
  selectedCompetitors,
  onToggleCompetitor,
  onSelectAll,
  filteredCount = 0,
  parseSavedCopies = false,
  additionalUrl,
  setAdditionalUrl,
  onAddUrl,
  addingUrl
}) => {
  if (!results) return null;

  const hasResults = results.length > 0 || !!mySiteAnalysis;
  const totalCount = (results?.length || 0) + (mySiteAnalysis ? 1 : 0);

  const getResultsCountText = () => {
    if (totalCount === 0) return ' результат';
    if (totalCount < 5) return ' результата';
    return ' результатов';
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onAddUrl();
    }
  };

  return (
    <div className="mt-8 bg-white rounded-lg border">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Сайты-конкуренты</h3>
          <div className="text-sm text-gray-600">
            {totalCount}
            {getResultsCountText()}
            {filteredCount > 0 && (
              <span className="ml-2 text-orange-600">
                (отфильтровано площадок: {filteredCount})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!hasResults ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">Результаты не найдены</p>
            <p className="text-sm">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <>
            {/* Actions Bar */}
            <div className="mb-4 flex justify-between items-center">
              <button
                onClick={onSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {results && selectedCompetitors.length === results.length
                  ? 'Снять все'
                  : 'Выбрать все'}
              </button>

              {parseSavedCopies && results && results.some(r => r.parsed_from === 'saved_copy') && (
                <div className="text-sm text-gray-600 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <span>📋</span>
                    <span>- из сохраненной копии</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>↩️</span>
                    <span>- использован резервный URL</span>
                  </span>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-800 text-white">
                    <th className="text-left py-3 px-4 font-medium w-12">
                      <Checkbox
                        checked={!!results && results.length > 0 && selectedCompetitors.length === results.length}
                        onChange={onSelectAll}
                        variant="table-header"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium min-w-[300px]">
                      Конкурент
                    </th>
                    <th className="text-center py-3 px-4 font-medium min-w-[140px]">
                      Слова в теге &lt;a&gt;
                    </th>
                    <th className="text-center py-3 px-4 font-medium min-w-[160px]">
                      Слова вне тега &lt;a&gt;
                    </th>
                    <th className="text-center py-3 px-4 font-medium min-w-[150px]">
                      Текстовые фрагменты
                    </th>
                    <th className="text-center py-3 px-4 font-medium min-w-[180px]">
                      Общее количество слов
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Our Site Row */}
                  {mySiteAnalysis && (
                    <tr className="border-b bg-blue-50">
                      <td className="py-3 px-4">{/* Empty cell for checkbox */}</td>
                      <td className="py-3 px-4 text-sm font-medium text-blue-800">
                        Наш сайт
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium text-blue-800">
                        {mySiteAnalysis.word_count_in_a || 0}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium text-blue-800">
                        {mySiteAnalysis.word_count_outside_a || 0}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium text-blue-800">
                        {mySiteAnalysis.text_fragments_count || 0}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium text-blue-800">
                        {mySiteAnalysis.total_visible_words || 0}
                      </td>
                    </tr>
                  )}

                  {/* Competitor Rows */}
                  {results?.map((result, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedCompetitors.includes(result.url)}
                          onChange={() => onToggleCompetitor(result.url)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-md">
                          <div className="flex items-center gap-2">
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis block transition-colors"
                              title={result.url}
                            >
                              {result.url && result.url.length > 70
                                ? `${result.url.substring(0, 70)}...`
                                : result.url}
                            </a>
                            {result.parsed_from === 'saved_copy' && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800"
                                title="Данные из сохраненной копии"
                              >
                                📋
                              </span>
                            )}
                            {result.fallback_used && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800"
                                title="Использован резервный URL"
                              >
                                ↩️
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-sm">
                        {result.word_count_in_a || 0}
                      </td>
                      <td className="py-3 px-4 text-center text-sm">
                        {result.word_count_outside_a || 0}
                      </td>
                      <td className="py-3 px-4 text-center text-sm">
                        {result.text_fragments_count || 0}
                      </td>
                      <td className="py-3 px-4 text-center text-sm">
                        {result.total_visible_words || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Additional URLs Section */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Дополнительные URL-ы
              </h4>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={additionalUrl}
                  onChange={(e) => setAdditionalUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="https://example.com"
                  className={cn(
                    "flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-red-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  disabled={addingUrl}
                />
                <button
                  onClick={onAddUrl}
                  disabled={addingUrl || !additionalUrl.trim()}
                  className={cn(
                    "bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium min-w-[100px]",
                    "hover:bg-red-700 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {addingUrl ? (
                    <>
                      <span className="inline-block animate-spin mr-1">⏳</span>
                      Анализ...
                    </>
                  ) : (
                    'Добавить'
                  )}
                </button>
              </div>
              {addingUrl && (
                <p className="text-xs text-gray-500 mt-2">
                  Анализируем страницу, подождите...
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Simple Checkbox component (can be moved to a separate file)
interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  variant?: 'default' | 'table-header';
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  variant = 'default'
}) => {
  const id = React.useId();

  return (
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        id={id}
      />
      <label
        htmlFor={id}
        className={cn(
          "w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center transition-colors",
          checked
            ? "bg-red-600 border-red-600"
            : "bg-white border-gray-300 hover:border-red-400"
        )}
      >
        {checked && (
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </label>
    </div>
  );
};