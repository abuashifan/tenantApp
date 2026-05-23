import type { SelectHTMLAttributes } from 'react';
import { FormField } from './FormField';
import type { FormOption } from './types';

type SelectInputProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  label?: string;
  value: string;
  options: FormOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | string[];
  helperText?: string;
};

export function SelectInput({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  error,
  helperText,
  id,
  required,
  className = '',
  ...props
}: SelectInputProps) {
  return (
    <FormField id={id} label={label} required={required} error={error} helperText={helperText}>
      <select
        id={id}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? 'border-red-300 focus:border-red-400' : ''
        } ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

