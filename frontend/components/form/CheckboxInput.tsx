import type { ReactNode } from 'react';

type CheckboxInputProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: ReactNode;
  disabled?: boolean;
};

export function CheckboxInput({
  label,
  checked,
  onChange,
  description,
  disabled = false,
}: CheckboxInputProps) {
  return (
    <label className="flex items-start gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 disabled:opacity-50"
      />
      <span>
        <span className="font-medium text-slate-700">{label}</span>
        {description ? <span className="mt-1 block text-xs text-slate-500">{description}</span> : null}
      </span>
    </label>
  );
}

