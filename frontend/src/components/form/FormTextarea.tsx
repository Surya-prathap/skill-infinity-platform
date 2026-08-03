import { Controller, type FieldValues } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import type { BaseFieldProps } from './controlProps';

export interface FormTextareaProps<T extends FieldValues = FieldValues> extends BaseFieldProps<T> {
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export function FormTextarea<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  disabled,
  required,
  size,
  fullWidth = true,
  placeholder,
  rows = 4,
  maxLength,
}: FormTextareaProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label={label}
          placeholder={placeholder}
          size={size}
          fullWidth={fullWidth}
          disabled={disabled}
          required={required}
          multiline
          minRows={rows}
          slotProps={{ htmlInput: { maxLength } }}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? helperText}
        />
      )}
    />
  );
}

export default FormTextarea;
