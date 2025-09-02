import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/forms";
import { commonClasses } from "@/lib/design-system";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface TableRow {
  id: string;
  [key: string]: any;
}

interface SortableTableProps {
  columns: TableColumn[];
  rows: TableRow[];
  selectedRows?: string[];
  onRowSelectionChange?: (selectedRows: string[]) => void;
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

export const SortableTable: React.FC<SortableTableProps> = ({
  columns,
  rows,
  selectedRows = [],
  onRowSelectionChange,
  className,
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      // Переключаем направление сортировки: asc -> desc -> null -> asc
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (!onRowSelectionChange) return;

    if (selectedRows.length === rows.length) {
      onRowSelectionChange([]);
    } else {
      onRowSelectionChange(rows.map((row) => row.id));
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
    if (!sortColumn || !sortDirection) return rows;

    return [...rows].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? result : -result;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      const result = aStr.localeCompare(bStr);
      return sortDirection === "asc" ? result : -result;
    });
  }, [rows, sortColumn, sortDirection]);

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return null;

    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  const allSelected = rows.length > 0 && selectedRows.length === rows.length;
  const someSelected =
    selectedRows.length > 0 && selectedRows.length < rows.length;

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {/* Колонка с чекбоксом для выбора всех */}
            {onRowSelectionChange && (
              <th className="px-4 py-3 text-left border-b">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleSelectAll}
                />
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
                <div className="flex items-center">
                  {column.label}
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
