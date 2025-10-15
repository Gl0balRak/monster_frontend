import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, BookOpen, Target } from 'lucide-react';
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

  const formatSiteIdentifier = (contextString: string): string => {
    const match = contextString.match(/^\[(.*?)\]/);
    if (!match) return contextString;

    const siteIdentifier = match[1];
    const restOfContext = contextString.substring(match[0].length);

    if (siteIdentifier === 'наш сайт') {
      return contextString;
    }

    try {
      const url = new URL(siteIdentifier);
      let domain = url.hostname.replace('www.', '');
      if (domain.length > 30) {
        domain = domain.substring(0, 27) + '...';
      }
      return `[${domain}]${restOfContext}`;
    } catch {
      return contextString;
    }
  };

const highlightTextWithColors = (text: string, phrase: string, word: string): JSX.Element[] => {
  const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1');
  
  const wordsMatch = (word1: string, word2: string): boolean => {
    const w1 = word1.toLowerCase().replace(/[^а-яa-z]/g, '');
    const w2 = word2.toLowerCase().replace(/[^а-яa-z]/g, '');
    
    if (!w1 || !w2) return false;

    if (w1 === w2) return true;
    
    const minLength = Math.min(w1.length, w2.length);
    
    if (Math.abs(w1.length - w2.length) > 2) {
        return false;
    }
    
    let requiredMatchLength;
    if (minLength <= 3) requiredMatchLength = minLength;
    else if (minLength <= 5) requiredMatchLength = 4;
    else requiredMatchLength = 5;
    
    return w1.substring(0, requiredMatchLength) === w2.substring(0, requiredMatchLength);
    };

  const parts = cleanText.split(/(\s+)/);
  const result: JSX.Element[] = [];
  
  const isMultiWordPhrase = phrase.includes(' ');
  const phraseWords = isMultiWordPhrase ? phrase.split(' ') : [phrase];
  
  const mergedParts: (string | JSX.Element)[] = [];
  let i = 0;
  
  while (i < parts.length) {
    if (!parts[i].trim()) {
      mergedParts.push(parts[i]);
      i++;
      continue;
    }
    
    if (isMultiWordPhrase) {
      let phraseFound = false;
      
      for (let j = 0; j <= 2; j++) {
        if (i + j * 2 >= parts.length) break;
        
        const potentialPhraseWords = [];
        let valid = true;
        
        for (let k = 0; k < phraseWords.length; k++) {
          const partIndex = i + k * 2;
          if (partIndex >= parts.length || !parts[partIndex].trim()) {
            valid = false;
            break;
          }
          
          if (!wordsMatch(parts[partIndex], phraseWords[k])) {
            valid = false;
            break;
          }
          
          potentialPhraseWords.push(parts[partIndex]);
        }
        
        if (valid) {
          const phraseText = potentialPhraseWords.join(' ');
          mergedParts.push(
            <mark key={i} className="bg-green-200 px-1 font-semibold rounded">
              {phraseText}
            </mark>
          );
          
          for (let k = 1; k < potentialPhraseWords.length; k++) {
            if (i + k * 2 - 1 < parts.length) {
              mergedParts.push(parts[i + k * 2 - 1]);
            }
          }
          
          i += phraseWords.length * 2 - 1;
          phraseFound = true;
          break;
        }
      }
      
      if (phraseFound) {
        i++;
        continue;
      }
    }
    
    if (!isMultiWordPhrase && wordsMatch(parts[i], phrase)) {
      mergedParts.push(
        <mark key={i} className="bg-green-200 px-1 font-semibold rounded">
          {parts[i]}
        </mark>
      );
      i++;
      continue;
    }
    
    mergedParts.push(parts[i]);
    i++;
  }
  
  const finalResult: JSX.Element[] = [];
  
  for (const part of mergedParts) {
    if (typeof part === 'string') {
      if (!part.trim()) {
        finalResult.push(<span key={finalResult.length}>{part}</span>);
        continue;
      }
      
      const individualWords = part.split(/(\s+)/);
      const highlightedWords = individualWords.map((wordPart, index) => {
        if (!wordPart.trim()) {
          return <span key={index}>{wordPart}</span>;
        }
        
        if (wordsMatch(wordPart, word)) {
          return (
            <mark key={index} className="bg-yellow-200 px-1 font-semibold rounded">
              {wordPart}
            </mark>
          );
        }
        
        return <span key={index}>{wordPart}</span>;
      });
      
      finalResult.push(<span key={finalResult.length}>{highlightedWords}</span>);
    } else {
      finalResult.push(part);
    }
  }
  
  return finalResult;
};

  const togglePhrase = (phrase: string) => {
    const newExpanded = new Set(expandedPhrases);
    if (newExpanded.has(phrase)) {
        newExpanded.delete(phrase);
    } else {
        newExpanded.add(phrase);
    }
    setExpandedPhrases(newExpanded);
  };

  const toggleContexts = (phrase: string, word: string) => {
    const key = `${phrase}-${word}`;
    const newExpanded = new Set(expandedContexts);
    if (newExpanded.has(key)) {
        newExpanded.delete(key);
    } else {
        newExpanded.add(key);
    }
    setExpandedContexts(newExpanded);
  };

  const exportToCSV = () => {
    if (!data?.phrases_analysis) return;

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

  const ChevronUpIcon = ({ isExpanded = false }: { isExpanded?: boolean }) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
        "transition-all duration-300 ease-in-out",
        {
            "rotate-180": isExpanded,
        },
        )}
    >
        <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.2929 8.29289C11.6834 7.90237 12.3166 7.90237 12.7071 8.29289L18.7071 14.2929C19.0976 14.6834 19.0976 15.3166 18.7071 15.7071C18.3166 16.0976 17.6834 16.0976 17.2929 15.7071L12 10.4142L6.70711 15.7071C6.31658 16.0976 5.68342 16.0976 5.29289 15.7071C4.90237 15.3166 4.90237 14.6834 5.29289 14.2929L11.2929 8.29289Z"
        fill="currentColor"
        />
    </svg>
    );

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Анализ семантических связей (коллокаций)
              </h3>
              <p className="text-sm text-gray-600">
                Слова, которые часто встречаются рядом с целевыми фразами
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                title="Экспортировать в CSV"
              >
                <Download size={16} />
                Экспорт
              </button>
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  Назад
                </button>
              )}
            </div>
          </div>

          {data?.metadata && (
            <div className="mt-4 flex gap-4">
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <div className="text-xs text-gray-500 font-medium">Время анализа</div>
                <div className="text-lg font-semibold text-red-600">
                  {data.metadata.processing_time_seconds}с
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium text-gray-700">PMI оценка связи:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-green-700 font-medium">≥5 Очень сильная</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-blue-700">≥3 Сильная</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="text-gray-700">≥1 Средняя</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
              <span className="text-gray-500">&lt;1 Слабая</span>
            </div>
            <div className="ml-auto flex items-center gap-1 text-xs text-gray-600">
              <BookOpen size={14} />
              Нажмите на иконку книги чтобы увидеть контексты
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {!data?.phrases_analysis || data.phrases_analysis.length === 0 ? (
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
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => togglePhrase(phraseData.phrase)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button className="text-gray-500 hover:text-gray-700 transition-colors">
                            <ChevronUpIcon isExpanded={isExpanded} />
                        </button>
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            "{phraseData.phrase}"
                          </h4>
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                            {phraseData.related_words.length} связей
                          </span>
                        </div>
                      </div>

                      {!isExpanded && (
                        <div className="flex items-center gap-2">
                          {topWords.map((word, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium border",
                                getColorByPMI(word.pmi_score),
                                word.pmi_score >= 5 ? "bg-green-50 border-green-200" :
                                word.pmi_score >= 3 ? "bg-blue-50 border-blue-200" :
                                word.pmi_score >= 1 ? "bg-gray-50 border-gray-200" :
                                "bg-gray-25 border-gray-150"
                              )}
                            >
                              {word.word}
                            </span>
                          ))}
                          {allWords.length > 5 && (
                            <span className="text-gray-500 text-sm font-medium">
                              +{allWords.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    {
                        "grid-rows-[0fr] opacity-0": !isExpanded,
                        "grid-rows-[1fr] opacity-100": isExpanded,
                    }
                  )}>
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6">
                        <div className={cn(
                          "rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out",
                          {
                            "opacity-0 transform translate-y-4": !isExpanded,
                            "opacity-100 transform translate-y-0": isExpanded,
                          }
                        )}>
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-700">
                                <th className="text-left py-4 px-6 font-semibold text-white text-sm uppercase tracking-wider">
                                  Связанное слово
                                </th>
                                <th className="text-center py-4 px-6 font-semibold text-white text-sm uppercase tracking-wider">
                                  Частота
                                </th>
                                <th className="text-center py-4 px-6 font-semibold text-white text-sm uppercase tracking-wider">
                                  PMI оценка
                                </th>
                                <th className="text-center py-4 px-6 font-semibold text-white text-sm uppercase tracking-wider">
                                  Сила связи
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {allWords.map((word, idx) => {
                                const contextKey = `${phraseData.phrase}-${word.word}`;
                                const hasContexts = word.contexts && word.contexts.length > 0;
                                const isContextExpanded = expandedContexts.has(contextKey);

                                return (
                                  <React.Fragment key={idx}>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                      <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                          <span className={cn("font-semibold text-base", getColorByPMI(word.pmi_score))}>
                                            {word.word}
                                          </span>
                                          {hasContexts && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleContexts(phraseData.phrase, word.word);
                                              }}
                                              className={cn(
                                                "p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium",
                                                isContextExpanded 
                                                  ? "bg-red-100 text-red-700" 
                                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                              )}
                                              title="Показать контексты использования"
                                            >
                                              <BookOpen size={14} />
                                              {word.contexts?.length}
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-4 px-6 text-center">
                                        <span className="text-gray-900 font-semibold text-base">
                                          {word.frequency}
                                        </span>
                                      </td>
                                      <td className="py-4 px-6 text-center">
                                        <span className={cn("font-mono text-base font-semibold", getColorByPMI(word.pmi_score))}>
                                          {word.pmi_score.toFixed(2)}
                                        </span>
                                      </td>
                                      <td className="py-4 px-6 text-center">
                                        <span className={cn(
                                          "px-3 py-1.5 rounded-full text-sm font-medium border",
                                          word.pmi_score >= 5 ? "bg-green-100 text-green-700 border-green-200" :
                                          word.pmi_score >= 3 ? "bg-blue-100 text-blue-700 border-blue-200" :
                                          word.pmi_score >= 1 ? "bg-gray-100 text-gray-700 border-gray-200" :
                                          "bg-gray-50 text-gray-500 border-gray-150"
                                        )}>
                                          {getPMILabel(word.pmi_score)}
                                        </span>
                                      </td>
                                    </tr>

                                    {hasContexts && (
                                      <tr>
                                          <td colSpan={4} className="px-6 py-0 border-t border-red-100">
                                          <div
                                              className={cn(
                                              "transition-all duration-300 ease-in-out overflow-hidden",
                                              {
                                                  "max-h-0 opacity-0": !isContextExpanded,
                                                  "max-h-[2000px] opacity-100": isContextExpanded,
                                              },
                                              )}
                                          >
                                              <div className="bg-red-50 px-6 py-4">
                                              <div className="space-y-3">
                                                  <div className="flex items-center gap-2 text-sm font-semibold text-red-700 mb-3">
                                                  <Target size={16} />
                                                  Контексты где "{word.word}" встречается рядом с "{phraseData.phrase}":
                                                  </div>
                                                  {word.contexts?.map((context, ctxIdx) => {
                                                  const formattedContext = formatSiteIdentifier(context);
                                                  const sourceMatch = formattedContext.match(/^\[(.*?)\]/);
                                                  const source = sourceMatch ? sourceMatch[1] : '';
                                                  const contextText = sourceMatch
                                                      ? formattedContext.substring(sourceMatch[0].length).trim()
                                                      : formattedContext;

                                                  const highlightedParts = highlightTextWithColors(
                                                    contextText, 
                                                    phraseData.phrase, 
                                                    word.word
                                                  );

                                                  return (
                                                      <div key={ctxIdx} className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
                                                      <div className="flex items-start gap-3">
                                                          {source && (
                                                          <span className="flex-shrink-0 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                                              {source}
                                                          </span>
                                                          )}
                                                          <span className="text-sm text-gray-700 leading-relaxed flex-1">
                                                          ...{highlightedParts}...
                                                          </span>
                                                      </div>
                                                      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                                          <span>Контекст #{ctxIdx + 1}</span>
                                                          <div className="flex items-center gap-2">
                                                          <div className="flex items-center gap-1">
                                                              <div className="w-2 h-2 bg-green-200 rounded"></div>
                                                              <span>целевая фраза</span>
                                                          </div>
                                                          <div className="flex items-center gap-1">
                                                              <div className="w-2 h-2 bg-yellow-200 rounded"></div>
                                                              <span>связанное слово</span>
                                                          </div>
                                                          </div>
                                                      </div>
                                                      </div>
                                                  );
                                                  })}
                                                  {word.contexts && word.contexts.length > 3 && (
                                                  <div className="text-center py-2">
                                                      <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                                                      Показаны все {word.contexts.length} контекстов
                                                      </span>
                                                  </div>
                                                  )}
                                              </div>
                                              </div>
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

                        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="grid grid-cols-3 gap-6 text-sm">
                              <div className="text-center">
                              <div className="text-gray-600 font-medium">Всего связей</div>
                              <div className="text-2xl font-bold text-red-600 mt-1">{allWords.length}</div>
                              </div>
                              <div className="text-center">
                              <div className="text-gray-600 font-medium">Средний PMI</div>
                              <div className="text-2xl font-bold text-red-600 mt-1">
                                  {(allWords.reduce((sum, w) => sum + w.pmi_score, 0) / allWords.length).toFixed(2)}
                              </div>
                              </div>
                              <div className="text-center">
                              <div className="text-gray-600 font-medium">Сильных связей (PMI≥3)</div>
                              <div className="text-2xl font-bold text-blue-600 mt-1">
                                  {allWords.filter(w => w.pmi_score >= 3).length}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};