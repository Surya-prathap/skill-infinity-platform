import { motion } from 'framer-motion';
import { Box, Chip } from '@mui/material';
import TagIcon from '@mui/icons-material/Tag';

interface TagChipProps {
  label: string;
  count?: number;
  onClick?: () => void;
  active?: boolean;
}

/** Premium hashtag chip with hover lift and active state. */
export const TagChip: React.FC<TagChipProps> = ({ label, count, onClick, active = false }) => {
  const content = (
    <Chip
      icon={<TagIcon sx={{ fontSize: 15 }} />}
      label={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          {label}
          {count !== undefined && (
            <Box
              component="span"
              sx={{
                fontSize: '0.68rem',
                fontWeight: 800,
                px: 0.75,
                py: 0.1,
                borderRadius: 999,
                bgcolor: active ? 'rgba(255,255,255,0.22)' : 'action.hover',
              }}
            >
              {count.toLocaleString('en-US')}
            </Box>
          )}
        </Box>
      }
      onClick={onClick}
      clickable={Boolean(onClick)}
      color={active ? 'primary' : 'default'}
      variant={active ? 'filled' : 'outlined'}
      sx={{
        height: 30,
        fontWeight: 700,
        fontSize: '0.8rem',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: active ? 4 : 2,
        },
        ...(active && {
          background: 'linear-gradient(135deg, #6D5DF6, #8E80FF)',
          borderColor: 'transparent',
          color: '#fff',
        }),
      }}
    />
  );

  if (!onClick) return content;
  return <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>{content}</motion.div>;
};

export default TagChip;
