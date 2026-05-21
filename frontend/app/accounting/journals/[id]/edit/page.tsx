'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';
import { getJournal } from '@/features/accounting/journals/api';
import { JournalEntryForm } from '@/features/accounting/journals/JournalEntryForm';
import { getApiErrorMessage } from '@/lib/api';
import type { JournalEntry } from '@/types/accounting';

export default function EditJournalPage() {
  const params = useParams<{ id: string }>();
  const [journal, setJournal] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        setLoading(true);
        const res = await getJournal(params.id);
        setJournal(res.data);
      } catch (event) {
        setError(getApiErrorMessage(event));
      } finally {
        setLoading(false);
      }
    });
  }, [params.id]);

  return (
    <AppShell>
      <AccountingPageGate permission="journal.edit">
        <PageHeader
          title="Edit Journal Entry"
          description={journal ? journal.journal_number : 'Load journal for editing.'}
          actions={
            <Link
              href={journal ? `/accounting/journals/${journal.id}` : '/accounting/journals'}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </Link>
          }
        />
        <div className="mt-6">
          {loading ? (
            <LoadingState title="Loading journal" />
          ) : error ? (
            <ErrorState message={error} />
          ) : journal ? (
            <JournalEntryForm journal={journal} />
          ) : null}
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}
