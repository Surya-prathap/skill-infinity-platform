import { useState, type ReactNode } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';

export interface EditorRenderProps<T extends { id: string }> {
  /** Existing item when editing, null when creating. */
  initial: T | null;
  onCancel: () => void;
  onSubmit: (values: Omit<T, 'id'>) => void;
}

interface CollectionEditorProps<T extends { id: string }> {
  items: T[];
  addLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon?: ReactNode;
  renderItem: (item: T, index: number) => ReactNode;
  renderEditor: (props: EditorRenderProps<T>) => ReactNode;
  onAdd: (values: Omit<T, 'id'>) => void;
  onUpdate: (id: string, values: Omit<T, 'id'>) => void;
  onRemove: (id: string) => void;
}

/** List + inline editor used by the collection steps of the wizard. */
export function CollectionEditor<T extends { id: string }>({
  items,
  addLabel,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  renderItem,
  renderEditor,
  onAdd,
  onUpdate,
  onRemove,
}: CollectionEditorProps<T>) {
  const [editing, setEditing] = useState<{ index: number; item: T | null } | null>(null);

  const handleSubmit = (values: Omit<T, 'id'>) => {
    if (editing?.item) {
      onUpdate(editing.item.id, values);
    } else {
      onAdd(values);
    }
    setEditing(null);
  };

  if (editing) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={editing.item?.id ?? 'new'}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {renderEditor({
            initial: editing.item,
            onCancel: () => setEditing(null),
            onSubmit: handleSubmit,
          })}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <Box>
      {items.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={addLabel}
          onAction={() => setEditing({ index: -1, item: null })}
        />
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2.5,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
                  }}
                >
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>{renderItem(item, index)}</Box>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      aria-label="Edit item"
                      onClick={() => setEditing({ index, item })}
                    >
                      <EditOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove">
                    <IconButton
                      size="small"
                      aria-label="Remove item"
                      color="error"
                      onClick={() => onRemove(item.id)}
                    >
                      <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </motion.div>
            ))}
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setEditing({ index: -1, item: null })}
            sx={{ mt: 2 }}
          >
            {addLabel}
          </Button>
        </>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
        {items.length} saved item{items.length === 1 ? '' : 's'}
      </Typography>
    </Box>
  );
}

export default CollectionEditor;
