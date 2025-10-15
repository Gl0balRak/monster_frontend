import React from "react";
import { cn } from "@/lib/utils";
import { LSITable } from "@/components/tables/LSITable";

interface LSIDisplayItem {
  phrase: string;
  count: number;
  competitors_count: number;
  our_count?: number;
  difference?: number;
  target?: number;
}

// Импортируем LSIItem из LSITable для совместимости
interface LSITableItem {
  ngram: string;
  forms?: string[];
  competitors: number;
  avg_count: number;
  my_count: number;
  coverage_percent: number;
}

interface LSIData {
  unigrams?: LSITableItem[];
  bigrams?: LSITableItem[];
  trigrams?: LSITableItem[];
}

interface CompetitorResult {
  url: string;
  [key: string]: any;
}

interface SiteAnalysis {
  [key: string]: any;
}

interface LSIResultsProps {
  lsiResults: LSIData | null;
  selectedCompetitors: string[];
  mySiteAnalysis: SiteAnalysis | null;
  results: CompetitorResult[] | null;
  medianMode: boolean;
  onKeywordsAnalysis: () => void;
  keywordsLoading: boolean;
  keywordsProgress: number;
}

export const LSIResults: React.FC<LSIResultsProps> = ({
  lsiResults,
  selectedCompetitors,
  mySiteAnalysis,
  results,
  medianMode,
  onKeywordsAnalysis,
  keywordsLoading,
  keywordsProgress,
}) => {
  if (
    !lsiResults ||
    selectedCompetitors.length === 0 ||
    !mySiteAnalysis ||
    !results
  ) {
    return null;
  }

  const isLoading = keywordsLoading || keywordsProgress > 0;

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Оптимизация слов задающих тематику (LSI)
        </h2>
        <p className="text-gray-600 mb-6">
          Анализ показывает тематически важные фразы, которые используют
          конкуренты. Фразы сгруппированы по смыслу, общесайтовый мусор
          отфильтрован.
          {medianMode && (
            <span className="block mt-2 text-sm text-gray-500">
              Используется усеченное среднее для более точного расчета целевых
              значений.
            </span>
          )}
        </p>
      </div>

      {/* Биграммы */}
      {lsiResults.bigrams && lsiResults.bigrams.length > 0 && (
        <LSITable
          title="Биграммы (пары слов)"
          data={lsiResults.bigrams}
          itemsPerPage={15}
        />
      )}

      {/* Униграммы */}
      {lsiResults.unigrams && lsiResults.unigrams.length > 0 && (
        <LSITable
          title="Униграммы (уникальные слова)"
          data={lsiResults.unigrams}
          itemsPerPage={15}
        />
      )}

      {/* Триграммы */}
      {lsiResults.trigrams && lsiResults.trigrams.length > 0 && (
        <LSITable
          title="Триграммы (три слова)"
          data={lsiResults.trigrams}
          itemsPerPage={15}
          defaultExpanded={false}
        />
      )}

      {/* Кнопка для анализа ключевых слов после LSI */}
      <div className="mt-6">
        <button
          onClick={onKeywordsAnalysis}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center justify-center gap-3",
            "px-6 py-3 rounded-lg font-medium transition-colors",
            "bg-red-600 text-white hover:bg-red-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[48px] min-w-[280px]"
          )}
        >
          {isLoading ? (
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
              <span>Анализ ключевых слов...</span>
            </>
          ) : (
            <>
              <svg 
                className="w-5 h-5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span>Анализ ключевых слов по тегам</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};