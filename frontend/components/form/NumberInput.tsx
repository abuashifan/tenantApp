import type { InputHTMLAttributes, ReactNode } from 'react';
import { TextInput } from './TextInput';

type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'prefix'
> & {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string | string[];
  helperText?: string;
  align?: 'left' | 'right';
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export function NumberInput({
  value,
  onChange,
  align = 'right',
  step = '0.01',
  ...props
}: NumberInputProps) {
  return (
    <TextInput
      type="number"
      value={String(value)}
      onChange={onChange}
      align={align}
      step={step}
      {...props}
    />
  );
}
