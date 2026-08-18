import { useState, type ComponentType, type ReactNode } from 'react';
import { Box, Button } from '@mui/material';
import { Card, ConfirmDialog, EmptyState, Modal, SectionHeader } from '@/components';
import { ListSkeleton } from '@/components/feedback/Skeleton';
import AddIcon from '@mui/icons-material/Add';

export interface SectionFormProps<TForm> {
  defaultValues: TForm;
  submitting: boolean;
  onSubmit: (values: TForm) => void;
}

interface SectionPageProps<TItem extends { id?: string }, TForm> {
  icon: ReactNode;
  color: string;
  title: string;
  subtitle: string;
  addLabel: string;
  modalTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  loading?: boolean;
  items: TItem[];
  renderItem: (item: TItem, actions: { onEdit: () => void; onDelete: () => void }) => ReactNode;
  FormComponent: ComponentType<SectionFormProps<TForm>>;
  formDefaultValues: (item: TItem | null) => TForm;
  handleSubmit: (values: TForm, item: TItem | null) => void | Promise<unknown>;
  handleDelete: (item: TItem) => void | Promise<unknown>;
  deleteMessage: (item: TItem) => string;
}

/**
 * Shared shell for list-based profile sections (education, experience,
 * skills, languages): renders the list, an add/edit modal backed by a
 * react-hook-form component, and a delete confirmation dialog.
 */
export const SectionPage = <TItem extends { id?: string }, TForm>({
  icon,
  color,
  title,
  subtitle,
  addLabel,
  modalTitle,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  loading = false,
  items,
  renderItem,
  FormComponent,
  formDefaultValues,
  handleSubmit,
  handleDelete,
  deleteMessage,
}: SectionPageProps<TItem, TForm>) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TItem | null>(null);
  const [deleting, setDeleting] = useState<TItem | null>(null);
  const [busy, setBusy] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (item: TItem) => {
    setEditing(item);
    setOpen(true);
  };

  const onFormSubmit = async (values: TForm) => {
    setBusy(true);
    try {
      await handleSubmit(values, editing);
      setOpen(false);
      setEditing(null);
    } finally {
      setBusy(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await handleDelete(deleting);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
      <SectionHeader
        icon={icon}
        iconColor={color}
        title={title}
        subtitle={subtitle}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
            {addLabel}
          </Button>
        }
      />

      {loading ? (
        <ListSkeleton count={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={icon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel ?? addLabel}
          onAction={openAdd}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((item) => renderItem(item, { onEdit: () => openEdit(item), onDelete: () => setDeleting(item) }))}
        </Box>
      )}

      {/* Add / edit modal */}
      <Modal
        open={open}
        onClose={() => {
          if (!busy) {
            setOpen(false);
            setEditing(null);
          }
        }}
        title={editing ? `Edit ${modalTitle}` : `Add ${modalTitle}`}
        maxWidth={560}
      >
        <FormComponent
          key={editing?.id ?? 'new'}
          defaultValues={formDefaultValues(editing)}
          submitting={busy}
          onSubmit={(values) => void onFormSubmit(values)}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${modalTitle}?`}
        message={deleting ? deleteMessage(deleting) : undefined}
        confirmText="Delete"
        cancelText="Keep it"
        variant="danger"
        loading={busy}
        onConfirm={() => void onConfirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </Card>
  );
};

export default SectionPage;
