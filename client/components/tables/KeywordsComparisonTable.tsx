import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ExportToXLSX } from '@/components/ExportToXLSX';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

type SearchEngine = 'google' | 'yandex';
type PerPageOption = number | 'all';
type TagType = 'title' | 'body' | 'a' | 'text-fragment' | 'plain-text' | 'textfragment';
type SortField = "diff";

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
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState({
    field: "phrases",
    direction: "asc"
  });

  const sortedData = useMemo(() => {
    if(sortConfig.direction === "none") return data;

    const sortableData = [...data];
    
    return sortableData.sort((a, b) => {
      let aValue: any = a.phrase;
      let bValue: any = b.phrase;

      if (sortConfig.field === "diff") {
        aValue = Object.keys(a.diff || {})
                  .reduce((acc, key) => acc + Math.abs(a.diff[key]), 0);
        
        bValue = Object.keys(b.diff || {})
                  .reduce((acc, key) => acc + Math.abs(b.diff[key]), 0);
      }

      let result = 0;

      if (sortConfig.field === "phrases") {
        result = aValue.localeCompare(bValue, 'ru');
      } else {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
        result = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }

      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [data, sortConfig]);

  const handleSortClick = (field: SortField) => {
    setSortConfig(prev => {
      if (prev.field !== field) {
        return { field, direction: "asc" };
      }
      switch (prev.direction) {
        case "none":
          return { field, direction: "asc" };
        case "asc":
          return { field, direction: "desc" };
        case "desc":
          return { field, direction: "none" };
        default:
          return prev;
      }
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }

    switch (sortConfig.direction) {
      case "asc":
        return <ChevronUp className="w-4 h-4 text-blue-600" />;
      case "desc":
        return <ChevronDown className="w-4 h-4 text-blue-600" />;
      case "none":
        return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
      default:
        return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
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

  // Настройки прозрачности для hover эффектов
  const HOVER_OPACITY = {
    header: 0.15,
    cell: 0.1,
    diffCell: 0.25,
    row: 0.1,
    rowAnomalous: 0.2
  };

  // Настройки цветов для hover эффектов
  const HOVER_COLORS = {
    yellow: { r: 254, g: 240, b: 138 },    // желтый (по умолчанию)
    blue: { r: 147, g: 197, b: 253 },      // голубой
    green: { r: 167, g: 243, b: 208 },     // зеленый
    purple: { r: 196, g: 181, b: 253 },    // фиолетовый
    orange: { r: 251, g: 191, b: 36 },     // оранжевый
    pink: { r: 251, g: 207, b: 232 },      // розовый
    gray: { r: 209, g: 213, b: 219 }       // серый
  };

  // Выберите нужный цвет
  const ACTIVE_HOVER_COLOR = HOVER_COLORS.gray; // меняйте здесь

  const totalPages = perPage === 'all' ? 1 : Math.ceil(data.length / perPage);
  const currentData = perPage === 'all' ? sortedData : sortedData.slice((currentPage - 1) * perPage, currentPage * perPage);

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

  // Функция для смешивания цветов hover и diff
  const blendColors = (
    baseColor: string,
    isHighlighted: boolean,
    opacity: number,
    overlayColor: { r: number; g: number; b: number } = ACTIVE_HOVER_COLOR
  ): string => {
    if (!isHighlighted) return baseColor;
    if (!baseColor) return `rgba(${overlayColor.r}, ${overlayColor.g}, ${overlayColor.b}, ${opacity})`;

    // Извлекаем значения rgba из baseColor
    const rgbaMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
      const [, r, g, b, a = '1'] = rgbaMatch;
      const baseAlpha = parseFloat(a);

      // Смешиваем с переданным overlay цветом
      const overlayAlpha = opacity;

      // Формула смешивания цветов
      const finalAlpha = overlayAlpha + baseAlpha * (1 - overlayAlpha);
      const finalR = Math.round((overlayColor.r * overlayAlpha + parseInt(r) * baseAlpha * (1 - overlayAlpha)) / finalAlpha);
      const finalG = Math.round((overlayColor.g * overlayAlpha + parseInt(g) * baseAlpha * (1 - overlayAlpha)) / finalAlpha);
      const finalB = Math.round((overlayColor.b * overlayAlpha + parseInt(b) * baseAlpha * (1 - overlayAlpha)) / finalAlpha);

      return `rgba(${finalR}, ${finalG}, ${finalB}, ${finalAlpha})`;
    }

    // Fallback - просто overlay
    return `rgba(${overlayColor.r}, ${overlayColor.g}, ${overlayColor.b}, ${opacity})`;
  };

  // Функция для определения цвета ячейки
  const getDiffCellColor = (value: number): string => {
    if (value === 0) return '';

    const absValue = Math.abs(value);
    const intensity = Math.min(absValue * 15, 80);

    if (value > 0) {
      // Желтый оттенок для положительных значений
      return `rgba(234, 179, 8, ${intensity / 100})`;
    } else {
      // Красный оттенок для отрицательных значений (как было)
      return `rgba(239, 68, 68, ${intensity / 100})`;
    }
  };

  // Функция для получения общего количества колонок
  const getTotalColumns = (): number => {
    return 1 + (tags.length * 3); // 1 для фраз + tags.length для каждой из 3 секций
  };

  // Функция для определения должна ли ячейка быть подсвечена
  const shouldHighlightCell = (rowIndex: number, colIndex: number): boolean => {
    return hoveredRow === rowIndex || hoveredCol === colIndex;
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
            {sortConfig.direction !== "none" && (
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Сортировка: {sortConfig.field === "ngram" ? "по алфавиту" : 
                            sortConfig.field === "competitors" ? "по конкурентам" :
                            sortConfig.field === "avg_count" ? "по среднему значению" :
                            sortConfig.field === "my_count" ? "по вашим значениям" : 
                            "по покрытию"} 
                ({sortConfig.direction === "asc" ? "↑ возр." : "↓ убыв."})
              </span>
            )}
            {isGoogle && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Google режим
              </span>
            )}
          </div>

        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
          <tr className="border-b border-gray-200 bg-gray-800 text-white">
            <th
              rowSpan={2}
              className="flex-item text-left py-3 px-4 font-medium text-sm min-w-[200px] transition-colors"
              style={{
                backgroundColor: shouldHighlightCell(-1, 0)
                  ? `rgba(${ACTIVE_HOVER_COLOR.r}, ${ACTIVE_HOVER_COLOR.g}, ${ACTIVE_HOVER_COLOR.b}, ${HOVER_OPACITY.header})`
                  : ''
              }}
              onMouseEnter={() => setHoveredCol(0)}
              onMouseLeave={() => setHoveredCol(null)}
            >
                Фразы
            </th>
            <th
              colSpan={tags.length}
              className="text-center py-2 px-4 font-medium text-sm border-l border-gray-600"
            >
                Top10
              <div className="text-xs font-normal mt-1 text-gray-300">
                среднее кол-во на странице
              </div>
            </th>
            <th
              colSpan={tags.length}
              className="text-center py-2 px-4 font-medium text-sm border-l border-gray-600"
              onClick={() => handleSortClick("diff")}
              title={getSortTooltip("diff")}
            >
              <div className="flex items-center gap-2 justify-center truncate">
                diff
                {getSortIcon("diff")}
              </div>
            </th>
            <th
              colSpan={tags.length}
              className="text-center py-2 px-4 font-medium text-sm border-l border-gray-600"
            >
                src
            </th>
          </tr>
          <tr className="border-b border-gray-200 bg-gray-700 text-white text-xs">
            {/* Top10 headers */}
            {tags.map((tag, i) => (
              <th
                key={`top10-${i}`}
                className={cn(
                  'text-center py-2 px-2 whitespace-pre-line transition-colors',
                  isGoogle && 'min-w-[120px]'
                )}
                style={{
                  backgroundColor: shouldHighlightCell(-1, i + 1)
                    ? `rgba(${ACTIVE_HOVER_COLOR.r}, ${ACTIVE_HOVER_COLOR.g}, ${ACTIVE_HOVER_COLOR.b}, ${HOVER_OPACITY.header})`
                    : ''
                }}
                onMouseEnter={() => setHoveredCol(i + 1)}
                onMouseLeave={() => setHoveredCol(null)}
              >
                {getTagDisplay(tag)}
              </th>
            ))}
            {/* diff headers */}
            {tags.map((tag, i) => (
              <th
                key={`diff-${i}`}
                className={cn(
                  'text-center py-2 px-2 whitespace-pre-line border-l border-gray-600 transition-colors',
                  isGoogle && 'min-w-[120px]'
                )}
                style={{
                  backgroundColor: shouldHighlightCell(-1, i + 1 + tags.length)
                    ? `rgba(${ACTIVE_HOVER_COLOR.r}, ${ACTIVE_HOVER_COLOR.g}, ${ACTIVE_HOVER_COLOR.b}, ${HOVER_OPACITY.header})`
                    : ''
                }}
                onMouseEnter={() => setHoveredCol(i + 1 + tags.length)}
                onMouseLeave={() => setHoveredCol(null)}
              >
                {getTagDisplay(tag)}
              </th>
            ))}
            {/* src headers */}
            {tags.map((tag, i) => (
              <th
                key={`src-${i}`}
                className={cn(
                  'text-center py-2 px-2 whitespace-pre-line border-l border-gray-600 transition-colors',
                  isGoogle && 'min-w-[120px]'
                )}
                style={{
                  backgroundColor: shouldHighlightCell(-1, i + 1 + tags.length * 2)
                    ? `rgba(${ACTIVE_HOVER_COLOR.r}, ${ACTIVE_HOVER_COLOR.g}, ${ACTIVE_HOVER_COLOR.b}, ${HOVER_OPACITY.header})`
                    : ''
                }}
                onMouseEnter={() => setHoveredCol(i + 1 + tags.length * 2)}
                onMouseLeave={() => setHoveredCol(null)}
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
                  'border-b border-gray-200 transition-colors',
                  hasAnomalousValues && 'bg-yellow-50'
                )}
                style={{
                  backgroundColor: shouldHighlightCell(index, -1)
                    ? hasAnomalousValues
                      ? `rgba(${ACTIVE_HOVER_COLOR.r}, ${ACTIVE_HOVER_COLOR.g}, ${ACTIVE_HOVER_COLOR.b}, ${HOVER_OPACITY.rowAnomalous})`
                      : `rgba(${ACTIVE_HOVER_COLOR.r}, ${ACTIVE_HOVER_COLOR.g}, ${ACTIVE_HOVER_COLOR.b}, ${HOVER_OPACITY.row})`
                    : ''
                }}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td
                  className="py-3 px-4 font-medium text-sm transition-colors"
                  style={{
                    backgroundColor: shouldHighlightCell(index, 0)
                      ? `rgba(${ACTIVE_HOVER_COLOR.r}, ${ACTIVE_HOVER_COLOR.g}, ${ACTIVE_HOVER_COLOR.b}, ${HOVER_OPACITY.cell})`
                      : ''
                  }}
                  onMouseEnter={() => setHoveredCol(0)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  {renderPhrase(row.phrase)}
                  {hasAnomalousValues && (
                    <span className="ml-2 text-xs text-yellow-600" title="Обнаружены аномальные значения">
                        ⚠️
                      </span>
                  )}
                </td>

                {/* Top10 cells */}
                {tags.map((tag, i) => (
                  <td
                    key={`top10-${i}`}
                    className="text-center py-3 px-2 text-sm transition-colors"
                    style={{
                      backgroundColor: shouldHighlightCell(index, i + 1)
                        ? `rgba(${ACTIVE_HOVER_COLOR.r}, ${ACTIVE_HOVER_COLOR.g}, ${ACTIVE_HOVER_COLOR.b}, ${HOVER_OPACITY.cell})`
                        : ''
                    }}
                    onMouseEnter={() => setHoveredCol(i + 1)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    {Math.round(getTagValue(row, 'Top10', tag))}
                  </td>
                ))}

                {/* diff cells with color */}
                {tags.map((tag, i) => {
                  const cellValue = getTagValue(row, 'diff', tag);
                  const diffColor = getDiffCellColor(cellValue);
                  const isHighlighted = shouldHighlightCell(index, i + 1 + tags.length);

                  return (
                    <td
                      key={`diff-${i}`}
                      className={cn(
                        'text-center py-3 px-2 text-sm transition-colors',
                        i === 0 && 'border-l border-gray-200'
                      )}
                      style={{
                        backgroundColor: blendColors(diffColor, isHighlighted, HOVER_OPACITY.diffCell, ACTIVE_HOVER_COLOR)
                      }}
                      onMouseEnter={() => setHoveredCol(i + 1 + tags.length)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      {cellValue}
                    </td>
                  );
                })}

                {/* src cells */}
                {tags.map((tag, i) => (
                  <td
                    key={`src-${i}`}
                    className={cn(
                      'text-center py-3 px-2 text-sm transition-colors',
                      i === 0 && 'border-l border-gray-200'
                    )}
                    style={{
                      backgroundColor: shouldHighlightCell(index, i + 1 + tags.length * 2)
                        ? `rgba(${ACTIVE_HOVER_COLOR.r}, ${ACTIVE_HOVER_COLOR.g}, ${ACTIVE_HOVER_COLOR.b}, ${HOVER_OPACITY.cell})`
                        : ''
                    }}
                    onMouseEnter={() => setHoveredCol(i + 1 + tags.length * 2)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    {tag === 'body' && !isGoogle ? 0 : Math.round(getTagValue(row, 'src', tag))}
                  </td>
                ))}
              </tr>
            );
          })}

          {/* Строка с суммами */}
          <tr
            className="bg-red-600 text-white font-bold transition-colors"
            style={{
              backgroundColor: shouldHighlightCell(currentData.length, -1)
                ? '#dc2626' // Более темный красный при hover
                : ''
            }}
            onMouseEnter={() => setHoveredRow(currentData.length)}
            onMouseLeave={() => setHoveredRow(null)}
          >
            <td
              className="py-3 px-4 text-sm border-b-0 transition-colors"
              style={{
                backgroundColor: shouldHighlightCell(currentData.length, 0)
                  ? `rgba(${ACTIVE_HOVER_COLOR.r}, ${ACTIVE_HOVER_COLOR.g}, ${ACTIVE_HOVER_COLOR.b}, ${HOVER_OPACITY.cell})`
                  : ''
              }}
              onMouseEnter={() => setHoveredCol(0)}
              onMouseLeave={() => setHoveredCol(null)}
            >
              Всего слов:
            </td>

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
                <td
                  key={`total-top10-${i}`}
                  className="text-center py-3 px-2 text-sm transition-colors"
                  style={{
                    backgroundColor: shouldHighlightCell(currentData.length, i + 1)
                      ? `rgba(${ACTIVE_HOVER_COLOR.r}, ${ACTIVE_HOVER_COLOR.g}, ${ACTIVE_HOVER_COLOR.b}, ${HOVER_OPACITY.cell})`
                      : ''
                  }}
                  onMouseEnter={() => setHoveredCol(i + 1)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  {value}
                </td>
              );
            })}

            {/* Пустые ячейки для diff */}
            {tags.map((tag, i) => (
              <td
                key={`total-diff-${i}`}
                className="text-center py-3 px-2 text-sm bg-white transition-colors"
                style={{
                  backgroundColor: shouldHighlightCell(currentData.length, i + 1 + tags.length)
                    ? `rgba(${ACTIVE_HOVER_COLOR.r}, ${ACTIVE_HOVER_COLOR.g}, ${ACTIVE_HOVER_COLOR.b}, ${HOVER_OPACITY.cell})`
                    : ''
                }}
                onMouseEnter={() => setHoveredCol(i + 1 + tags.length)}
                onMouseLeave={() => setHoveredCol(null)}
              >
              </td>
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
                    'text-center py-3 px-2 text-sm transition-colors',
                    i === 0 && 'border-l border-red-700'
                  )}
                  style={{
                    backgroundColor: shouldHighlightCell(currentData.length, i + 1 + tags.length * 2)
                      ? `rgba(${ACTIVE_HOVER_COLOR.r}, ${ACTIVE_HOVER_COLOR.g}, ${ACTIVE_HOVER_COLOR.b}, ${HOVER_OPACITY.cell})`
                      : ''
                  }}
                  onMouseEnter={() => setHoveredCol(i + 1 + tags.length * 2)}
                  onMouseLeave={() => setHoveredCol(null)}
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