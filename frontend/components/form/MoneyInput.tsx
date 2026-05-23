import type { InputHTMLAttributes } from 'react';
import { NumberInput } from './NumberInput';

type MoneyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'prefix'
> & {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  currencyCode?: string;
  error?: string | string[];
  helperText?: string;
};

export function MoneyInput({
  value,
  onChange,
  currencyCode = 'IDR',
  step = '0.01',
  ...props
}: MoneyInputProps) {
  return (
    <NumberInput
      value={value}
      onChange={onChange}
      step={step}
      prefix={<span className="text-xs font-semibold text-slate-500">{currencyCode}</span>}
      {...props}
    />
  );
}
