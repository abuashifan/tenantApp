import type { ReactNode } from 'react';

type FormFieldProps = {
  id?: string;
  label?: string;
  required?: boolean;
  error?: string | string[];
  helperText?: string;
  children: ReactNode;
};

export function FormField({
  id,
  label,
  required = false,
  error,
  helperText,
  children,
}: FormFieldProps) {
  const errorText = Array.isArray(error) ? error.join(' ') : error;

  return (
    <label htmlFor={id} className="block">
      {label ? (
        <span className="text-xs font-medium text-slate-500">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </span>
      ) : null}
      <div className={label ? 'mt-1' : undefined}>{children}</div>
      {errorText ? (
        <p className="mt-1 text-xs font-medium text-red-600">{errorText}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </label>
  );
}

