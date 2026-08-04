import { Divider, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import ForwardOutlinedIcon from '@mui/icons-material/ForwardOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import type { ChatMessage } from '@/types';

interface MessageActionMenuProps {
  anchorEl: HTMLElement | null;
  message: ChatMessage | null;
  isOwn: boolean;
  onClose: () => void;
  onReply: () => void;
  onForward: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: (pinned: boolean) => void;
  onToggleBookmark: (bookmarked: boolean) => void;
}

export const MessageActionMenu: React.FC<MessageActionMenuProps> = ({
  anchorEl,
  message,
  isOwn,
  onClose,
  onReply,
  onForward,
  onCopy,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleBookmark,
}) => {
  const open = Boolean(anchorEl) && Boolean(message);

  const run = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 210, py: 0.75 } } }}
    >
      <MenuItem onClick={run(onReply)} dense>
        <ListItemIcon>
          <ReplyOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Reply</ListItemText>
      </MenuItem>
      <MenuItem onClick={run(onForward)} dense>
        <ListItemIcon>
          <ForwardOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Forward</ListItemText>
      </MenuItem>
      <MenuItem onClick={run(onCopy)} dense>
        <ListItemIcon>
          <ContentCopyOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Copy text</ListItemText>
      </MenuItem>
      {isOwn && (
        <MenuItem onClick={run(onEdit)} dense>
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit message</ListItemText>
        </MenuItem>
      )}
      <MenuItem
        onClick={run(() => onTogglePin(!message?.pinned))}
        dense
      >
        <ListItemIcon>
          <PushPinOutlinedIcon fontSize="small" color={message?.pinned ? 'primary' : 'inherit'} />
        </ListItemIcon>
        <ListItemText>{message?.pinned ? 'Unpin message' : 'Pin message'}</ListItemText>
      </MenuItem>
      <MenuItem
        onClick={run(() => onToggleBookmark(!message?.bookmarked))}
        dense
      >
        <ListItemIcon>
          {message?.bookmarked ? (
            <BookmarkOutlinedIcon fontSize="small" color="primary" />
          ) : (
            <BookmarkBorderOutlinedIcon fontSize="small" />
          )}
        </ListItemIcon>
        <ListItemText>{message?.bookmarked ? 'Remove bookmark' : 'Bookmark message'}</ListItemText>
      </MenuItem>
      {isOwn && (
        <>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={run(onDelete)} dense sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete message</ListItemText>
          </MenuItem>
        </>
      )}
    </Menu>
  );
};

export default MessageActionMenu;
