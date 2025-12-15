import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BulkActions } from './BulkActions';

export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  selectedRows?: string[];
  onSelectionChange?: (selected: string[]) => void;
  getRowId?: (row: T) => string;
  bulkActions?: {
    onDelete?: (ids: string[]) => void;
    onExport?: (ids: string[]) => void;
    onActivate?: (ids: string[]) => void;
    onDeactivate?: (ids: string[]) => void;
    customActions?: Array<{ label: string; icon?: any; onClick: (ids: string[]) => void }>;
  };
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row) => row.id,
  bulkActions,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const column = columns.find((col) => col.id === sortColumn);
    if (!column || !column.sortable || !column.accessorKey) return 0;

    const aValue = a[column.accessorKey];
    const bValue = b[column.accessorKey];

    if (aValue === bValue) return 0;
    const comparison = aValue > bValue ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? sortedData.map(getRowId) : []);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedRows, rowId]);
      } else {
        onSelectionChange(selectedRows.filter((id) => id !== rowId));
      }
    }
  };

  const allSelected = selectedRows.length === sortedData.length && sortedData.length > 0;
  const someSelected = selectedRows.length > 0 && selectedRows.length < sortedData.length;

  return (
    <div className="space-y-4">
      {bulkActions && selectedRows.length > 0 && (
        <BulkActions
          selectedCount={selectedRows.length}
          onDelete={bulkActions.onDelete ? () => bulkActions.onDelete?.(selectedRows) : undefined}
          onExport={bulkActions.onExport ? () => bulkActions.onExport?.(selectedRows) : undefined}
          onActivate={bulkActions.onActivate ? () => bulkActions.onActivate?.(selectedRows) : undefined}
          onDeactivate={bulkActions.onDeactivate ? () => bulkActions.onDeactivate?.(selectedRows) : undefined}
          customActions={bulkActions.customActions?.map((action) => ({
            ...action,
            onClick: () => action.onClick(selectedRows),
          }))}
        />
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {onSelectionChange && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.id}>
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-3"
                      onClick={() => handleSort(column.id)}
                    >
                      {column.header}
                      {sortColumn === column.id ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="ml-2 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selectedRows.includes(rowId);
                return (
                  <TableRow
                    key={rowId}
                    className={cn(
                      onRowClick && 'cursor-pointer',
                      isSelected && 'bg-accent'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {onSelectionChange && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleSelectRow(rowId, checked as boolean)
                          }
                          aria-label={`Select row ${rowId}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.id}>
                        {column.cell
                          ? column.cell(row)
                          : column.accessorKey
                            ? row[column.accessorKey]
                            : null}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}



