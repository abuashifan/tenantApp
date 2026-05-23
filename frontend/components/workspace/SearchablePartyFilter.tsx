'use client';

import { CheckCircle2, ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type SearchablePartyFilterProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export function SearchablePartyFilter({
  label,
  value,
  options,
  onChange,
}: SearchablePartyFilterProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [options, query],
  );

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('touchstart', closeOnOutsideClick);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('touchstart', closeOnOutsideClick);
    };
  }, []);

  const selectedLabel = value === 'all' ? `All ${label}` : value;

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left text-sm outline-none transition hover:bg-slate-50 focus:border-[var(--color-cerulean-500)] focus:ring-4 focus:ring-[var(--color-cerulean-50)]"
      >
        <span className={value === 'all' ? 'text-slate-400' : 'truncate text-slate-700'}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[68px] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-cerulean-500)] focus:bg-white focus:ring-4 focus:ring-[var(--color-cerulean-50)]"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => {
                onChange('all');
                setQuery('');
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                value === 'all'
                  ? 'bg-[var(--color-lime-cream-100)] font-semibold text-[var(--color-emerald-700)]'
                  : 'text-slate-700'
              }`}
            >
              All {label}
              {value === 'all' ? <CheckCircle2 className="h-4 w-4" /> : null}
            </button>

            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setQuery('');
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                  value === option
                    ? 'bg-[var(--color-lime-cream-100)] font-semibold text-[var(--color-emerald-700)]'
                    : 'text-slate-700'
                }`}
              >
                <span className="truncate">{option}</span>
                {value === option ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : null}
              </button>
            ))}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-400">
                No {label.toLowerCase()} found.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
