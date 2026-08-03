import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import type { SelectOption } from './controlProps';

export interface FormRadioGroupProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  options: SelectOption[];
  row?: boolean;
  disabled?: boolean;
  helperText?: string;
}

export function FormRadioGroup<T extends FieldValues>({
  name,
  control,
  label,
  options,
  row = true,
  disabled,
  helperText,
}: FormRadioGroupProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl error={Boolean(fieldState.error)} disabled={disabled}>
          {label && <FormLabel>{label}</FormLabel>}
          <RadioGroup row={row} {...field}>
            {options.map((option) => (
              <FormControlLabel
                key={String(option.value)}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {(fieldState.error?.message ?? helperText) && (
            <FormHelperText>{fieldState.error?.message ?? helperText}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
}

export default FormRadioGroup;
