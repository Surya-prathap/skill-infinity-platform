import { Controller, type FieldValues } from 'react-hook-form';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import type { BaseFieldProps, SelectOption } from './controlProps';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export interface MultiSelectProps<T extends FieldValues = FieldValues> extends BaseFieldProps<T> {
  options: SelectOption[];
  placeholder?: string;
}

export function MultiSelect<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  disabled,
  required,
  size,
  fullWidth = true,
  options,
  placeholder,
}: MultiSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete
          multiple
          options={options}
          value={options.filter((option) =>
            (field.value as (string | number)[] | undefined)?.includes(option.value),
          )}
          onChange={(_, selected) => field.onChange(selected.map((option) => option.value))}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          disableCloseOnSelect
          disabled={disabled}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox icon={icon} checkedIcon={checkedIcon} checked={selected} sx={{ mr: 1 }} />
              {option.label}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              slotProps={{
                input: params.slotProps.input,
                inputLabel: params.slotProps.inputLabel,
                htmlInput: params.slotProps.htmlInput,
              }}
              label={label}
              placeholder={placeholder}
              size={size}
              fullWidth={fullWidth}
              required={required}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message ?? helperText}
            />
          )}
        />
      )}
    />
  );
}

export default MultiSelect;
