import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  emptyState?: ReactNode;
}

export function DataTable<T>({ data, columns, className, emptyState }: DataTableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-ink-500 uppercase bg-paper/50 border-b border-line">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={cn("px-6 py-4 font-medium tracking-wider", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-paper/50 transition-colors">
              {columns.map((col, j) => (
                <td key={j} className={cn("px-6 py-4", col.className)}>
                  {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey]) : null)}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-ink-500">
                {emptyState || "No data available."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
