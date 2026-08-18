import type { ReactNode } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Typography } from '@/components/ui/Typography';
import { EmptyState } from '@/components/feedback';
import { TableSkeleton } from '@/components/feedback/Skeleton';

export interface DataTableColumn<T> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  dense?: boolean;
  maxHeight?: number | string;
}

export function DataTable<T>({
  columns,
  rows,
  keyExtractor,
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There is nothing to display here yet.',
  dense = false,
  maxHeight,
}: DataTableProps<T>) {
  if (!loading && rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight, borderRadius: 2 }}>
      <Table stickyHeader={Boolean(maxHeight)} size={dense ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.id} align={column.align} sx={{ width: column.width }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ border: 0, py: 2 }}>
                <TableSkeleton rows={4} columns={columns.length} />
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow hover key={keyExtractor(row)}>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align}>
                    {column.render
                      ? column.render(row, index)
                      : ((row as Record<string, ReactNode>)[column.id] ?? (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        ))}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;
