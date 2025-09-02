import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressIndicator } from "@/components/progress_bars/ProgressIndicator";

interface LSIItem {
  ngram: string;
  forms?: string[];
  competitors: number;
  avg_count: number;
  my_count: number;
  coverage_percent: number;
}

interface LSITableProps {
  title: string;
  data: LSIItem[];
  itemsPerPage?: number;
  defaultExpanded?: boolean;
}

type PerPageOption = number | "all";

export const LSITable: React.FC<LSITableProps> = ({
  title,
  data,
  itemsPerPage = 15,
  defaultExpanded = true,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<PerPageOption>(itemsPerPage);
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const totalPages = perPage === "all" ? 1 : Math.ceil(data.length / perPage);
  const currentData =
    perPage === "all"
      ? data
      : data.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  const avgCoverage =
    data.length > 0
      ? Math.round(
          data.reduce((sum, item) => sum + item.coverage_percent, 0) /
            data.length,
        )
      : 0;

  // Процент выполнения (сколько у нас есть относительно нужного)
  const avgCompletion =
    data.length > 0
      ? Math.round(
          data.reduce((sum, item) => {
            const completion =
              item.avg_count > 0
                ? Math.min((item.my_count / item.avg_count) * 100, 100)
                : 0;
            return sum + completion;
          }, 0) / data.length,
        )
      : 0;

  // Процент недостающих слов
  const avgDeficit = 100 - avgCompletion;

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPerPage(value === "all" ? "all" : parseInt(value));
    setCurrentPage(1);
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === "number") {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label={isExpanded ? "Свернуть" : "Развернуть"}
            >
              {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-600 font-medium">{avgCompletion}%</span>
            <span className="text-red-600 font-medium">{avgDeficit}%</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-800 text-white">
                  <th className="text-left py-3 px-4 font-medium text-sm">
                    Слово
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-sm">
                    У конкурентов
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-sm">
                    Встречается на странице (усеченное среднее)
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-sm">
                    У вас
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-sm min-w-[180px]">
                    У вас / Нужно
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {item.ngram}
                      </div>
                      {item.forms && item.forms.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Формы: {item.forms.slice(0, 3).join(", ")}
                          {item.forms.length > 3 &&
                            ` +${item.forms.length - 3}`}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span className="text-sm">{item.competitors} из 8</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      {item.avg_count}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={cn(
                          "font-medium",
                          item.my_count === 0
                            ? "text-red-600"
                            : "text-blue-600",
                        )}
                      >
                        {item.my_count}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="px-2">
                        <ProgressIndicator
                          current={item.my_count}
                          target={item.avg_count}
                          showDifference={true}
                          className="w-full"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Строк на странице:
                </span>
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
                <span className="text-sm text-gray-500 ml-4">
                  {perPage === "all"
                    ? `Показано все ${data.length} n-грамм`
                    : `Показано ${currentData.length} из ${data.length} n-грамм`}
                </span>
              </div>

              {perPage !== "all" && totalPages > 1 && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={cn(
                      "px-2 py-1 text-gray-500 hover:text-gray-700",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                    aria-label="Первая страница"
                  >
                    «
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={cn(
                      "px-2 py-1 text-gray-500 hover:text-gray-700",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                    aria-label="Предыдущая страница"
                  >
                    ‹
                  </button>

                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <span key={index} className="px-2 py-1 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={index}
                        onClick={() => handlePageClick(page)}
                        className={cn(
                          "px-3 py-1 rounded transition-colors",
                          currentPage === page
                            ? "bg-red-600 text-white"
                            : "text-gray-700 hover:bg-gray-100",
                        )}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "px-2 py-1 text-gray-500 hover:text-gray-700",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                    aria-label="Следующая страница"
                  >
                    ›
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "px-2 py-1 text-gray-500 hover:text-gray-700",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                    aria-label="Последняя страница"
                  >
                    »
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};