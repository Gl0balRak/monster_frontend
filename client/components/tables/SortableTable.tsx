import React, { useState } from "react";
import { cn } from "@/lib/utils.ts";
import { Checkbox } from "@/components/forms";
import { commonClasses } from "@/lib/design-system.ts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  sortType?: "string" | "number" | "competition";
  tooltip?: string;
}

export interface TableRow {
  id: string;
  [key: string]: any;
}

interface SortableTableProps {
  columns: TableColumn[];
  rows: TableRow[];
  allRows?: TableRow[]; // Все строки для корректной работы "выбрать все"
  selectedRows?: string[];
  onRowSelectionChange?: (selectedRows: string[]) => void;
  // Внешняя сортировка
  sortColumn?: string | null;
  sortDirection?: "asc" | "desc" | null;
  onSort?: (columnKey: string) => void;
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

export const SortableTable: React.FC<SortableTableProps> = ({
  columns,
  rows,
  allRows,
  selectedRows = [],
  onRowSelectionChange,
  sortColumn: externalSortColumn,
  sortDirection: externalSortDirection,
  onSort,
  className,
}) => {
  const [internalSortColumn, setInternalSortColumn] = useState<string | null>(null);
  const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(null);

  // Используем внешнюю сортировку если она есть, иначе внутреннюю
  const sortColumn = externalSortColumn !== undefined ? externalSortColumn : internalSortColumn;
  const sortDirection = externalSortDirection !== undefined ? externalSortDirection : internalSortDirection;

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    if (onSort) {
      // Используем внешний обработчик
      onSort(columnKey);
    } else {
      // Используем внутреннюю сортировку
      if (internalSortColumn === columnKey) {
        // Переключаем направление сортировки: asc -> desc -> null -> asc
        if (internalSortDirection === "asc") {
          setInternalSortDirection("desc");
        } else if (internalSortDirection === "desc") {
          setInternalSortColumn(null);
          setInternalSortDirection(null);
        } else {
          setInternalSortDirection("asc");
        }
      } else {
        setInternalSortColumn(columnKey);
        setInternalSortDirection("asc");
      }
    }
  };

  const handleSelectAll = () => {
    if (!onRowSelectionChange) return;

    const rowsToCheck = allRows || rows;
    if (selectedRows.length === rowsToCheck.length) {
      onRowSelectionChange([]);
    } else {
      onRowSelectionChange(rowsToCheck.map((row) => row.id));
    }
  };

  const handleRowSelection = (rowId: string) => {
    if (!onRowSelectionChange) return;

    if (selectedRows.includes(rowId)) {
      onRowSelectionChange(selectedRows.filter((id) => id !== rowId));
    } else {
      onRowSelectionChange([...selectedRows, rowId]);
    }
  };

  const sortedRows = React.useMemo(() => {
    // Если используется внешняя сортировка, просто возвращаем строки как есть
    if (onSort) return rows;

    if (!sortColumn || !sortDirection) return rows;

    const column = columns.find((col) => col.key === sortColumn);
    const sortType = column?.sortType || "string";

    return [...rows].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let result = 0;

      if (sortType === "number") {
        // Parse numbers from strings, handle percentage signs
        const aNum = parseFloat(String(aValue).replace(/[^\d.-]/g, "")) || 0;
        const bNum = parseFloat(String(bValue).replace(/[^\d.-]/g, "")) || 0;
        result = aNum - bNum;
      } else if (sortType === "competition") {
        // Custom sort for competition levels
        const competitionOrder = {
          Низкая: 1,
          Умеренная: 2,
          Высокая: 3,
          "Нет данных": 0,
        };
        const aOrder =
          competitionOrder[aValue as keyof typeof competitionOrder] || 0;
        const bOrder =
          competitionOrder[bValue as keyof typeof competitionOrder] || 0;
        result = aOrder - bOrder;
      } else {
        // String comparison
        const aStr = String(aValue);
        const bStr = String(bValue);
        result = aStr.localeCompare(bStr);
      }

      return sortDirection === "asc" ? result : -result;
    });
  }, [rows, sortColumn, sortDirection, columns, onSort]);

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return null;

    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  const rowsToCheck = allRows || rows;
  const allSelected = rowsToCheck.length > 0 && selectedRows.length === rowsToCheck.length;
  const someSelected =
    selectedRows.length > 0 && selectedRows.length < rowsToCheck.length;

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {/* Колонка с чекбоксом для выбора всех */}
            {onRowSelectionChange && (
              <th className="px-4 py-3 text-left border-b">
                <Checkbox checked={allSelected} onChange={handleSelectAll} />
              </th>
            )}

            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-left text-sm font-medium text-gray-700 border-b",
                  {
                    "cursor-pointer hover:bg-gray-200 select-none":
                      column.sortable,
                  },
                  commonClasses.font,
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {column.tooltip && (
                    <span className="text-gray-500" title={column.tooltip}>
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onRowSelectionChange ? 1 : 0)}
                className={cn(
                  "px-4 py-8 text-center text-gray-5",
                  commonClasses.font,
                )}
              >
                Нет данных для отображения
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => (
              <tr
                key={row.id}
                className={cn("border-b hover:bg-gray-50", {
                  "bg-blue-50": selectedRows.includes(row.id),
                })}
              >
                {/* Колонка с чекбоксом для выбора строки */}
                {onRowSelectionChange && (
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleRowSelection(row.id)}
                    />
                  </td>
                )}

                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-sm text-gray-900",
                      commonClasses.font,
                    )}
                  >
                    {row[column.key] || "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
