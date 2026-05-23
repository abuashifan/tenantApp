import { AlertCircle } from 'lucide-react';
import { ApiRequestError } from '@/lib/api';
import type { FieldErrorMap } from './types';

type ErrorSummaryProps = {
  message?: string | null;
  fieldErrors?: FieldErrorMap;
  onRetry?: () => void;
};

export function ErrorSummary({ message, fieldErrors, onRetry }: ErrorSummaryProps) {
  const entries = Object.entries(fieldErrors ?? {}).filter(([, value]) => value);
  if (!message && entries.length === 0) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <div className="flex gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold">{message ?? 'Please check the highlighted fields.'}</p>
          {entries.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              {entries.slice(0, 8).map(([field, value]) => (
                <li key={field}>
                  <span className="font-semibold">{field}:</span>{' '}
                  {Array.isArray(value) ? value.join(' ') : value}
                </li>
              ))}
            </ul>
          ) : null}
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
            >
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function extractFieldErrors(error: unknown): FieldErrorMap {
  if (!(error instanceof ApiRequestError) || !error.errors || typeof error.errors !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(error.errors as Record<string, unknown>).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map(String) : String(value),
    ]),
  );
}

