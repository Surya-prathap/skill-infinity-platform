import { useState } from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { BaseFieldProps } from './controlProps';

export interface PasswordInputProps<T extends FieldValues = FieldValues> extends BaseFieldProps<T> {
  placeholder?: string;
  autoComplete?: string;
}

export function PasswordInput<T extends FieldValues>({
  name,
  control,
  label = 'Password',
  helperText,
  disabled,
  required,
  size,
  fullWidth = true,
  placeholder,
  autoComplete = 'current-password',
}: PasswordInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label={label}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          size={size}
          fullWidth={fullWidth}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? helperText}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
}

export default PasswordInput;
