import { useMemo, useState } from 'react';
import { Box, Button, Grid, IconButton, Tooltip } from '@mui/material';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Avatar, Stack, Typography, Typography as UiTypography } from '@/components/ui';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  AdvancedDataTable,
  type AdminColumn,
  FilterDrawer,
  FilterSection,
  FilterChipRow,
  FilterMultiChipRow,
  FilterRange,
  RoleBadge,
  UserDrawer,
  AdminTableSkeleton,
} from '@/components/admin';
import { ConfirmDialog } from '@/components/feedback';
import { formatCurrency, formatRelativeTime, showInfo } from '@/utils';
import { useAdminUsersQuery, useAdminUserStatusMutation } from '@/features/admin';
import type { AdminUser } from '@/types';

type StatusFilter = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'BANNED';

export const UsersPage: React.FC = () => {
  useDocumentTitle('User Management');
  const { users, isLoading } = useAdminUsersQuery(0, 100);
  const statusMutation = useAdminUserStatusMutation();

  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter | null>(null);
  const [spendRange, setSpendRange] = useState<[number, number]>([0, 2500]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const activeFilters =
    roleFilter.length + (statusFilter ? 1 : 0) + (spendRange[0] > 0 || spendRange[1] < 2500 ? 1 : 0);

  const filtered = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter.length > 0 && !roleFilter.includes(user.role)) return false;
      if (statusFilter && user.status !== statusFilter) return false;
      if (user.totalSpend < spendRange[0] || user.totalSpend > spendRange[1]) return false;
      return true;
    });
  }, [users, roleFilter, statusFilter, spendRange]);

  const resetFilters = () => {
    setRoleFilter([]);
    setStatusFilter(null);
    setSpendRange([0, 2500]);
  };

  const toggleStatus = (user: AdminUser) => {
    const active = user.status !== 'ACTIVE';
    statusMutation.mutate({ userId: user.id, active });
    setSelectedUser(active ? { ...user, status: 'ACTIVE' } : { ...user, status: 'SUSPENDED' });
  };

  const handleBulk = (action: 'suspend' | 'activate') => (selected: AdminUser[]) => {
    selected.forEach((user) => statusMutation.mutate({ userId: user.id, active: action === 'activate' }));
    showInfo(`${action === 'suspend' ? 'Suspended' : 'Activated'} ${selected.length} user${selected.length > 1 ? 's' : ''}`);
  };

  const stats = useMemo(
    () => [
      { label: 'Total users', value: users.length.toLocaleString(), icon: <PeopleAltOutlinedIcon />, color: '#6D5DF6' },
      { label: 'Active', value: users.filter((u) => u.status === 'ACTIVE').length.toLocaleString(), icon: <BoltOutlinedIcon />, color: '#10B981' },
      { label: 'Suspended', value: users.filter((u) => u.status === 'SUSPENDED').length.toLocaleString(), icon: <BlockOutlinedIcon />, color: '#EF4444' },
      { label: 'Pending', value: users.filter((u) => u.status === 'PENDING').length.toLocaleString(), icon: <PersonAddAltOutlinedIcon />, color: '#F59E0B' },
    ],
    [users],
  );

  const columns: AdminColumn<AdminUser>[] = [
    {
      id: 'name',
      label: 'User',
      sortable: true,
      sortValue: (row) => row.name,
      render: (row) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar firstName={row.name.split(' ')[0]} lastName={row.name.split(' ')[1]} email={row.email} size={38} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.email}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    { id: 'role', label: 'Role', sortable: true, sortValue: (row) => row.role, render: (row) => <RoleBadge role={row.role} /> },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => (
        <StatusBadge
          label={row.status}
          color={row.status === 'ACTIVE' ? 'success' : row.status === 'SUSPENDED' || row.status === 'BANNED' ? 'error' : 'warning'}
        />
      ),
    },
    { id: 'sessionsCompleted', label: 'Sessions', align: 'center', sortable: true, sortValue: (row) => row.sessionsCompleted },
    { id: 'totalSpend', label: 'Spend', align: 'right', sortable: true, sortValue: (row) => row.totalSpend, render: (row) => <Typography variant="body2" fontWeight={700}>{formatCurrency(row.totalSpend)}</Typography> },
    { id: 'walletBalance', label: 'Wallet', align: 'right', sortable: true, sortValue: (row) => row.walletBalance, render: (row) => <Typography variant="body2">{formatCurrency(row.walletBalance)}</Typography> },
    { id: 'joinedAt', label: 'Joined', sortable: true, sortValue: (row) => row.joinedAt, render: (row) => <Typography variant="caption" color="text.secondary">{formatRelativeTime(row.joinedAt)}</Typography> },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end" onClick={(event) => event.stopPropagation()}>
          <Tooltip title="View profile">
            <IconButton size="small" onClick={() => { setSelectedUser(row); setDrawerOpen(true); }} aria-label={`View ${row.name}`}>
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={row.status === 'ACTIVE' ? 'Suspend' : 'Activate'}>
            <IconButton
              size="small"
              color={row.status === 'ACTIVE' ? 'error' : 'success'}
              onClick={() => toggleStatus(row)}
              aria-label={`${row.status === 'ACTIVE' ? 'Suspend' : 'Activate'} ${row.name}`}
            >
              {row.status === 'ACTIVE' ? <BlockOutlinedIcon fontSize="small" /> : <CheckCircleOutlineOutlinedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete user">
            <IconButton size="small" onClick={() => setDeleteTarget(row)} aria-label={`Delete ${row.name}`}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <Box>
      <PageHeader
        title="User Management"
        subtitle="Search, filter and manage every account on the platform."
        actions={
          <FilterDrawer
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            onReset={resetFilters}
            activeCount={activeFilters}
            title="Filter users"
            onToggle={() => setFilterOpen(true)}
          >
            <FilterSection label="Role">
              <FilterMultiChipRow
                options={[
                  { label: 'Learner', value: 'ROLE_LEARNER' },
                  { label: 'Mentor', value: 'ROLE_MENTOR' },
                  { label: 'Admin', value: 'ROLE_ADMIN' },
                ]}
                selected={roleFilter}
                onToggle={(value) =>
                  setRoleFilter((current) => (current.includes(value) ? current.filter((v) => v !== value) : [...current, value]))
                }
              />
            </FilterSection>
            <FilterSection label="Status">
              <FilterChipRow
                options={[
                  { label: 'Active', value: 'ACTIVE' },
                  { label: 'Suspended', value: 'SUSPENDED' },
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Banned', value: 'BANNED' },
                ]}
                selected={statusFilter}
                onSelect={(value) => setStatusFilter(value as StatusFilter | null)}
              />
            </FilterSection>
            <FilterSection label="Total spend">
              <FilterRange
                label="Spend range"
                value={spendRange}
                min={0}
                max={2500}
                step={50}
                onChange={setSpendRange}
                format={(value) => formatCurrency(value)}
              />
            </FilterSection>
          </FilterDrawer>
        }
      />

      {/* Stats strip */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, sm: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`,
                  boxShadow: `0 6px 14px ${stat.color}3D`,
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <UiTypography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block' }}>
                  {stat.label}
                </UiTypography>
                <UiTypography variant="subtitle1" fontWeight={800}>
                  {stat.value}
                </UiTypography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <AdvancedDataTable<AdminUser>
        columns={columns}
        rows={filtered}
        keyExtractor={(row) => row.id}
        searchKeys={(row) => `${row.name} ${row.email} ${row.role} ${row.status}`}
        searchPlaceholder="Search name, email, role…"
        title={`All users (${filtered.length})`}
        selectable
        exportFilename="skill-infinity-users"
        onRowClick={(row) => {
          setSelectedUser(row);
          setDrawerOpen(true);
        }}
        bulkActions={(selected) => (
          <>
            <Button
              size="small"
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}
              variant="outlined"
              onClick={() => handleBulk('activate')(selected)}
            >
              Activate
            </Button>
            <Button size="small" sx={{ color: '#fff' }} variant="text" onClick={() => handleBulk('suspend')(selected)}>
              Suspend
            </Button>
          </>
        )}
        emptyTitle="No users match your filters"
        emptyDescription="Adjust the filters or clear the search to see all accounts."
        maxHeight={560}
      />

      <UserDrawer
        user={selectedUser}
        open={drawerOpen && selectedUser !== null}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedUser(null);
        }}
        onToggleStatus={toggleStatus}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete user account"
        message={
          deleteTarget
            ? `This permanently deletes ${deleteTarget.name}'s account and all associated data. This action cannot be undone.`
            : undefined
        }
        confirmText="Delete account"
        variant="danger"
        onConfirm={() => {
          showInfo(`Deletion request queued for ${deleteTarget?.name}`);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default UsersPage;
