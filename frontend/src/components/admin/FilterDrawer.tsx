import type { ReactNode } from 'react';
import { Box, Button, Chip, Drawer, IconButton } from '@mui/material';
import { Typography } from '@/components/ui';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import TuneIcon from '@mui/icons-material/Tune';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  onApply?: () => void;
  /** Number of active filters shown on the trigger chip. */
  activeCount?: number;
  title?: string;
  children: ReactNode;
  /** Renders a filter trigger chip instead of controlling `open` externally. */
  onToggle?: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  onClose,
  onReset,
  onApply,
  activeCount = 0,
  title = 'Filters',
  children,
  onToggle,
}) => {
  return (
    <>
      {onToggle && (
        <Chip
          icon={<TuneIcon sx={{ fontSize: 16 }} />}
          label={activeCount > 0 ? `Filters · ${activeCount}` : 'Filters'}
          onClick={onToggle}
          color={activeCount > 0 ? 'primary' : 'default'}
          variant={activeCount > 0 ? 'filled' : 'outlined'}
          sx={{ fontWeight: 600 }}
          aria-label="Open filters"
        />
      )}
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box sx={{ width: { xs: '100%', sm: 380 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}>
            <FilterAltOutlinedIcon color="primary" />
            <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            {activeCount > 0 && (
              <Chip size="small" label={`${activeCount} active`} color="primary" variant="outlined" />
            )}
            <IconButton aria-label="Close filters" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2.5, py: 2 }}>{children}</Box>

          <Box sx={{ px: 2.5, py: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1.5 }}>
            <Button variant="outlined" startIcon={<FilterAltOffOutlinedIcon />} onClick={onReset} sx={{ flex: 1 }}>
              Reset
            </Button>
            <Button variant="contained" onClick={onApply ?? onClose} sx={{ flex: 1 }}>
              Apply filters
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

interface FilterSectionProps {
  label: string;
  children: ReactNode;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ label, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1 }}>
      {label}
    </Typography>
    {children}
  </Box>
);

interface FilterChipRowProps {
  options: { label: string; value: string; count?: number }[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}

export const FilterChipRow: React.FC<FilterChipRowProps> = ({ options, selected, onSelect }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
    {options.map((option) => {
      const isActive = selected === option.value;
      return (
        <Chip
          key={option.value}
          label={option.count !== undefined ? `${option.label} (${option.count})` : option.label}
          onClick={() => onSelect(isActive ? null : option.value)}
          color={isActive ? 'primary' : 'default'}
          variant={isActive ? 'filled' : 'outlined'}
          sx={{ fontWeight: 600 }}
        />
      );
    })}
  </Box>
);

/** Chips that toggle membership in a Set<string>. */
interface FilterMultiChipRowProps {
  options: { label: string; value: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}

export const FilterMultiChipRow: React.FC<FilterMultiChipRowProps> = ({ options, selected, onToggle }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
    {options.map((option) => {
      const isActive = selected.includes(option.value);
      return (
        <Chip
          key={option.value}
          label={option.label}
          onClick={() => onToggle(option.value)}
          color={isActive ? 'secondary' : 'default'}
          variant={isActive ? 'filled' : 'outlined'}
          sx={{ fontWeight: 600 }}
        />
      );
    })}
  </Box>
);

interface FilterRangeProps {
  label: string;
  value: [number, number];
  min: number;
  max: number;
  step?: number;
  onChange: (value: [number, number]) => void;
  format?: (value: number) => string;
}

export const FilterRange: React.FC<FilterRangeProps> = ({ label, value, min, max, step = 1, onChange, format }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {format ? `${format(value[0])} – ${format(value[1])}` : `${value[0]} – ${value[1]}`}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[0, 1].map((index) => (
          <input
            key={index}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[index]}
            aria-label={`${label} ${index === 0 ? 'minimum' : 'maximum'}`}
            onChange={(event) => {
              const next = [...value] as [number, number];
              next[index] = Number(event.target.value);
              if (next[0] > next[1]) next[index === 0 ? 1 : 0] = next[index]!;
              onChange(next);
            }}
            style={{ width: '100%', accentColor: '#6D5DF6' }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default FilterDrawer;
