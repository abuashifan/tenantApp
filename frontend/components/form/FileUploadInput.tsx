import { Upload, X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { FormField } from './FormField';

type FileUploadInputProps = {
  label?: string;
  file?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  error?: string | string[];
  helperText?: string;
  disabled?: boolean;
  loading?: boolean;
  previewUrl?: string;
};

export function FileUploadInput({
  label,
  file,
  onChange,
  accept,
  error,
  helperText,
  disabled = false,
  loading = false,
  previewUrl,
}: FileUploadInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.files?.[0] ?? null);
  }

  return (
    <FormField label={label} error={error} helperText={helperText}>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {previewUrl ? (
            <div
              className="h-16 w-16 rounded-lg border border-slate-200 bg-cover bg-center"
              style={{ backgroundImage: `url(${previewUrl})` }}
              aria-hidden="true"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
              <Upload className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <input
              type="file"
              accept={accept}
              disabled={disabled || loading}
              onChange={handleChange}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white disabled:opacity-50"
            />
            {file ? (
              <p className="mt-2 truncate text-xs text-slate-500">
                {file.name} · {formatFileSize(file.size)}
              </p>
            ) : null}
          </div>
          {file ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled || loading}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </FormField>
  );
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
