import React, {useState, useMemo} from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from '@/lib/utils';
import { ProgressIndicator } from "@/components/progress_bars/ProgressIndicator";

interface CompetitorResult {
  url: string;
  word_count_in_a?: number;
  word_count_outside_a?: number;
  text_fragments_count?: number;
  total_visible_words?: number;
}

interface SiteAnalysis {
  word_count_in_a?: number;
  word_count_outside_a?: number;
  text_fragments_count?: number;
  total_visible_words?: number;
}

interface ComparisonTableProps {
  results: CompetitorResult[];
  selectedCompetitors: string[];
  mySiteAnalysis: SiteAnalysis | null;
  medianMode: boolean;
  onGoToLSI: () => void;
  lsiLoading: boolean;
  lsiProgress: number;
}

type SortField = "url" | "word_count_in_a" | "word_count_outside_a" | "text_fragments_count" | "total_visible_words";
type SortDirection = "asc" | "desc" | "none";

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  results,
  selectedCompetitors,
  mySiteAnalysis,
  medianMode,
  onGoToLSI,
  lsiLoading,
  lsiProgress
}) => {

  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({ field: "total_visible_words", direction: "desc" });

  if (!selectedCompetitors.length || !mySiteAnalysis || !results) {
    return null;
  }

  const selectedResults = results.filter(result => 
    selectedCompetitors.includes(result.url)
  );
  
  if (selectedResults.length === 0) return null;

  const sortedResults = useMemo(() => {
    if (sortConfig.direction === "none") return selectedResults;

    const sortableData = [...selectedResults];
    
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
  }, [selectedResults, sortConfig]);

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

  // Функции для расчета медианы и среднего
  const calculateMedian = (values: number[]): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  };

  const calculateAverage = (values: number[]): number => {
    if (values.length === 0) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  // Собираем массивы значений
  const inAValues = selectedResults.map(r => r.word_count_in_a || 0);
  const outsideAValues = selectedResults.map(r => r.word_count_outside_a || 0);
  const fragmentsValues = selectedResults.map(r => r.text_fragments_count || 0);
  const totalValues = selectedResults.map(r => r.total_visible_words || 0);

  // Расчет целевых значений в зависимости от режима
  const targetInA = medianMode
    ? calculateMedian(inAValues)
    : calculateAverage(inAValues);

  const targetOutsideA = medianMode
    ? calculateMedian(outsideAValues)
    : calculateAverage(outsideAValues);

  const targetFragments = medianMode
    ? calculateMedian(fragmentsValues)
    : calculateAverage(fragmentsValues);

  const targetTotal = medianMode
    ? calculateMedian(totalValues)
    : calculateAverage(totalValues);

  const ourInA = mySiteAnalysis.word_count_in_a || 0;
  const ourOutsideA = mySiteAnalysis.word_count_outside_a || 0;
  const ourFragments = mySiteAnalysis.text_fragments_count || 0;
  const ourTotal = mySiteAnalysis.total_visible_words || 0;

  const getDomainFromUrl = (url: string): string => {
    return url
      .replace('https://', '')
      .replace('http://', '')
      .split('/')[0];
  };

  return (
    <div className="mt-8 bg-white rounded-lg border">
      <div className="p-4 border-b bg-gray-50 relative min-h-[64px] flex items-center">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium">Этап оптимизации</h3>
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
          <p className="text-sm text-gray-600">
            Не стремитесь сразу сделать 100%, чтобы осталось место для добавления слов, задающих тематику (LSI)
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-800 text-white">
                <th 
                  className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-gray-700 transition-colors"
                  style={{ width: '200px' }}
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
                  style={{ width: '150px' }}
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
                  style={{ width: '180px' }}
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
                  style={{ width: '180px' }}
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
                  style={{ width: '200px' }}
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
              <tr className="border-b bg-blue-50">
                <td className="py-3 px-4 text-sm font-medium text-blue-800">
                  Наш сайт
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium text-blue-800">
                  {ourInA}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium text-blue-800">
                  {ourOutsideA}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium text-blue-800">
                  {ourFragments}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium text-blue-800">
                  {ourTotal}
                </td>
              </tr>

              {sortedResults.map((result, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 whitespace-nowrap overflow-hidden text-ellipsis block max-w-xs"
                      title={result.url}
                    >
                      {getDomainFromUrl(result.url)}
                    </a>
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

              <tr className="border-b bg-gray-100">
                <td className="py-3 px-4 text-sm font-medium">
                  {medianMode ? 'Медиана' : 'Среднее'}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium">
                  {targetInA}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium">
                  {targetOutsideA}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium">
                  {targetFragments}
                </td>
                <td className="py-3 px-4 text-center text-sm font-medium">
                  {targetTotal}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Progress Indicators под соответствующими столбцами */}
          <table className="w-full mt-4">
            <tbody>
              <tr>
                <td style={{ width: '200px' }}></td>
                <td style={{ width: '150px' }} className="text-center px-2">
                  <div className="text-xs text-gray-500 mb-1">Слова в теге &lt;a&gt;</div>
                  <ProgressIndicator
                    current={ourInA}
                    target={targetInA}
                    showDifference={true}
                  />
                </td>
                <td style={{ width: '180px' }} className="text-center px-2">
                  <div className="text-xs text-gray-500 mb-1">Слова вне тега &lt;a&gt;</div>
                  <ProgressIndicator
                    current={ourOutsideA}
                    target={targetOutsideA}
                    showDifference={true}
                  />
                </td>
                <td style={{ width: '180px' }} className="text-center px-2">
                  <div className="text-xs text-gray-500 mb-1">Текстовые фрагменты</div>
                  <ProgressIndicator
                    current={ourFragments}
                    target={targetFragments}
                    showDifference={true}
                  />
                </td>
                <td style={{ width: '200px' }} className="text-center px-2">
                  <div className="text-xs text-gray-500 mb-1">Общее количество слов</div>
                  <ProgressIndicator
                    current={ourTotal}
                    target={targetTotal}
                    showDifference={true}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <button
            onClick={onGoToLSI}
            disabled={lsiLoading || lsiProgress > 0}
            className={cn(
              'px-6 py-3 rounded-md font-medium transition-colors',
              'bg-red-600 text-white hover:bg-red-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'inline-flex items-center justify-center gap-2'
            )}
          >
            {lsiLoading || lsiProgress > 0 ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                <span>Анализ LSI...</span>
              </>
            ) : (
              'Перейти к LSI'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};