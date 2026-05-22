TASK:
Fix ERP virtual tabs state reset on route change.

PROBLEM:
Current implementation stores primary/secondary virtual tabs using local useState inside AppShell.
When user clicks sidebar submenu and route changes with router.push(), AppShell or route subtree may re-render/remount.
Because virtual tabs are only local shell state, opened tabs are reset and only the latest route/tab remains.

GOAL:
Virtual tabs must persist while user navigates between routes.
Opening Journal Entries, Sales Invoices, Chart of Accounts, etc. must keep all opened tabs visible even after route changes.

IMPORTANT:
This is not a backend task.
Do not change API.
Do not change permissions.
Do not change sidebar design.
Do not remove virtual tabs feature.
Only fix state persistence and route synchronization.

IMPLEMENTATION RULE:
Do not keep virtual tabs state only inside AppShell.
Move virtual tabs state into a stable client provider.

CREATE:
frontend/components/layout/VirtualTabsProvider.tsx

Provider responsibilities:

- Store primaryTabs
- Store activePrimaryTabId
- Store secondaryTabsByPrimary
- Store activeSecondaryTabByPrimary
- Store dirtyState map
- Expose actions:
  - openPrimaryTab(tab)
  - closePrimaryTab(tabId)
  - selectPrimaryTab(tabId)
  - openSecondaryTab(parentTabId, childTab)
  - closeSecondaryTab(parentTabId, childTabId)
  - selectSecondaryTab(parentTabId, childTabId)
  - closeAllTabs()
  - markDirty(tabId, dirty)
  - resetTabs()
- Persist state to sessionStorage or localStorage.

PERSISTENCE:
Use sessionStorage first.

Storage key:
erp.virtualTabs.v1

State shape example:
{
"primaryTabs": [
{
"id": "dashboard",
"label": "Dashboard",
"href": "/dashboard",
"closable": false
},
{
"id": "journal-entries",
"label": "Journal Entries",
"href": "/accounting/journal-entries",
"closable": true
}
],
"activePrimaryTabId": "journal-entries",
"secondaryTabsByPrimary": {
"journal-entries": [
{
"id": "journal-entries-list",
"label": "Daftar Jurnal",
"isList": true,
"closable": false
},
{
"id": "journal-entries-new-1",
"label": "Data Baru",
"isList": false,
"closable": true,
"dirty": true
}
]
},
"activeSecondaryTabByPrimary": {
"journal-entries": "journal-entries-list"
}
}

HYDRATION RULE:
On first client mount:

1. Try read sessionStorage key erp.virtualTabs.v1.
2. If valid state exists, use it.
3. If no valid state exists, initialize with Dashboard tab only.
4. Do not overwrite stored state just because route changed.

ROUTE SYNC RULE:
Route changes must not reset all tabs.
When pathname changes:

- Find nav item that matches current pathname.
- If pathname is /dashboard, activate dashboard.
- If pathname matches a submenu href:
  - open primary tab if not already open
  - activate that tab
  - ensure secondary list tab exists
  - do not remove other tabs
- If pathname is unknown:
  - do not destroy existing tabs
  - optionally leave active tab unchanged

CRITICAL:
Do not do this on every render:
setTabs([{ id: currentRouteOnly, ... }])

Do not derive tabs array entirely from current pathname.
Current pathname should only add/activate a tab, not replace the whole tab collection.

APP STRUCTURE:
Wrap protected app layout with provider.

If project has:
frontend/app/dashboard/page.tsx
frontend/app/accounting/...
frontend/app/sales/...

Then create or update protected layout:
frontend/app/(app)/layout.tsx

Example:
'use client';

import { VirtualTabsProvider } from '@/components/layout/VirtualTabsProvider';
import { AppShell } from '@/components/layout/AppShell';

export default function ProtectedLayout({ children }) {
return (
<VirtualTabsProvider>
<AppShell>{children}</AppShell>
</VirtualTabsProvider>
);
}

If current route structure does not use route group, create the smallest safe layout structure without breaking existing routes.

APPSHELL CHANGE:
AppShell must consume virtual tabs context.

Remove local state from AppShell:

- tabs
- activeTabId
- childTabsByParent
- activeChildByParent
- closeAllQueue
- closeAllIndex
- closeAllPrompt

