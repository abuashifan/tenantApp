import type { InputHTMLAttributes } from 'react';
import { TextInput } from './TextInput';

type DateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | string[];
  helperText?: string;
};

export function DateInput({ value, onChange, ...props }: DateInputProps) {
  return <TextInput type="date" value={value} onChange={onChange} {...props} />;
}

