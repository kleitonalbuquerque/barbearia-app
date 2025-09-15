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
  tableClassName = "min-w-full",
  onRowClick,
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div
        className="rounded shadow p-6 text-center"
        style={{ background: "var(--secondary)", color: "var(--text)" }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded shadow max-w-full sm:max-w-none">
      <table
        className={tableClassName + " min-w-[600px] sm:min-w-full"}
        style={{ background: "var(--secondary)" }}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ color: "var(--accent)", background: "var(--secondary)" }}
                className={
                  col.className ||
                  "px-4 py-3 text-left font-semibold whitespace-nowrap"
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
              style={{ color: "var(--text)" }}
              className="group border-b hover:bg-blue-50"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={col.className ? col.className.replace(/bg-[^\s]+/g, "") : "px-4 py-3"}
                  style={{ color: "var(--text)" }}
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
