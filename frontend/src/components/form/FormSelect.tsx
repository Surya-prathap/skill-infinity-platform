import { Controller, type FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectProps,
} from '@mui/material';
import type { BaseFieldProps, SelectOption } from './controlProps';

export interface FormSelectProps<T extends FieldValues = FieldValues> extends BaseFieldProps<T> {
  options: SelectOption[];
  placeholder?: string;
  SelectProps?: Partial<SelectProps>;
}

export function FormSelect<T extends FieldValues>({
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
  SelectProps,
}: FormSelectProps<T>) {
  const labelId = `select-${String(name)}-label`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth={fullWidth} size={size} error={Boolean(fieldState.error)} disabled={disabled} required={required}>
          {label && (
            <InputLabel id={labelId} shrink>
              {label}
            </InputLabel>
          )}
          <Select
            labelId={labelId}
            {...field}
            label={label}
            displayEmpty={Boolean(placeholder)}
            renderValue={(selected) => {
              if (selected === '' || selected === undefined) {
                return <em style={{ opacity: 0.6 }}>{placeholder ?? 'Select…'}</em>;
              }
              return options.find((option) => option.value === selected)?.label ?? String(selected);
            }}
            {...SelectProps}
          >
            {placeholder && (
              <MenuItem value="" disabled>
                <em>{placeholder}</em>
              </MenuItem>
            )}
            {options.map((option) => (
              <MenuItem key={String(option.value)} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{fieldState.error?.message ?? helperText}</FormHelperText>
        </FormControl>
      )}
    />
  );
}

export default FormSelect;
