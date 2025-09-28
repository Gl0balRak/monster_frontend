import React, { useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
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
type SortField = "ngram" | "competitors" | "avg_count" | "my_count" | "coverage_percent";
type SortDirection = "asc" | "desc" | "none";

export const LSITable: React.FC<LSITableProps> = ({
  title,
  data,
  itemsPerPage = 15,
  defaultExpanded = true,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<PerPageOption>(itemsPerPage);
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({ field: "avg_count", direction: "desc" });

  const sortedData = React.useMemo(() => {
    if (sortConfig.direction === "none") return data;

    const sortableData = [...data];
    
    return sortableData.sort((a, b) => {
      let aValue: any = a[sortConfig.field];
      let bValue: any = b[sortConfig.field];

      if (sortConfig.field === "coverage_percent") {
        aValue = a.coverage_percent || 0;
        bValue = b.coverage_percent || 0;
      }

      let result = 0;

      if (sortConfig.field === "ngram") {
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
    if (field === "coverage_percent") return;
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
    setCurrentPage(1);
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

  const totalPages = perPage === "all" ? 1 : Math.ceil(sortedData.length / perPage);
  const currentData =
    perPage === "all"
      ? sortedData
      : sortedData.slice((currentPage - 1) * perPage, currentPage * perPage);

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
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 relative min-h-[64px] flex items-center">
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
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <colgroup>
                <col className="w-[25%]" />
                <col className="w-[15%]" />
                <col className="w-[20%]" />
                <col className="w-[15%]" />
                <col className="w-[25%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200 bg-gray-800 text-white">
                  <th 
                    className="text-left py-3 px-4 font-medium text-sm cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSortClick("ngram")}
                    title={getSortTooltip("ngram")}
                  >
                    <div className="flex items-center gap-2 truncate">
                      Слово
                      {getSortIcon("ngram")}
                    </div>
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-medium text-sm cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSortClick("competitors")}
                    title={getSortTooltip("competitors")}
                  >
                    <div className="flex items-center gap-2 justify-center truncate">
                      У конкурентов
                      {getSortIcon("competitors")}
                    </div>
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-medium text-sm cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSortClick("avg_count")}
                    title={getSortTooltip("avg_count")}
                  >
                    <div className="flex items-center gap-2 justify-center truncate">
                      Встречается на странице
                      <br />
                      <span className="text-xs font-normal">(усеченное среднее)</span>
                      {getSortIcon("avg_count")}
                    </div>
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-medium text-sm cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSortClick("my_count")}
                    title={getSortTooltip("my_count")}
                  >
                    <div className="flex items-center gap-2 justify-center truncate">
                      У вас
                      {getSortIcon("my_count")}
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-sm cursor-default">
                  <div className="flex items-center gap-2 justify-center truncate">
                    У вас / Нужно
                  </div>
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