import { useEffect, useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useDebounce } from '@/hooks';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search…',
  value: externalValue,
  onChange,
  onSearch,
  debounceMs = 300,
  fullWidth = true,
  size = 'small',
}) => {
  const [internalValue, setInternalValue] = useState(externalValue ?? '');
  const value = externalValue ?? internalValue;
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    if (onSearch) onSearch(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleChange = (next: string) => {
    setInternalValue(next);
    onChange?.(next);
  };

  return (
    <TextField
      size={size}
      fullWidth={fullWidth}
      value={value}
      onChange={(event) => handleChange(event.target.value)}
      placeholder={placeholder}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton aria-label="Clear search" size="small" onClick={() => handleChange('')}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 999 } }}
    />
  );
};

export default SearchBar;
