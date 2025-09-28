import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
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

type SortField = "url" | "word_count_in_a" | "word_count_outside_a" | "text_fragments_count" | "total_visible_words";
type SortDirection = "asc" | "desc" | "none";

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
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({ field: "total_visible_words", direction: "desc" });

  const sortedResults = useMemo(() => {
    if (!results) return null;
    if (sortConfig.direction === "none") return results;

    const sortableData = [...results];
    
    return sortableData.sort((a, b) => {
      let aValue: any = a[sortConfig.field];
      let bValue: any = b[sortConfig.field];

      let result = 0;

      if (sortConfig.field === "url") {
        aValue = aValue || '';
        bValue = bValue || '';
        result = aValue.localeCompare(bValue, 'ru');
      } else {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
        result = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }

      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [results, sortConfig]);

  const handleSortClick = (field: SortField) => {
    setSortConfig(prev => {
      if (prev.field !== field) {
        return { field, direction: "desc" };
      }
      switch (prev.direction) {
        case "none": return { field, direction: "asc" };
        case "asc": return { field, direction: "desc" };
        case "desc": return { field, direction: "none" };
        default: return { field, direction: "desc" };
      }
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    
    switch (sortConfig.direction) {
      case "asc": return <ChevronUp className="w-4 h-4 text-blue-600" />;
      case "desc": return <ChevronDown className="w-4 h-4 text-blue-600" />;
      case "none": return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
      default: return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSortTooltip = (field: SortField) => {
    if (sortConfig.field !== field) {
      return "Нажмите для сортировки";
    }
    
    switch (sortConfig.direction) {
      case "asc": return "Сортировка по возрастанию. Нажмите для сортировки по убыванию";
      case "desc": return "Сортировка по убыванию. Нажмите чтобы убрать сортировку";
      case "none": return "Сортировка отключена. Нажмите для сортировки по возрастанию";
      default: return "Нажмите для сортировки";
    }
  };

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
      <div className="p-4 border-b bg-gray-50 relative min-h-[64px] flex items-center">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium">Сайты-конкуренты</h3>
            {sortConfig.direction !== "none" && (
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Сортировка: {sortConfig.field === "url" ? "по URL" : 
                            sortConfig.field === "word_count_in_a" ? "по словам в теге <a>" :
                            sortConfig.field === "word_count_outside_a" ? "по словам вне тега <a>" :
                            sortConfig.field === "text_fragments_count" ? "по текстовым фрагментам" : 
                            "по общему количеству слов"} 
                ({sortConfig.direction === "asc" ? "↑ возр." : "↓ убыв."})
              </span>
            )}
          </div>
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
                    <span>- из сохранённой копии</span>
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
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-12" />
                  <col className="min-w-[300px]" />
                  <col className="min-w-[140px]" />
                  <col className="min-w-[160px]" />
                  <col className="min-w-[150px]" />
                  <col className="min-w-[180px]" />
                </colgroup>
                <thead>
                  <tr className="border-b bg-gray-800 text-white">
                    <th className="text-left py-3 px-4 font-medium w-12"></th>
                    <th 
                      className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSortClick('url')}
                      title={getSortTooltip('url')}
                    >
                      <div className="flex items-center gap-2 truncate">
                        Конкурент
                        {getSortIcon('url')}
                      </div>
                    </th>
                    <th 
                      className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSortClick('word_count_in_a')}
                      title={getSortTooltip('word_count_in_a')}
                    >
                      <div className="flex items-center gap-2 justify-center truncate">
                        Слова в теге &lt;a&gt;
                        {getSortIcon('word_count_in_a')}
                      </div>
                    </th>
                    <th 
                      className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSortClick('word_count_outside_a')}
                      title={getSortTooltip('word_count_outside_a')}
                    >
                      <div className="flex items-center gap-2 justify-center truncate">
                        Слова вне тега &lt;a&gt;
                        {getSortIcon('word_count_outside_a')}
                      </div>
                    </th>
                    <th 
                      className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSortClick('text_fragments_count')}
                      title={getSortTooltip('text_fragments_count')}
                    >
                      <div className="flex items-center gap-2 justify-center truncate">
                        Текстовые фрагменты
                        {getSortIcon('text_fragments_count')}
                      </div>
                    </th>
                    <th 
                      className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-gray-700 transition-colors"
                      onClick={() => handleSortClick('total_visible_words')}
                      title={getSortTooltip('total_visible_words')}
                    >
                      <div className="flex items-center gap-2 justify-center truncate">
                        Общее количество слов
                        {getSortIcon('total_visible_words')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mySiteAnalysis && (
                    <tr key="our-site" className="border-b hover:bg-gray-50 transition-colors">
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

                  {sortedResults?.map((result, index) => (
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
                                title="Данные из сохранённой копии"
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