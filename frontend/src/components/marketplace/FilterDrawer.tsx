import { Box, Button, Chip, FormControlLabel, Radio, RadioGroup, Switch } from '@mui/material';
import { Typography } from '@/components/ui/Typography';
import { AppDrawer } from '@/components/ui/AppDrawer';
import {
  COUNTRY_OPTIONS,
  EXPERIENCE_OPTIONS,
  LANGUAGE_OPTIONS,
  MIN_RATING_OPTIONS,
  PRICE_RANGES,
  TIMEZONE_OPTIONS,
} from '@/features/marketplace/constants';
import type { DiscoveryFilters } from '@/types';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: DiscoveryFilters;
  onChange: (filters: DiscoveryFilters) => void;
  onReset: () => void;
}

const ChipRow: React.FC<{
  label: string;
  options: { label: string; value: string | number }[];
  selected: Array<string | number>;
  onToggle: (value: string | number) => void;
}> = ({ label, options, selected, onToggle }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.25 }}>
      {label}
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <Chip
            key={String(option.value)}
            label={option.label}
            size="small"
            onClick={() => onToggle(option.value)}
            sx={{
              fontWeight: 600,
              bgcolor: active ? 'primary.main' : 'action.hover',
              color: active ? '#fff' : 'text.secondary',
              '&:hover': { bgcolor: active ? 'primary.dark' : 'action.selected' },
            }}
          />
        );
      })}
    </Box>
  </Box>
);

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  onClose,
  filters,
  onChange,
  onReset,
}) => {
  const toggle = (key: 'categories' | 'skills' | 'languages' | 'country' | 'timezone') => (value: string | number) => {
    const current = (filters[key] as string[] | undefined) ?? [];
    const next = current.includes(String(value))
      ? current.filter((item) => item !== String(value))
      : [...current, String(value)];
    onChange({ ...filters, [key]: next });
  };

  const activeCount =
    (filters.categories?.length ?? 0) +
    (filters.skills?.length ?? 0) +
    (filters.languages?.length ?? 0) +
    (filters.minExperience !== undefined ? 1 : 0) +
    (filters.minRating !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0);

  return (
    <AppDrawer open={open} onClose={onClose} title="Filters" width={360}>
      <Box sx={{ p: 2.5 }}>
        <ChipRow
          label="Languages"
          options={LANGUAGE_OPTIONS}
          selected={filters.languages ?? []}
          onToggle={toggle('languages')}
        />

        <ChipRow
          label="Country"
          options={COUNTRY_OPTIONS}
          selected={filters.country ? [filters.country] : []}
          onToggle={(value) => {
            onChange({
              ...filters,
              country: filters.country === String(value) ? undefined : String(value),
            });
          }}
        />

        <ChipRow
          label="Timezone"
          options={TIMEZONE_OPTIONS}
          selected={filters.timezone ? [filters.timezone] : []}
          onToggle={(value) => {
            onChange({
              ...filters,
              timezone: filters.timezone === String(value) ? undefined : String(value),
            });
          }}
        />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.25 }}>
            Minimum experience
          </Typography>
          <RadioGroup
            value={filters.minExperience ?? ''}
            onChange={(_, value) =>
              onChange({ ...filters, minExperience: value ? Number(value) : undefined })
            }
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {[{ label: 'Any', value: '' }, ...EXPERIENCE_OPTIONS].map((option) => (
                <FormControlLabel
                  key={String(option.value)}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={option.label}
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.82rem', fontWeight: 600 } }}
                />
              ))}
            </Box>
          </RadioGroup>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.25 }}>
            Minimum rating
          </Typography>
          <RadioGroup
            value={filters.minRating ?? ''}
            onChange={(_, value) =>
              onChange({ ...filters, minRating: value ? Number(value) : undefined })
            }
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {[{ label: 'Any', value: '' }, ...MIN_RATING_OPTIONS].map((option) => (
                <FormControlLabel
                  key={String(option.value)}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={option.label}
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.82rem', fontWeight: 600 } }}
                />
              ))}
            </Box>
          </RadioGroup>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.25 }}>
            Max price: {filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}
          </Typography>
          <RadioGroup
            value={filters.maxPrice ?? ''}
            onChange={(_, value) =>
              onChange({ ...filters, maxPrice: value ? Number(value) : undefined })
            }
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {[{ label: 'Any', value: '' }, ...PRICE_RANGES].map((option) => (
                <FormControlLabel
                  key={String(option.value)}
                  value={option.value}
                  control={<Radio size="small" />}
                  label={option.label}
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.82rem', fontWeight: 600 } }}
                />
              ))}
            </Box>
          </RadioGroup>
        </Box>

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={Boolean(filters.verifiedOnly)}
              onChange={(_, checked) => onChange({ ...filters, verifiedOnly: checked })}
            />
          }
          label={<Typography variant="body2" fontWeight={600}>Verified mentors only</Typography>}
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
          <Button fullWidth variant="outlined" onClick={onReset}>
            Reset ({activeCount})
          </Button>
          <Button fullWidth variant="contained" onClick={onClose}>
            Show results
          </Button>
        </Box>
      </Box>
    </AppDrawer>
  );
};

export default FilterDrawer;
