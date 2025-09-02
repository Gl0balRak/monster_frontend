import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ExportToXLSX } from '@/components/ExportToXLSX';

type SearchEngine = 'google' | 'yandex';
type PerPageOption = number | 'all';
type TagType = 'title' | 'body' | 'a' | 'text-fragment' | 'plain-text' | 'textfragment';

interface KeywordRowSection {
  title?: number;
  body?: number;
  a?: number;
  'text-fragment'?: number;
  'plain-text'?: number;
  textfragment?: number;
  plaintext?: number;
  [key: string]: number | undefined;
}

interface KeywordRow {
  phrase: string;
  Top10?: KeywordRowSection;
  diff?: KeywordRowSection;
  src?: KeywordRowSection;
}

interface TotalWordsSection {
  title?: number;
  body?: number;
  a?: number;
  textfragment?: number;
  plaintext?: number;
  [key: string]: number | undefined;
}

interface TotalWordsData {
  top10?: TotalWordsSection;
  src?: TotalWordsSection;
}

interface KeywordsComparisonTableProps {
  data: KeywordRow[];
  onBack: () => void;
  totalWordsData: TotalWordsData | null;
  searchEngine?: SearchEngine;
}

export const KeywordsComparisonTable: React.FC<KeywordsComparisonTableProps> = ({
                                                                                  data,
                                                                                  onBack,
                                                                                  totalWordsData,
                                                                                  searchEngine = 'yandex'
                                                                                }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<PerPageOption>(10);
  const [showButton, setShowButton] = useState<boolean>(false);

  const totalPages = perPage === 'all' ? 1 : Math.ceil(data.length / perPage);
  const currentData = perPage === 'all' ? data : data.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Определяем какие колонки показывать в зависимости от поисковой системы
  const isGoogle = searchEngine === 'google';
  const tags: TagType[] = isGoogle
    ? ['title', 'textfragment']
    : ['title', 'body', 'a', 'text-fragment', 'plain-text'];

  // Функция для отображения заголовков колонок
  const getTagDisplay = (tag: TagType): string => {
    if (tag === 'textfragment' || tag === 'text-fragment') {
      return isGoogle ? '<all-text>' : '<text-\nfragment>';
    }
    return `<${tag.replace('-', '\n')}>`;
  };

  // Функция для получения значения из данных
  const getTagValue = (row: KeywordRow, section: keyof KeywordRow, tag: TagType): number => {
    const sectionData = row[section] as KeywordRowSection | undefined;
    if (!sectionData) return 0;

    // Для Google все тексты объединены в textfragment
    if (isGoogle && tag === 'textfragment') {
      return sectionData['textfragment'] || sectionData['text-fragment'] || 0;
    }
    return sectionData[tag] || 0;
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // Функция для определения цвета ячейки
  const getDiffCellColor = (value: number): string => {
    if (value === 0) return '';
    const absValue = Math.abs(value);
    const intensity = Math.min(absValue * 15, 80);
    return `rgba(239, 68, 68, ${intensity / 100})`;
  };

  // Функция для отображения фразы с учетом специальных символов
  const renderPhrase = (phrase: string): React.ReactNode => {
    if (phrase.includes('[') && phrase.includes(']')) {
      const innerContent = phrase.replace(/[\[\]]/g, '');
      if (innerContent.includes('*')) {
        const parts = innerContent.split('*');
        return (
          <span>
            <span className="text-purple-600">[</span>
            {parts.map((part, i) => (
              <React.Fragment key={i}>
                {part}
                {i < parts.length - 1 && <span className="text-orange-600 font-bold">*</span>}
              </React.Fragment>
            ))}
            <span className="text-purple-600">]</span>
          </span>
        );
      }
      return (
        <span>
          <span className="text-purple-600">[</span>
          {innerContent}
          <span className="text-purple-600">]</span>
        </span>
      );
    } else if (phrase.includes('*')) {
      const parts = phrase.split('*');
      return (
        <span>
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i < parts.length - 1 && <span className="text-orange-600 font-bold">*</span>}
            </React.Fragment>
          ))}
        </span>
      );
    } else {
      return phrase;
    }
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPerPage(value === 'all' ? 'all' : parseInt(value));
    setCurrentPage(1);
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      setCurrentPage(page);
    }
  };

  const handleReset = () => {
    if (window.confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
      onBack();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="font-medium text-gray-900">Ключевые слова</h3>
            {isGoogle && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Google режим
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '30%' }}></div>
              </div>
              <span className="ml-2 text-sm text-green-600">30%</span>
            </div>
            <div className="flex items-center">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 float-right" style={{ width: '60%' }}></div>
              </div>
              <span className="ml-2 text-sm text-red-600">60%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
          <tr className="border-b border-gray-200 bg-gray-800 text-white">
            <th rowSpan={2} className="text-left py-3 px-4 font-medium text-sm min-w-[200px]">
              Фразы
            </th>
            <th colSpan={tags.length} className="text-center py-2 px-4 font-medium text-sm border-l border-gray-600">
              Top10
              <div className="text-xs font-normal mt-1 text-gray-300">среднее кол-во на странице</div>
            </th>
            <th colSpan={tags.length} className="text-center py-2 px-4 font-medium text-sm border-l border-gray-600">
              diff
            </th>
            <th colSpan={tags.length} className="text-center py-2 px-4 font-medium text-sm border-l border-gray-600">
              src
            </th>
          </tr>
          <tr className="border-b border-gray-200 bg-gray-700 text-white text-xs">
            {/* Top10 headers */}
            {tags.map((tag, i) => (
              <th
                key={`top10-${i}`}
                className={cn(
                  'text-center py-2 px-2 whitespace-pre-line',
                  isGoogle && 'min-w-[120px]'
                )}
              >
                {getTagDisplay(tag)}
              </th>
            ))}
            {/* diff headers */}
            {tags.map((tag, i) => (
              <th
                key={`diff-${i}`}
                className={cn(
                  'text-center py-2 px-2 whitespace-pre-line border-l border-gray-600',
                  isGoogle && 'min-w-[120px]'
                )}
              >
                {getTagDisplay(tag)}
              </th>
            ))}
            {/* src headers */}
            {tags.map((tag, i) => (
              <th
                key={`src-${i}`}
                className={cn(
                  'text-center py-2 px-2 whitespace-pre-line border-l border-gray-600',
                  isGoogle && 'min-w-[120px]'
                )}
              >
                {getTagDisplay(tag)}
              </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {currentData.map((row, index) => {
            const maxReasonableValue = 100;
            const hasAnomalousValues =
              tags.some(tag => getTagValue(row, 'Top10', tag) > maxReasonableValue) ||
              tags.some(tag => getTagValue(row, 'src', tag) > maxReasonableValue);

            if (hasAnomalousValues) {
              console.warn('Anomalous values detected for phrase:', row.phrase, row);
            }

            return (
              <tr
                key={index}
                className={cn(
                  'border-b border-gray-200 hover:bg-gray-50',
                  hasAnomalousValues && 'bg-yellow-50'
                )}
              >
                <td className="py-3 px-4 font-medium text-sm">
                  {renderPhrase(row.phrase)}
                  {hasAnomalousValues && (
                    <span className="ml-2 text-xs text-yellow-600" title="Обнаружены аномальные значения">
                        ⚠️
                      </span>
                  )}
                </td>

                {/* Top10 cells */}
                {tags.map((tag, i) => (
                  <td key={`top10-${i}`} className="text-center py-3 px-2 text-sm">
                    {Math.round(getTagValue(row, 'Top10', tag))}
                  </td>
                ))}

                {/* diff cells with color */}
                {tags.map((tag, i) => (
                  <td
                    key={`diff-${i}`}
                    className={cn(
                      'text-center py-3 px-2 text-sm',
                      i === 0 && 'border-l border-gray-200'
                    )}
                    style={{ backgroundColor: getDiffCellColor(getTagValue(row, 'diff', tag)) }}
                  >
                    {getTagValue(row, 'diff', tag)}
                  </td>
                ))}

                {/* src cells */}
                {tags.map((tag, i) => (
                  <td
                    key={`src-${i}`}
                    className={cn(
                      'text-center py-3 px-2 text-sm',
                      i === 0 && 'border-l border-gray-200'
                    )}
                  >
                    {tag === 'body' && !isGoogle ? 0 : Math.round(getTagValue(row, 'src', tag))}
                  </td>
                ))}
              </tr>
            );
          })}

          {/* Строка с суммами */}
          <tr className="bg-red-600 text-white font-bold">
            <td className="py-3 px-4 text-sm border-b-0">Всего слов:</td>

            {/* Суммы для Top10 */}
            {tags.map((tag, i) => {
              let value = 0;
              if (isGoogle) {
                if (tag === 'title') {
                  value = Math.round(totalWordsData?.top10?.title || 0);
                } else if (tag === 'textfragment') {
                  value = Math.round(
                    (totalWordsData?.top10?.body || 0) +
                    (totalWordsData?.top10?.a || 0) +
                    (totalWordsData?.top10?.textfragment || 0) +
                    (totalWordsData?.top10?.plaintext || 0)
                  );
                }
              } else {
                const dataTag = tag.replace('-', '');
                value = Math.round(totalWordsData?.top10?.[dataTag] || 0);
              }
              return (
                <td key={`total-top10-${i}`} className="text-center py-3 px-2 text-sm">
                  {value}
                </td>
              );
            })}

            {/* Пустые ячейки для diff */}
            {tags.map((tag, i) => (
              <td key={`total-diff-${i}`} className="text-center py-3 px-2 text-sm bg-white"></td>
            ))}

            {/* Суммы для src */}
            {tags.map((tag, i) => {
              let value = 0;
              if (isGoogle) {
                if (tag === 'title') {
                  value = totalWordsData?.src?.title || 0;
                } else if (tag === 'textfragment') {
                  value = (totalWordsData?.src?.body || 0) +
                    (totalWordsData?.src?.a || 0) +
                    (totalWordsData?.src?.textfragment || 0) +
                    (totalWordsData?.src?.plaintext || 0);
                }
              } else {
                if (tag === 'body') {
                  value = 0;
                } else {
                  const dataTag = tag.replace('-', '');
                  value = totalWordsData?.src?.[dataTag] || 0;
                }
              }
              return (
                <td
                  key={`total-src-${i}`}
                  className={cn(
                    'text-center py-3 px-2 text-sm',
                    i === 0 && 'border-l border-red-700'
                  )}
                >
                  {value}
                </td>
              );
            })}
          </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Строк на странице:</span>
            <select
              value={perPage}
              onChange={handlePerPageChange}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="all">Все</option>
            </select>
          </div>

          {perPage !== 'all' && totalPages > 1 && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={cn(
                  'px-2 py-1 text-gray-500 hover:text-gray-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="Первая страница"
              >
                «
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={cn(
                  'px-2 py-1 text-gray-500 hover:text-gray-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="Предыдущая страница"
              >
                ‹
              </button>

              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={index} className="px-2 py-1 text-gray-500">...</span>
                ) : (
                  <button
                    key={index}
                    onClick={() => handlePageClick(page)}
                    className={cn(
                      'px-3 py-1 rounded transition-colors',
                      currentPage === page
                        ? 'bg-red-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {page}
                  </button>
                )
              ))}

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={cn(
                  'px-2 py-1 text-gray-500 hover:text-gray-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="Следующая страница"
              >
                ›
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={cn(
                  'px-2 py-1 text-gray-500 hover:text-gray-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label="Последняя страница"
              >
                »
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 border-t border-gray-200 flex space-x-4">
        {showButton && (
          <button
            onClick={handleReset}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 font-medium transition-colors"
          >
            Сбросить задание и вернуться в начало
          </button>
        )}
        <ExportToXLSX
          data={currentData}
          totalWordsData={totalWordsData}
          filename="анализ_фраз"
          searchEngine={searchEngine}
        />
        <button className="border border-red-600 text-red-600 px-6 py-2 rounded-md hover:bg-red-50 font-medium transition-colors">
          Сохранить
        </button>
      </div>
    </div>
  );
};