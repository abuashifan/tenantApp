'use client';

import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormField } from './FormField';
import type { FormOption } from './types';

type SearchableSelectProps = {
  label?: string;
  value: string;
  options: FormOption[];
  onSelect: (value: string, option?: FormOption) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: string | string[];
  helperText?: string;
  emptyText?: string;
};

export function SearchableSelect({
  label,
  value,
  options,
  onSelect,
  onSearch,
  onClear,
  placeholder = 'Select',
  searchPlaceholder = 'Search...',
  loading = false,
  disabled = false,
  required = false,
  error,
  helperText,
  emptyText = 'No options found',
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term || onSearch) return options;
    return options.filter((option) =>
      [option.label, option.description].filter(Boolean).join(' ').toLowerCase().includes(term),
    );
  }, [onSearch, options, query]);

  useEffect(() => {
    onSearch?.(query);
  }, [onSearch, query]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [open]);

  function choose(option: FormOption) {
    if (option.disabled) return;
    onSelect(option.value, option);
    setQuery('');
    setOpen(false);
  }

  return (
    <FormField label={label} required={required} error={error} helperText={helperText}>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-left text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500 ${
            error ? 'border-red-300' : 'border-slate-200'
          }`}
        >
          <span className={selected ? 'truncate text-slate-800' : 'truncate text-slate-400'}>
            {selected?.label ?? placeholder}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {value && onClear && !disabled ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  onClear();
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    onClear();
                  }
                }}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </span>
            ) : null}
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </span>
        </button>

        {open ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-[80] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/10">
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                autoFocus
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setOpen(false);
                  if (event.key === 'Enter' && filteredOptions[0]) choose(filteredOptions[0]);
                }}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="max-h-64 overflow-auto py-1">
              {loading ? (
                <p className="px-3 py-3 text-sm text-slate-500">Loading options...</p>
              ) : filteredOptions.length === 0 ? (
                <p className="px-3 py-3 text-sm text-slate-500">{emptyText}</p>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => choose(option)}
                    className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-slate-800">
                        {option.label}
                      </span>
                      {option.description ? (
                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    {option.value === value ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </FormField>
  );
}

