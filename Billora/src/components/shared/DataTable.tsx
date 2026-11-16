"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "./Pagination";
import { EmptyState } from "./EmptyState";
import { TableSkeleton } from "./LoadingSkeleton";

export interface Column<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  // Optional pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    pageSize?: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are no records matching your query.",
  emptyActionLabel,
  onEmptyAction,
  pagination,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton rows={5} cols={columns.length} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className={`rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden ${className || ""}`}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#E5E7EB] hover:bg-transparent">
              {columns.map((column, idx) => (
                <TableHead
                  key={idx}
                  className={column.headerClassName || column.className}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIdx) => {
              const key = keyExtractor ? keyExtractor(row, rowIdx) : rowIdx;
              return (
                <TableRow
                  key={key}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {columns.map((column, colIdx) => (
                    <TableCell key={colIdx} className={column.className}>
                      {column.cell
                        ? column.cell(row, rowIdx)
                        : column.accessorKey
                        ? (row[column.accessorKey] as React.ReactNode)
                        : null}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="border-t border-[#E5E7EB] bg-slate-50/40 p-2">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}
