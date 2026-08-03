import MuiPagination, { type PaginationProps as MuiPaginationProps } from '@mui/material/Pagination';
import { Box } from '@mui/material';
import { Typography } from '@/components/ui/Typography';

export interface PaginationProps extends MuiPaginationProps {
  totalItems?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  pageSize,
  page,
  count,
  ...rest
}) => {
  const from = totalItems && pageSize && page ? (page - 1) * pageSize + 1 : null;
  const to = totalItems && pageSize && page ? Math.min(page * pageSize, totalItems) : null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        pt: 2,
      }}
    >
      {from !== null && to !== null && totalItems !== undefined ? (
        <Typography variant="body2" color="text.secondary">
          Showing {from}–{to} of {totalItems}
        </Typography>
      ) : (
        <Box />
      )}
      <MuiPagination
        page={page}
        count={count}
        shape="rounded"
        color="primary"
        showFirstButton
        showLastButton
        {...rest}
      />
    </Box>
  );
};

export default Pagination;
