import { useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import { Stack, Typography } from '@/components/ui';
import { AnimatePresence, motion } from 'framer-motion';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import { EmptyState } from '@/components/feedback';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { showSuccess } from '@/utils';

export interface AdminColumn<T> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render?: (row: T, index: number) => ReactNode;
}

interface AdvancedDataTableProps<T> {
  columns: AdminColumn<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  /** Builds the searchable text for a row. */
  searchKeys?: (row: T) => string;
  searchPlaceholder?: string;
  title?: string;
  toolbar?: ReactNode;
  selectable?: boolean;
  /** Rendered in a floating bar when rows are selected. */
  bulkActions?: (selected: T[]) => ReactNode;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  exportFilename?: string;
  dense?: boolean;
  maxHeight?: number | string;
  'aria-label'?: string;
}

export function AdvancedDataTable<T>({
  columns,
  rows,
  keyExtractor,
  loading = false,
  searchKeys,
  searchPlaceholder = 'Search…',
  title,
  toolbar,
  selectable = false,
  bulkActions,
  pageSize: initialPageSize = 8,
  pageSizeOptions = [8, 12, 20],
  onRowClick,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  exportFilename = 'export',
  dense = false,
  maxHeight,
  'aria-label': ariaLabel = 'Data table',
}: AdvancedDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sizeMenuAnchor, setSizeMenuAnchor] = useState<null | HTMLElement>(null);

  const filtered = useMemo(() => {
    let list = rows;
    const query = search.trim().toLowerCase();
    if (query && searchKeys) {
      list = list.filter((row) => searchKeys(row).toLowerCase().includes(query));
    }
    if (sortKey) {
      const column = columns.find((c) => c.id === sortKey);
      if (column) {
        const getValue = column.sortValue ?? ((row: T) => String((row as Record<string, unknown>)[column.id] ?? ''));
        list = [...list].sort((a, b) => {
          const av = getValue(a);
          const bv = getValue(b);
          const comparison =
            typeof av === 'number' && typeof bv === 'number'
              ? av - bv
              : String(av).localeCompare(String(bv));
          return sortDir === 'asc' ? comparison : -comparison;
        });
      }
    }
    return list;
  }, [rows, search, searchKeys, sortKey, sortDir, columns]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const paged = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const allSelected = paged.length > 0 && paged.every((row) => selected.has(keyExtractor(row)));

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        paged.forEach((row) => next.delete(keyExtractor(row)));
      } else {
        paged.forEach((row) => next.add(keyExtractor(row)));
      }
      return next;
    });
  };

  const handleSort = (column: AdminColumn<T>) => {
    if (!column.sortable) return;
    if (sortKey === column.id) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(column.id);
      setSortDir('asc');
    }
  };

  const handleExport = () => {
    const header = columns.map((c) => c.label).join(',');
    const body = filtered
      .map((row) =>
        columns
          .map((column) => {
            const raw = (row as Record<string, unknown>)[column.id];
            const value = typeof raw === 'string' || typeof raw === 'number' ? String(raw) : '';
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(','),
      )
      .join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFilename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccess('Report exported as CSV');
  };

  const selectedRows = filtered.filter((row) => selected.has(keyExtractor(row)));

  return (
    <Box>
      {/* Toolbar */}
      {(title || searchKeys || toolbar || selectable) && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ mb: 2, flexWrap: 'wrap', gap: 1.5 }}
        >
          {title && (
            <Typography variant="subtitle1" fontWeight={700} sx={{ mr: 'auto' }}>
              {title}
            </Typography>
          )}
          {!title && <Box sx={{ flexGrow: 1 }} />}
          {searchKeys && (
            <TextField
              size="small"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              slotProps={{
                input: {
                  startAdornment: <SearchOutlinedIcon sx={{ fontSize: 18, mr: 1, color: 'text.disabled' }} />,
                },
              }}
              sx={{ width: { xs: '100%', sm: 240 } }}
              aria-label={searchPlaceholder}
            />
          )}
          {toolbar}
          {selectable && (
            <Tooltip title="Export filtered rows as CSV">
              <IconButton size="small" onClick={handleExport} aria-label="Export CSV">
                <FileDownloadOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )}

      <TableContainer sx={{ maxHeight, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Table size={dense ? 'small' : 'medium'} aria-label={ariaLabel}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" sx={{ width: 44 }}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={selected.size > 0 && !allSelected}
                    onChange={toggleAll}
                    size="small"
                    slotProps={{ input: { 'aria-label': 'Select all rows' } }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{
                    width: column.width,
                    cursor: column.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => handleSort(column)}
                  aria-sort={
                    sortKey === column.id
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <Stack direction="row" alignItems="center" spacing={0.5} justifyContent={column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start'}>
                    {column.label}
                    {column.sortable &&
                      (sortKey === column.id ? (
                        sortDir === 'asc' ? (
                          <ArrowUpwardIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        ) : (
                          <ArrowDownwardIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        )
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: 14, color: 'text.disabled', opacity: 0.4 }} />
                      ))}
                  </Stack>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} sx={{ border: 0, py: 2 }}>
                  <TableSkeleton rows={6} columns={columns.length} />
                </TableCell>
              </TableRow>
            ) : paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} sx={{ border: 0 }}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, index) => {
                const id = keyExtractor(row);
                const isSelected = selected.has(id);
                return (
                  <TableRow
                    hover
                    key={id}
                    selected={isSelected}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={onRowClick ? { cursor: 'pointer' } : undefined}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          size="small"
                          slotProps={{ input: { 'aria-label': `Select row ${id}` } }}
                        />
                      </TableCell>
                    )}
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
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer */}
      {!loading && filtered.length > 0 && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {filtered.length === 0
              ? 'No results'
              : `Showing ${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, filtered.length)} of ${filtered.length}`}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title="Rows per page">
              <IconButton size="small" onClick={(event) => setSizeMenuAnchor(event.currentTarget)} aria-label="Rows per page">
                <ViewAgendaOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={sizeMenuAnchor}
              open={Boolean(sizeMenuAnchor)}
              onClose={() => setSizeMenuAnchor(null)}
            >
              {pageSizeOptions.map((size) => (
                <MenuItem
                  key={size}
                  selected={size === pageSize}
                  onClick={() => {
                    setPageSize(size);
                    setPage(0);
                    setSizeMenuAnchor(null);
                  }}
                >
                  {size} rows
                </MenuItem>
              ))}
            </Menu>
            <IconButton size="small" disabled={currentPage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} aria-label="Previous page">
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" fontWeight={700}>
              {currentPage + 1} / {pageCount}
            </Typography>
            <IconButton size="small" disabled={currentPage >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} aria-label="Next page">
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      )}

      {/* Bulk action bar */}
      <AnimatePresence>
        {selectable && selectedRows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
          >
            <Box
              sx={{
                mt: 1.5,
                px: 2,
                py: 1.25,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                border: 1,
                borderColor: 'primary.main',
                bgcolor: 'primary.main',
                color: '#fff',
                boxShadow: 4,
              }}
            >
              <MoreVertIcon fontSize="small" />
              <Typography variant="body2" fontWeight={700}>
                {selectedRows.length} selected
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              {bulkActions?.(selectedRows)}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

export default AdvancedDataTable;
