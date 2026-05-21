'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';
import { JournalEntryForm } from '@/features/accounting/journals/JournalEntryForm';

export default function NewJournalPage() {
  return (
    <AppShell>
      <AccountingPageGate permission="journal.create">
        <PageHeader
          title="New Journal Entry"
          description="Create a balanced draft manual journal entry."
          actions={
            <Link
              href="/accounting/journals"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </Link>
          }
        />
        <div className="mt-6">
          <JournalEntryForm />
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}
