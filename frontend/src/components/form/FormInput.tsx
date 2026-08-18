import { Controller, type FieldValues } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import type { BaseFieldProps } from './controlProps';

export interface FormInputProps<T extends FieldValues = FieldValues> extends BaseFieldProps<T> {
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  helperText,
  disabled,
  required,
  size,
  fullWidth = true,
  type = 'text',
  placeholder,
  autoComplete,
}: FormInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label={label}
          type={type}
          placeholder={placeholder}
          size={size}
          fullWidth={fullWidth}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? helperText}
        />
      )}
    />
  );
}

export default FormInput;
