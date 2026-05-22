'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { getSubmenuIcon } from '@/components/layout/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';
import { MASTER_DATA_RESOURCES } from '@/features/accounting/master-data/config';

const masterDataViewPermissions = MASTER_DATA_RESOURCES.map((item) => item.permissions.view);
const AccountMappingsIcon = getSubmenuIcon('account-mappings', 'Account Mappings');

export default function MasterDataLandingPage() {
  return (
    <AppShell>
      <AccountingPageGate permission={masterDataViewPermissions}>
        <PageHeader
          title="Accounting Master Data"
          description="Maintain accounting master records used by journals, reports, and future operating modules."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MASTER_DATA_RESOURCES.map((resource) => {
            const ItemIcon = getSubmenuIcon(resource.key, resource.title);

            return (
              <Link
                key={resource.key}
                href={resource.route}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--erp-ocean-soft)] text-[var(--erp-emerald-dark)]">
                    <ItemIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-950">{resource.title}</h2>
                    <p className="mt-2 text-sm text-slate-600">{resource.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}

          <Link
            href="/accounting/master-data/account-mappings"
            className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-amber-700">
                <AccountMappingsIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-amber-950">Account Mappings</h2>
                <p className="mt-2 text-sm text-amber-800">
                  Carefully map system posting accounts for sales, purchases, inventory, cash bank, and closing.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}
