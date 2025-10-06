import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelatedWord {
  word: string;
  frequency: number;
  pmi_score: number;
  contexts?: string[];
}

interface PhraseAnalysis {
  phrase: string;
  related_words: RelatedWord[];
  phrase_frequency?: number;
}

interface AnalysisMetadata {
  url: string;
  total_blocks_processed: number;
  blocks_with_targets: number;
  total_words_analyzed: number;
  block_types: Record<string, number>;
  processing_time_seconds: number;
}

interface CollocationResultsProps {
  data: {
    success: boolean;
    phrases_analysis: PhraseAnalysis[];
    metadata?: AnalysisMetadata;
    error?: string;
  } | null;
  loading?: boolean;
  onBack?: () => void;
}

export const CollocationResultsDisplay: React.FC<CollocationResultsProps> = ({
  data,
  loading = false,
  onBack
}) => {
  const [expandedPhrases, setExpandedPhrases] = useState<Set<string>>(new Set());
  const [selectedPhrase, setSelectedPhrase] = useState<string>('');
  const [showContexts, setShowContexts] = useState<boolean>(true);
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(new Set());

  // Функция для форматирования идентификатора сайта в контексте
  const formatSiteIdentifier = (contextString: string): string => {
    // Извлекаем идентификатор сайта из контекста
    const match = contextString.match(/^\[(.*?)\]/);
    if (!match) return contextString;

    const siteIdentifier = match[1];
    const restOfContext = contextString.substring(match[0].length);

    // Если это "наш сайт", оставляем как есть
    if (siteIdentifier === 'наш сайт') {
      return contextString;
    }

    // Если это URL, форматируем его
    try {
      const url = new URL(siteIdentifier);
      // Извлекаем только домен без www
      let domain = url.hostname.replace('www.', '');
      // Ограничиваем длину домена если он слишком длинный
      if (domain.length > 30) {
        domain = domain.substring(0, 27) + '...';
      }
      return `[${domain}]${restOfContext}`;
    } catch {
      // Если не удалось распарсить как URL, возвращаем как есть
      return contextString;
    }
  };

  if (loading) {
    return (
      <div className="mt-8 bg-white rounded-lg border p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-gray-600">Анализ семантических связей...</span>
        </div>
      </div>
    );
  }

  if (!data || !data.success) {
    return null;
  }

  const togglePhrase = (phrase: string) => {
    const newExpanded = new Set(expandedPhrases);
    if (newExpanded.has(phrase)) {
      newExpanded.delete(phrase);
    } else {
      newExpanded.add(phrase);
    }
    setExpandedPhrases(newExpanded);
  };

  const toggleContexts = (phraseWord: string) => {
    const key = phraseWord;
    const newExpanded = new Set(expandedContexts);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedContexts(newExpanded);
  };

  const exportToCSV = () => {
    if (!data.phrases_analysis) return;

    let csv = 'Фраза,Связанное слово,Частота,PMI Score\n';

    data.phrases_analysis.forEach(phrase => {
      phrase.related_words.forEach(word => {
        csv += `"${phrase.phrase}","${word.word}",${word.frequency},${word.pmi_score.toFixed(3)}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'collocation_analysis.csv';
    link.click();
  };

  const getColorByPMI = (pmi: number): string => {
    if (pmi >= 5) return 'text-green-600 font-semibold';
    if (pmi >= 3) return 'text-blue-600';
    if (pmi >= 1) return 'text-gray-700';
    return 'text-gray-500';
  };

  const getPMILabel = (pmi: number): string => {
    if (pmi >= 5) return 'Очень сильная';
    if (pmi >= 3) return 'Сильная';
    if (pmi >= 1) return 'Средняя';
    return 'Слабая';
  };

  return (
    <div className="mt-8">
      {/* Заголовок и метаданные */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Анализ семантических связей (коллокаций)
              </h3>
              <p className="text-sm text-gray-600">
                Слова, которые часто встречаются рядом с целевыми фразами
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                title="Экспортировать в CSV"
              >
                <Download size={16} />
                Экспорт
              </button>
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-4 py-2 bg-white border rounded-md hover:bg-gray-50 transition-colors text-sm"
                >
                  Назад
                </button>
              )}
            </div>
          </div>

          {/* Метаданные анализа */}
          {data.metadata && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded px-3 py-2">
                <div className="text-xs text-gray-500">Обработано блоков</div>
                <div className="text-lg font-semibold text-purple-600">
                  {data.metadata.total_blocks_processed}
                </div>
              </div>
              <div className="bg-white rounded px-3 py-2">
                <div className="text-xs text-gray-500">Блоков с фразами</div>
                <div className="text-lg font-semibold text-purple-600">
                  {data.metadata.blocks_with_targets}
                </div>
              </div>
              <div className="bg-white rounded px-3 py-2">
                <div className="text-xs text-gray-500">Слов проанализировано</div>
                <div className="text-lg font-semibold text-purple-600">
                  {data.metadata.total_words_analyzed.toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded px-3 py-2">
                <div className="text-xs text-gray-500">Время анализа</div>
                <div className="text-lg font-semibold text-purple-600">
                  {data.metadata.processing_time_seconds}с
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Легенда PMI */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-6 text-sm">
            <span className="font-medium">PMI оценка связи:</span>
            <span className="text-green-600 font-semibold">≥5 Очень сильная</span>
            <span className="text-blue-600">≥3 Сильная</span>
            <span className="text-gray-700">≥1 Средняя</span>
            <span className="text-gray-500">&lt;1 Слабая</span>
            <span className="ml-auto text-xs text-gray-600">
              Нажмите на 📚 чтобы увидеть контексты использования слов
            </span>
          </div>
        </div>

        {/* Результаты для каждой фразы */}
        <div className="divide-y">
          {data.phrases_analysis.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Семантические связи не найдены. Попробуйте изменить параметры анализа.
            </div>
          ) : (
            data.phrases_analysis.map((phraseData, index) => {
              const isExpanded = expandedPhrases.has(phraseData.phrase);
              const topWords = phraseData.related_words.slice(0, 5);
              const allWords = phraseData.related_words;

              return (
                <div key={index} className="hover:bg-gray-50 transition-colors">
                  {/* Заголовок фразы */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => togglePhrase(phraseData.phrase)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button className="text-gray-600 hover:text-gray-900">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <h4 className="font-semibold text-gray-900">
                          "{phraseData.phrase}"
                        </h4>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {phraseData.related_words.length} связей
                        </span>
                      </div>

                      {/* Топ-5 слов в свёрнутом виде */}
                      {!isExpanded && (
                        <div className="flex gap-2">
                          {topWords.map((word, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                "px-2 py-1 rounded text-sm",
                                getColorByPMI(word.pmi_score),
                                "bg-gray-100"
                              )}
                            >
                              {word.word}
                            </span>
                          ))}
                          {allWords.length > 5 && (
                            <span className="text-gray-500 text-sm">
                              +{allWords.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Развёрнутая таблица */}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-gray-100">
                              <th className="text-left py-2 px-4 font-medium text-sm text-gray-700">
                                Связанное слово
                              </th>
                              <th className="text-center py-2 px-4 font-medium text-sm text-gray-700">
                                Частота
                              </th>
                              <th className="text-center py-2 px-4 font-medium text-sm text-gray-700">
                                PMI оценка
                              </th>
                              <th className="text-center py-2 px-4 font-medium text-sm text-gray-700">
                                Сила связи
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {allWords.map((word, idx) => {
                              const contextKey = `${phraseData.phrase}-${word.word}`;
                              const hasContexts = word.contexts && word.contexts.length > 0;
                              const isContextExpanded = expandedContexts.has(contextKey);

                              return (
                                <React.Fragment key={idx}>
                                  <tr className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-4">
                                      <div className="flex items-center gap-2">
                                        <span className={cn("font-medium", getColorByPMI(word.pmi_score))}>
                                          {word.word}
                                        </span>
                                        {hasContexts && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleContexts(contextKey);
                                            }}
                                            className="text-purple-600 hover:text-purple-700 text-xs"
                                            title="Показать контексты использования"
                                          >
                                            {isContextExpanded ? '📖' : '📚'} ({word.contexts.length})
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-2 px-4 text-center text-sm">
                                      {word.frequency}
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                      <span className={cn("font-mono text-sm", getColorByPMI(word.pmi_score))}>
                                        {word.pmi_score.toFixed(2)}
                                      </span>
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                      <span className={cn(
                                        "px-2 py-1 rounded text-xs",
                                        word.pmi_score >= 5 ? "bg-green-100 text-green-700" :
                                        word.pmi_score >= 3 ? "bg-blue-100 text-blue-700" :
                                        word.pmi_score >= 1 ? "bg-gray-100 text-gray-700" :
                                        "bg-gray-50 text-gray-500"
                                      )}>
                                        {getPMILabel(word.pmi_score)}
                                      </span>
                                    </td>
                                  </tr>

                                  {/* Контексты использования */}
                                  {hasContexts && isContextExpanded && (
                                    <tr>
                                      <td colSpan={4} className="bg-purple-50 px-4 py-3">
                                        <div className="space-y-2">
                                          <div className="text-xs font-medium text-purple-700 mb-2">
                                            Контексты где "{word.word}" встречается рядом с "{phraseData.phrase}":
                                          </div>
                                          {word.contexts.map((context, ctxIdx) => {
                                            // Форматируем контекст для лучшего отображения
                                            const formattedContext = formatSiteIdentifier(context);

                                            return (
                                              <div key={ctxIdx} className="bg-white p-3 rounded border border-purple-200">
                                                <span className="text-sm text-gray-700 leading-relaxed">
                                                  ...{(() => {
                                                    // Извлекаем источник и сам контекст
                                                    const sourceMatch = formattedContext.match(/^\[(.*?)\]/);
                                                    const source = sourceMatch ? sourceMatch[1] : '';
                                                    const contextText = sourceMatch
                                                      ? formattedContext.substring(sourceMatch[0].length).trim()
                                                      : formattedContext;

                                                    // Подсвечиваем и целевую фразу, и связанное слово
                                                    let highlighted = contextText;

                                                    // Подсвечиваем связанное слово
                                                    const wordRegex = new RegExp(`(${word.word})`, 'gi');
                                                    highlighted = highlighted.replace(wordRegex, '§§§$1§§§');

                                                    // Подсвечиваем целевую фразу
                                                    const phraseRegex = new RegExp(`(${phraseData.phrase})`, 'gi');
                                                    highlighted = highlighted.replace(phraseRegex, '###$1###');

                                                    // Разбиваем текст и применяем стили
                                                    const parts = highlighted.split(/§§§|###/);

                                                    return (
                                                      <>
                                                        {source && (
                                                          <span className="text-xs text-gray-500 mr-2">
                                                            [{source}]
                                                          </span>
                                                        )}
                                                        {parts.map((part, i) => {
                                                          if (part.toLowerCase() === word.word.toLowerCase()) {
                                                            return (
                                                              <mark key={i} className="bg-yellow-200 px-0.5 font-semibold">
                                                                {part}
                                                              </mark>
                                                            );
                                                          }
                                                          if (part.toLowerCase() === phraseData.phrase.toLowerCase()) {
                                                            return (
                                                              <mark key={i} className="bg-green-200 px-0.5 font-semibold">
                                                                {part}
                                                              </mark>
                                                            );
                                                          }
                                                          return part;
                                                        })}
                                                      </>
                                                    );
                                                  })()}...
                                                </span>
                                                <div className="mt-1 flex gap-3 text-xs text-gray-500">
                                                  <span>📍 Контекст #{ctxIdx + 1}</span>
                                                  <span className="bg-green-200 px-1">целевая фраза</span>
                                                  <span className="bg-yellow-200 px-1">связанное слово</span>
                                                </div>
                                              </div>
                                            );
                                          })}
                                          {word.contexts.length > 3 && (
                                            <div className="text-xs text-gray-600 text-center py-1">
                                              Показаны все {word.contexts.length} контекстов
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Статистика по фразе */}
                      <div className="mt-4 p-3 bg-purple-50 rounded">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Всего связей:</span>
                            <span className="ml-2 font-semibold">{allWords.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Средний PMI:</span>
                            <span className="ml-2 font-semibold">
                              {(allWords.reduce((sum, w) => sum + w.pmi_score, 0) / allWords.length).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Сильных связей (PMI≥3):</span>
                            <span className="ml-2 font-semibold text-blue-600">
                              {allWords.filter(w => w.pmi_score >= 3).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};