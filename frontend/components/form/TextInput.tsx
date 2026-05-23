import type { InputHTMLAttributes, ReactNode } from 'react';
import { FormField } from './FormField';

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'prefix'> & {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | string[];
  helperText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  align?: 'left' | 'right';
};

export function TextInput({
  label,
  value,
  onChange,
  error,
  helperText,
  prefix,
  suffix,
  align = 'left',
  id,
  required,
  className = '',
  ...props
}: TextInputProps) {
  const hasChrome = prefix || suffix;
  const inputClassName = [
    'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500',
    align === 'right' ? 'text-right' : '',
    error ? 'border-red-300 focus:border-red-400' : '',
    hasChrome ? 'border-0 px-0 py-0 focus:border-transparent' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <FormField id={id} label={label} required={required} error={error} helperText={helperText}>
      {hasChrome ? (
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition focus-within:border-slate-400 ${
            error ? 'border-red-300' : 'border-slate-200'
          } ${props.disabled ? 'bg-slate-50' : 'bg-white'}`}
        >
          {prefix ? <span className="shrink-0 text-slate-400">{prefix}</span> : null}
          <input
            id={id}
            value={value}
            required={required}
            onChange={(event) => onChange(event.target.value)}
            className={inputClassName}
            {...props}
          />
          {suffix ? <span className="shrink-0 text-slate-400">{suffix}</span> : null}
        </div>
      ) : (
        <input
          id={id}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          className={inputClassName}
          {...props}
        />
      )}
    </FormField>
  );
}
