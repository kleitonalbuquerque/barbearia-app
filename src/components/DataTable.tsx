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
  rowClassName?: string | ((row: T, idx: number) => string);
}

function DataTable<T>({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado.",
  rowKey,
  tableClassName = "min-w-full",
  onRowClick,
  rowClassName,
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
      <table className={tableClassName + " min-w-[600px] sm:min-w-full"}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.className || "px-4 py-3 text-left font-semibold whitespace-nowrap"}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            let trClass = "border-t border-gray-700";
            if (typeof rowClassName === "function") {
              trClass += " " + rowClassName(row, idx);
            } else if (typeof rowClassName === "string") {
              trClass += " " + rowClassName;
            }
            return (
              <tr
                key={rowKey ? rowKey(row) : idx}
                className={trClass}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={(col.className ? col.className.replace(/bg-[^\s]+/g, "") : "") + " p-3"}
                    style={{ border: "none" }}
                  >
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
