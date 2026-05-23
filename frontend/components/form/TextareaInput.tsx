import type { TextareaHTMLAttributes } from 'react';
import { FormField } from './FormField';

type TextareaInputProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | string[];
  helperText?: string;
};

export function TextareaInput({
  label,
  value,
  onChange,
  error,
  helperText,
  id,
  required,
  className = '',
  rows = 4,
  ...props
}: TextareaInputProps) {
  return (
    <FormField id={id} label={label} required={required} error={error} helperText={helperText}>
      <textarea
        id={id}
        value={value}
        required={required}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? 'border-red-300 focus:border-red-400' : ''
        } ${className}`}
        {...props}
      />
    </FormField>
  );
}

