import { Controller, type FieldValues } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import EventIcon from '@mui/icons-material/Event';
import type { BaseFieldProps } from './controlProps';

export interface DatePickerFieldProps<T extends FieldValues = FieldValues> extends BaseFieldProps<T> {
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

/**
 * Lightweight date picker. Renders a native date input styled to match the
 * design system — avoids an extra date-picker dependency for the foundation.
 */
export function DatePickerField<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  disabled,
  required,
  size,
  fullWidth = true,
  placeholder,
  minDate,
  maxDate,
}: DatePickerFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label={label}
          type="date"
          placeholder={placeholder}
          size={size}
          fullWidth={fullWidth}
          disabled={disabled}
          required={required}
          value={field.value ?? ''}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: minDate, max: maxDate },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <EventIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? helperText}
        />
      )}
    />
  );
}

export default DatePickerField;
