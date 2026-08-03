import type { Control, FieldValues, Path } from 'react-hook-form';

export interface BaseFieldProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

export interface SelectOption {
  label: string;
  value: string | number;
}