Replace with:
const {
primaryTabs,
activePrimaryTabId,
secondaryTabsByPrimary,
activeSecondaryTabByPrimary,
openPrimaryTab,
closePrimaryTab,
selectPrimaryTab,
openSecondaryTab,
closeSecondaryTab,
selectSecondaryTab,
closeAllTabs,
} = useVirtualTabs();

SIDEBAR CLICK RULE:
When clicking submenu:

1. Build tab object:
   {
   id: item.key,
   label: item.label,
   href: item.href,
   closable: true
   }
2. openPrimaryTab(tab)
3. ensure secondary list tab exists
4. router.push(item.href)

Do not set tabs manually inside Sidebar.
Do not reset provider state.

PRIMARY TAB CLICK RULE:
When clicking existing primary tab:

1. selectPrimaryTab(tab.id)
2. router.push(tab.href)
3. restore last active secondary tab for that primary tab

PRIMARY TAB CLOSE RULE:
When closing tab:

1. If dirty secondary forms exist under that primary tab, show confirmation.
2. If confirmed, close primary tab and all its secondary tabs.
3. If active tab was closed, activate nearest left tab or dashboard.
4. router.push(fallback.href)

SECONDARY TAB RULE:
Dashboard has no secondary tabs.
For non-dashboard primary tabs:

- first secondary tab is list icon only
- list tab is not closable
- plus button opens Data Baru tab
- each primary tab has independent secondary tabs

CLOSE ALL RULE:
Close All must close all primary tabs except dashboard.
Process one by one:

- check dirty forms
- if dirty show confirmation:
  - Simpan
  - Jangan Simpan
  - Batal
- Batal stops process
- Jangan Simpan closes current dirty tab and continues
- Simpan calls placeholder save handler then continues
  After successful close all:
- only dashboard remains
- active tab dashboard
- router.push('/dashboard')
- persisted storage updated

STORAGE UPDATE:
Whenever tabs state changes, save to sessionStorage.
Use debounce optional but not required.

RESET ON LOGOUT:
When logout is clicked:

- remove auth_token
- remove auth_user
- remove active_company_id
- remove active_company
- remove auth_permissions
- remove erp.virtualTabs.v1
- router.push('/login')

COMPANY SWITCH RULE:
When user switches active company:

- remove erp.virtualTabs.v1
- reset tabs to dashboard
- router.push('/dashboard')
  Reason:
  Tabs from company A must not leak into company B workspace.

TYPES:
Create:
frontend/components/layout/types.ts

Types:

- PrimaryTab
- SecondaryTab
- VirtualTabsState
- VirtualTabsContextValue

Example:
export type PrimaryTab = {
id: string;
label: string;
href: string;
closable: boolean;
};

export type SecondaryTab = {
id: string;
label: string;
isList: boolean;
closable: boolean;
dirty?: boolean;
};

DO NOT:

- Do not use Zustand/Redux unless explicitly approved.
- Do not put virtual tabs state in each page.
- Do not derive all tabs from current pathname.
- Do not reset sessionStorage on normal navigation.
- Do not store non-serializable React components in storage.
- Do not store Lucide icon component in storage.
- Store only serializable data: id, label, href, flags.

ICON RULE:
Icons are derived at render time using getSubmenuIcon(itemKey, label).
Do not store icon component inside sessionStorage.

TEST / MANUAL CHECK:

1. Login.
2. Open Journal Entries.
3. Open Chart of Accounts.
4. Open Sales Invoices.
5. Switch back to Journal Entries tab.
6. Click sidebar Purchase Orders.
7. Expected:
   - Journal Entries tab still exists
   - Chart of Accounts tab still exists
   - Sales Invoices tab still exists
   - Purchase Orders tab added
8. Refresh browser.
9. Expected:
   - previously opened tabs restored from sessionStorage
10. Logout.
11. Login again.
12. Expected:

- tabs reset to Dashboard only

ACCEPTANCE:

- npm run lint passes
- npm run build passes
- route change no longer wipes virtual tabs
- refresh restores virtual tabs
- logout clears virtual tabs
- switch company clears virtual tabs
- permissions still filter sidebar
- AppShell still renders children correctly
- no backend changes

COMMIT MESSAGE:
fix(frontend): persist virtual tabs across route navigation
