import React from 'react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';

type SearchEngine = 'google' | 'yandex';

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

interface ExportToXLSXProps {
  data: KeywordRow[];
  totalWordsData: TotalWordsData | null;
  filename?: string;
  buttonText?: string;
  className?: string;
  searchEngine?: SearchEngine;
}

interface CellStyle {
  font?: {
    bold?: boolean;
    color?: { rgb: string };
    size?: number;
  };
  fill?: {
    fgColor?: { rgb: string };
  };
  alignment?: {
    horizontal?: 'center' | 'left' | 'right';
    vertical?: 'center' | 'top' | 'bottom';
  };
  border?: {
    top?: { style: string; color: { rgb: string } };
    bottom?: { style: string; color: { rgb: string } };
    left?: { style: string; color: { rgb: string } };
    right?: { style: string; color: { rgb: string } };
  };
}

export const ExportToXLSX: React.FC<ExportToXLSXProps> = ({
                                                            data,
                                                            totalWordsData,
                                                            filename = 'анализ_фраз',
                                                            buttonText = '📥 Скачать',
                                                            className = 'border border-red-600 text-red-600 px-6 py-2 rounded-md hover:bg-red-50 font-medium',
                                                            searchEngine = 'yandex'
                                                          }) => {
  const isGoogle = searchEngine === 'google';

  const exportToXLSX = (): void => {
    if (!data || data.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }

    try {
      // Создаем данные для экспорта с двумя строками заголовков
      const exportData: (string | number)[][] = [];

      // Определяем заголовки в зависимости от поисковой системы
      let mainHeaders: string[];
      let subHeaders: string[];

      if (isGoogle) {
        // Для Google - упрощенная структура
        mainHeaders = [
          'Фразы',
          'Top10',
          '', // пустая ячейка для объединения Top10
          'diff',
          '', // пустая ячейка для объединения diff
          'src',
          '' // пустая ячейка для объединения src
        ];

        subHeaders = [
          '', // пустая для объединения с "Фразы"
          '<title>',
          '<all-text>',
          '<title>',
          '<all-text>',
          '<title>',
          '<all-text>'
        ];
      } else {
        // Для Яндекса - полная структура
        mainHeaders = [
          'Фразы',
          'Top10',
          '', '', '', '', // пустые ячейки для объединения Top10
          'diff',
          '', '', '', '', // пустые ячейки для объединения diff
          'src',
          '', '', '', '' // пустые ячейки для объединения src
        ];

        subHeaders = [
          '', // пустая для объединения с "Фразы"
          '<title>',
          '<body>',
          '<a>',
          '<text-fragment>',
          '<plain-text>',
          '<title>',
          '<body>',
          '<a>',
          '<text-fragment>',
          '<plain-text>',
          '<title>',
          '<body>',
          '<a>',
          '<text-fragment>',
          '<plain-text>'
        ];
      }

      exportData.push(mainHeaders);
      exportData.push(subHeaders);

      // Добавляем данные из таблицы
      data.forEach(row => {
        let rowData: (string | number)[];

        if (isGoogle) {
          // Для Google объединяем данные
          const top10AllText = Math.round(
            (row.Top10?.body || 0) +
            (row.Top10?.a || 0) +
            (row.Top10?.['text-fragment'] || row.Top10?.textfragment || 0) +
            (row.Top10?.['plain-text'] || row.Top10?.plaintext || 0)
          );

          const diffAllText =
            (row.diff?.body || 0) +
            (row.diff?.a || 0) +
            (row.diff?.['text-fragment'] || row.diff?.textfragment || 0) +
            (row.diff?.['plain-text'] || row.diff?.plaintext || 0);

          const srcAllText = Math.round(
            (row.src?.body || 0) +
            (row.src?.a || 0) +
            (row.src?.['text-fragment'] || row.src?.textfragment || 0) +
            (row.src?.['plain-text'] || row.src?.plaintext || 0)
          );

          rowData = [
            row.phrase || '',
            Math.round(row.Top10?.title || 0),
            top10AllText,
            row.diff?.title || 0,
            diffAllText,
            Math.round(row.src?.title || 0),
            srcAllText
          ];
        } else {
          // Для Яндекса - полные данные
          rowData = [
            row.phrase || '',
            Math.round(row.Top10?.title || 0),
            Math.round(row.Top10?.body || 0),
            Math.round(row.Top10?.a || 0),
            Math.round(row.Top10?.['text-fragment'] || 0),
            Math.round(row.Top10?.['plain-text'] || 0),
            row.diff?.title || 0,
            row.diff?.body || 0,
            row.diff?.a || 0,
            row.diff?.['text-fragment'] || 0,
            row.diff?.['plain-text'] || 0,
            Math.round(row.src?.title || 0),
            0, // body всегда 0 для src
            Math.round(row.src?.a || 0),
            Math.round(row.src?.['text-fragment'] || 0),
            Math.round(row.src?.['plain-text'] || 0)
          ];
        }

        exportData.push(rowData);
      });

      // Добавляем строку с суммами (если есть данные о суммах)
      if (totalWordsData) {
        let totalsRow: (string | number)[];

        if (isGoogle) {
          const top10AllText = Math.round(
            (totalWordsData.top10?.body || 0) +
            (totalWordsData.top10?.a || 0) +
            (totalWordsData.top10?.textfragment || 0) +
            (totalWordsData.top10?.plaintext || 0)
          );

          const srcAllText =
            (totalWordsData.src?.body || 0) +
            (totalWordsData.src?.a || 0) +
            (totalWordsData.src?.textfragment || 0) +
            (totalWordsData.src?.plaintext || 0);

          totalsRow = [
            'Всего слов:',
            Math.round(totalWordsData.top10?.title || 0),
            top10AllText,
            '', // пустые ячейки для diff
            '',
            totalWordsData.src?.title || 0,
            srcAllText
          ];
        } else {
          totalsRow = [
            'Всего слов:',
            Math.round(totalWordsData.top10?.title || 0),
            Math.round(totalWordsData.top10?.body || 0),
            Math.round(totalWordsData.top10?.a || 0),
            Math.round(totalWordsData.top10?.textfragment || 0),
            Math.round(totalWordsData.top10?.plaintext || 0),
            '', // пустые ячейки для diff
            '',
            '',
            '',
            '',
            totalWordsData.src?.title || 0,
            0,
            totalWordsData.src?.a || 0,
            totalWordsData.src?.textfragment || 0,
            totalWordsData.src?.plaintext || 0
          ];
        }

        exportData.push(totalsRow);
      }

      // Создаем рабочую книгу
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(exportData);

      // Настраиваем ширину колонок
      const columnWidths = isGoogle
        ? [
          { wch: 25 }, // Фразы
          { wch: 12 }, // Top10 title
          { wch: 15 }, // Top10 all-text
          { wch: 12 }, // diff title
          { wch: 15 }, // diff all-text
          { wch: 12 }, // src title
          { wch: 15 }  // src all-text
        ]
        : [
          { wch: 25 }, // Фразы
          { wch: 10 }, // Top10 columns
          { wch: 10 },
          { wch: 8 },
          { wch: 12 },
          { wch: 12 },
          { wch: 10 }, // diff columns
          { wch: 10 },
          { wch: 8 },
          { wch: 12 },
          { wch: 12 },
          { wch: 10 }, // src columns
          { wch: 10 },
          { wch: 8 },
          { wch: 12 },
          { wch: 12 }
        ];

      worksheet['!cols'] = columnWidths;

      // Объединение ячеек для заголовков
      const merges = isGoogle
        ? [
          // Объединение "Фразы" (A1:A2)
          { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
          // Объединение "Top10" (B1:C1)
          { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } },
          // Объединение "diff" (D1:E1)
          { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } },
          // Объединение "src" (F1:G1)
          { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } }
        ]
        : [
          // Объединение "Фразы" (A1:A2)
          { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
          // Объединение "Top10" (B1:F1)
          { s: { r: 0, c: 1 }, e: { r: 0, c: 5 } },
          // Объединение "diff" (G1:K1)
          { s: { r: 0, c: 6 }, e: { r: 0, c: 10 } },
          // Объединение "src" (L1:P1)
          { s: { r: 0, c: 11 }, e: { r: 0, c: 15 } }
        ];

      worksheet['!merges'] = merges;

      // Стилизация основных заголовков (первая строка)
      const mainHeaderStyle: CellStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" }, size: 12 },
        fill: { fgColor: { rgb: "374151" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };

      // Стилизация подзаголовков (вторая строка)
      const subHeaderStyle: CellStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" }, size: 10 },
        fill: { fgColor: { rgb: "4B5563" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };

      // Применяем стили к заголовкам
      for (let col = 0; col < mainHeaders.length; col++) {
        const mainCellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[mainCellAddress]) worksheet[mainCellAddress] = {};
        worksheet[mainCellAddress].s = mainHeaderStyle;

        const subCellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
        if (!worksheet[subCellAddress]) worksheet[subCellAddress] = {};
        worksheet[subCellAddress].s = subHeaderStyle;
      }

      // Стилизация строки с суммами (если есть)
      if (totalWordsData) {
        const totalsRowIndex = exportData.length - 1;
        const totalsStyle: CellStyle = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "DC2626" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };

        for (let col = 0; col < mainHeaders.length; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: totalsRowIndex, c: col });
          if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
          worksheet[cellAddress].s = totalsStyle;
        }
      }

      // Добавляем общие границы для всех ячеек с данными
      const dataStyle: CellStyle = {
        border: {
          top: { style: "thin", color: { rgb: "D1D5DB" } },
          bottom: { style: "thin", color: { rgb: "D1D5DB" } },
          left: { style: "thin", color: { rgb: "D1D5DB" } },
          right: { style: "thin", color: { rgb: "D1D5DB" } }
        },
        alignment: { horizontal: "center", vertical: "center" }
      };

      // Применяем границы к ячейкам с данными
      for (let row = 2; row < exportData.length - (totalWordsData ? 1 : 0); row++) {
        for (let col = 0; col < mainHeaders.length; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellAddress]) worksheet[cellAddress] = {};

          if (col === 0) {
            worksheet[cellAddress].s = {
              ...dataStyle,
              alignment: { horizontal: "left", vertical: "center" }
            };
          } else {
            worksheet[cellAddress].s = dataStyle;
          }
        }
      }

      // Добавляем лист в книгу
      XLSX.utils.book_append_sheet(workbook, worksheet, "Анализ фраз");

      // Генерируем имя файла с текущей датой
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
      const finalFilename = `${filename}_${dateStr}_${timeStr}.xlsx`;

      // Скачиваем файл
      XLSX.writeFile(workbook, finalFilename);

    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      alert('Произошла ошибка при создании файла. Попробуйте еще раз.');
    }
  };

  return (
    <button
      onClick={exportToXLSX}
      className={cn(className)}
      title="Скачать данные в формате Excel"
    >
      {buttonText}
    </button>
  );
};