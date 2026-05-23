import { TextareaInput } from './TextareaInput';

type AddressBlockProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | string[];
  helperText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  copyActionLabel?: string;
  onCopy?: () => void;
};

export function AddressBlock({
  label,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  disabled,
  readOnly,
  copyActionLabel,
  onCopy,
}: AddressBlockProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            className="text-xs font-semibold text-slate-600 hover:text-slate-950"
          >
            {copyActionLabel ?? 'Copy'}
          </button>
        ) : null}
      </div>
      <TextareaInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        disabled={disabled}
        readOnly={readOnly}
        rows={4}
      />
    </div>
  );
}

