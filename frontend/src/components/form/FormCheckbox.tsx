import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Checkbox, FormControlLabel, FormGroup, FormHelperText } from '@mui/material';

export interface FormCheckboxProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  disabled?: boolean;
  helperText?: string;
  onChange?: (checked: boolean) => void;
}

export function FormCheckbox<T extends FieldValues>({
  name,
  control,
  label,
  disabled,
  helperText,
  onChange,
}: FormCheckboxProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(field.value)}
                onChange={(_, checked) => {
                  field.onChange(checked);
                  onChange?.(checked);
                }}
                onBlur={field.onBlur}
                disabled={disabled}
              />
            }
            label={label}
          />
          {(fieldState.error?.message ?? helperText) && (
            <FormHelperText error={Boolean(fieldState.error)} sx={{ ml: 0, mt: -0.5 }}>
              {fieldState.error?.message ?? helperText}
            </FormHelperText>
          )}
        </FormGroup>
      )}
    />
  );
}

export default FormCheckbox;
