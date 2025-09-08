import React from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  rowKey?: (row: T) => string | number;
  tableClassName?: string;
  onRowClick?: (row: T) => void;
}

function DataTable<T>({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado.",
  rowKey,
  tableClassName = "min-w-full bg-white dark:bg-gray-900",
  onRowClick,
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded shadow p-6 text-center text-gray-700 dark:text-gray-300">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded shadow max-w-full sm:max-w-none">
      <table className={tableClassName + " min-w-[600px] sm:min-w-full"}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={
                  col.className ||
                  "px-4 py-3 bg-gray-100 dark:bg-gray-800 text-left text-gray-800 dark:text-gray-200 font-semibold whitespace-nowrap"
                }
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={rowKey ? rowKey(row) : idx}
              className={
                "hover:bg-blue-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800" +
                (onRowClick ? " cursor-pointer" : "")
              }
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 text-gray-700 dark:text-gray-300"
                >
                  {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
