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
            "inline-flex items-center justify-center gap-2",
            "px-6 py-3 rounded-md font-medium transition-colors",
            "bg-red-600 text-white hover:bg-red-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin">⏳</span>
              <span>Анализ ключевых слов...</span>
            </>
          ) : (
            <>
              <span>📊</span>
              <span>Анализ ключевых слов по тегам</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
