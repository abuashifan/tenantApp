You are working in repository: abuashifan/tenantApp

TASK TITLE:
Replace the current frontend AppShell layout with an ERP-style layout using:

- left sidebar with full/minimal mode
- floating submenu panel for minimal sidebar
- primary virtual tabs
- secondary virtual tabs
- user menu dropdown
- Close All tabs workflow with unsaved form confirmation simulation

IMPORTANT CONTEXT:
This is a Next.js frontend located under `frontend/`.
Current stack:

- Next.js 16
- React 19
- TailwindCSS 4
- TypeScript
- App Router
- Existing API client is in `frontend/lib/api.ts`
- Existing permissions helper is in `frontend/lib/permissions.ts`
- Existing layout is `frontend/components/layout/AppShell.tsx`

DO NOT change backend.
DO NOT change API contracts.
DO NOT remove authentication guard behavior.
DO NOT remove permission-based menu filtering.
DO NOT add chart/dashboard implementation in this task.
DO NOT implement actual accounting forms in this task.
Focus only on layout, sidebar, user menu, and virtual tabs shell.

REFERENCE EXISTING FILES TO STUDY FIRST:

1. `frontend/components/layout/AppShell.tsx`
   - It currently handles active company from localStorage.
   - It fetches and stores permissions.
   - It filters nav items using `hasPermission`.
   - It handles logout by clearing localStorage and redirecting to `/login`.
   - This behavior must be preserved.

2. `frontend/lib/api.ts`
   - Keep using existing `getStoredToken`, `getStoredCompanyId`, and existing auth storage pattern.
   - Do not change `apiRequest`.

3. `frontend/lib/permissions.ts`
   - Reuse `ACCOUNTING_NAV_ITEMS`, `fetchAndStorePermissions`, `getStoredPermissions`, and `hasPermission`.
   - Keep permission filtering.

4. Existing module navigation files:
   - `frontend/features/sales/navigation.ts`
   - `frontend/features/purchase/navigation.ts`
   - `frontend/features/cash-bank/navigation.ts`
   - `frontend/features/inventory/navigation.ts`
     These should be reused.

DEPENDENCY RULE:
The current `package.json` does not include icon packages.
Add only one UI dependency if needed:

- `lucide-react`
  Use it for sidebar icons, user menu icons, close icons, and list icon.
  Do not add Recharts, Radix, Headless UI, Zustand, Redux, or other libraries in this task.

If adding dependency, update:
`frontend/package.json`

DESIGN COLORS:
Use these colors through CSS variables or Tailwind arbitrary values. Prefer defining CSS variables in `frontend/app/globals.css`.

Required palette:

- dark sidebar: #06131e, #091c2a
- lime accent: #b4db24, #f0f8d3, #f7fbe9
- emerald: #49b66f, #2c6d43, #edf8f1
- ocean/teal: #4bb496, #3dbdc2, #edf7f5
- blue: #24a1db, #e9f6fb
- active virtual tab: rose/pink similar #f43f5e or #e91e63

IMPLEMENTATION GOAL:
Replace current top header + nav in AppShell with an ERP-style shell.

The final layout should be:

AppShell
├── Sidebar
│ ├── full mode
│ │ ├── brand / app name
│ │ ├── active company info
│ │ ├── minimal sidebar toggle
│ │ ├── main module menus
│ │ └── inline submenu under expanded module
│ └── minimal mode
│ ├── icon-only sidebar
│ ├── no inline submenu
│ └── clicking main menu opens floating submenu panel
│
├── TopHeader
│ ├── primary virtual tabs
│ ├── Close All button
│ └── user menu dropdown
│
├── SecondaryVirtualTabs
│ ├── hidden for Dashboard
│ ├── visible for opened work page tabs
│ ├── first tab is list icon only
│ └── additional tabs represent open forms/documents
│
└── Content area
└── {children}

FILES TO CREATE:

1. `frontend/components/layout/navigation.ts`
   Purpose:
   - Define normalized module/sidebar structure.
   - Convert existing permission-filtered nav items into module groups.

2. `frontend/components/layout/Sidebar.tsx`
   Purpose:
   - Full/minimal sidebar.
   - Full mode shows inline submenu.
   - Minimal mode icon-only.
   - Minimal mode clicking module with submenu opens floating submenu.

3. `frontend/components/layout/FloatingSubmenuPanel.tsx`
   Purpose:
   - Floating card panel beside sidebar.
   - Only rendered when sidebar is minimal.
   - Must not exist/render in full mode.
   - Clicking a different main menu while panel is open must replace panel content immediately, not hide then require second click.
   - Clicking outside panel closes it.
   - Clicking sidebar itself must not be blocked by backdrop.
   - Backdrop/layering must not intercept sidebar clicks.

4. `frontend/components/layout/PrimaryVirtualTabs.tsx`
   Purpose:
   - Main virtual tabs row in same top header container as user menu.
   - Main tabs must represent work pages/submenus, not module names.
   - Example: Journal Entries, Sales Invoices, Chart of Accounts.
   - Dashboard tab is default and cannot be closed.
   - Other tabs can be closed.
   - No plus button on primary virtual tabs.

5. `frontend/components/layout/SecondaryVirtualTabs.tsx`
   Purpose:
   - Secondary tabs under primary tabs.
   - Hidden when active primary tab is Dashboard.
   - For every work page tab, first secondary tab is the list tab.
   - List tab must show icon only, no text.
   - Use an icon similar to list/menu, but not identical to Accurate screenshot. Example: ListTree or ListChecks from lucide-react.
   - Other secondary tabs represent open forms/documents, e.g.:
     - Data Baru
     - EXP.2026.12.000...
     - INV.2026.001...
   - Secondary tabs can be closed except the list tab.
   - Add a small plus button in secondary tabs only, to open new form/document tab.
   - The plus button must not exist in primary tabs.

6. `frontend/components/layout/UserMenu.tsx`
   Purpose:
   - User dropdown in top right.
   - Contains:
     - Edit Profile
     - Edit Password
     - Log Out
   - Clicking outside anywhere on document closes dropdown.
   - Must close if clicking sidebar, content area, virtual tabs, etc.
   - Do not use overlay that blocks sidebar/content clicks.
   - Use document pointerdown listener with ref containment check.
   - Logout must preserve current logout behavior from AppShell:
     remove:
     auth_token
     auth_user
     active_company_id
     active_company
     auth_permissions
     then router.push('/login').

7. `frontend/components/layout/CloseAllTabsDialog.tsx`
   Purpose:
   - Modal confirmation for unsaved forms when Close All is clicked.
   - This is a shell simulation only.
   - It must process tabs one-by-one.
   - If a tab is dirty, show confirmation:
     - Simpan
     - Jangan Simpan
     - Batal
   - "Batal" stops the Close All process.
   - "Jangan Simpan" closes current dirty form and continues to next.
   - "Simpan" should call placeholder async handler now, then close current dirty form and continue.
   - Add TODO comment: production must connect this to each form’s real save handler.

8. `frontend/components/layout/AppShell.tsx`
   Purpose:
   - Replace current AppShell structure.
   - Use the new components.
   - Preserve auth, permissions, active company loading, and logout behavior.
   - Preserve `children` render area.

OPTIONAL: 9. `frontend/components/layout/types.ts`
Put shared TypeScript types here:

- ModuleNavGroup
- ModuleNavItem
- PrimaryTab
- SecondaryTab
- DirtyStateMap
- StoredActiveCompany

FILES TO MODIFY:

1. `frontend/components/layout/AppShell.tsx`
2. `frontend/app/globals.css`
3. `frontend/package.json` only if adding `lucide-react`

DO NOT MODIFY:

- `frontend/lib/api.ts`
- backend files
- existing page route files unless required for TypeScript import cleanup
- existing module feature API clients
- existing module navigation files, unless there is a clear type export issue

NAVIGATION RULES:
Create module groups:

Dashboard:

- Always visible.
- No secondary tabs.
- No submenu.

Accounting:
Use existing `ACCOUNTING_NAV_ITEMS` from `frontend/lib/permissions.ts`.
Filter with `hasPermission`.
These are work pages.

Sales & AR:
Use `SALES_NAV_ITEMS`.
Filter with `hasPermission`.

Purchase & AP:
Use `PURCHASE_NAV_ITEMS`.
Filter with `hasPermission`.

Cash & Bank:
Use `CASH_BANK_NAV_ITEMS`.
Filter with `hasPermission`.

Inventory:
Use `INVENTORY_NAV_ITEMS`.
Filter with `hasPermission`.

Reports:
If report items currently exist under accounting nav, either:

- keep reports under Accounting for now, or
- create a derived report group from known report pages.
  Do not invent backend endpoints beyond existing route structure.
  For this task, UI shell can show Reports only if there are visible report nav items.

Settings:
Only include if permissions allow:

- Company Settings `/settings/company`
- Permissions `/auth/permissions` is API only, not a page, so do not make it a page tab unless there is already a frontend route.
  If frontend page route does not exist, do not create fake navigation to it in this task.

CRITICAL BEHAVIOR DETAILS:

A. Sidebar full mode

- Width around 280–320px.
- Main module rows visible with label + icon.
- Clicking a main module expands its inline submenu.
- Only one main module submenu can be open at one time.
- Opening another main module auto-closes the previous module.
- Clicking Dashboard selects Dashboard and closes any open submenu.
- Full mode must NOT render floating submenu at all.
- Floating submenu container must be disabled/absent in full mode.

B. Sidebar minimal mode

- Width around 72–80px.
- Only icons visible.
- No inline submenu visible.
- Clicking a main module with submenu opens floating panel.
- If floating panel is already open and user clicks another main module, panel content must immediately change to the newly clicked module.
- It must not require click once to hide and click again to show.
- Floating panel must not appear for Dashboard.
- Floating panel disappears when:
  - clicking outside floating panel
  - selecting submenu item
  - switching to full sidebar
  - clicking Dashboard
- Sidebar clicks must not be blocked by any transparent backdrop.
- Use z-index carefully:
  - sidebar above backdrop
  - floating panel above content
  - user menu above virtual tabs

C. Floating submenu panel

- Positioned beside minimal sidebar.
- Similar to Accurate-style floating card.
- White rounded container with shadow.
- Header: module label + close button.
- Submenu displayed as colored cards.
- Each card has:
  - icon
  - label
  - optional endpoint/href small text only if it doesn’t make UI crowded
- Use dynamic background colors from palette.
- No body-attached submenu grid outside floating panel.

D. Primary virtual tabs

- Located in top header area, same container row as user menu.
- Replace the old Workspace/Dashboard text area.
- No search bar.
- No sidebar toggle button in top right.
- No plus button in primary tabs.
- Default tab: Dashboard.
- Primary tabs contain submenu/work pages only, not module group names.
  Correct examples:
  - Dashboard
  - Journal Entries
  - Chart of Accounts
  - Sales Quotations
  - Sales Invoices
  - Purchase Orders
  - Cash Receipts
  - Stock Balances
    Wrong examples:
  - Accounting
  - Master Data
  - Sales & AR
- When submenu clicked:
  - add/open primary tab for that submenu
  - set active tab
  - navigate to submenu.href using router.push(item.href)
- Existing tab should be reused, not duplicated.
- Closing active tab falls back to nearest previous tab or Dashboard.
- Dashboard tab cannot be closed.

E. Secondary virtual tabs

- Located directly below primary virtual tabs.
- Hidden when active primary tab is Dashboard.
- For each primary tab, keep independent secondary tab state.
- First secondary tab is always list tab:
  - use icon only
  - no text
  - not closable
  - tooltip/title should still show full label, e.g. "Daftar Jurnal"
- When a primary tab opens for the first time, create list tab automatically.
  Label mapping examples:
  - Journal Entries -> Daftar Jurnal
  - Sales Invoices -> Daftar Invoice
  - Sales Quotations -> Daftar Quotation
  - Purchase Orders -> Daftar Order
  - Chart of Accounts -> Daftar Akun
  - Products -> Daftar Produk
  - Warehouses -> Daftar Gudang
  - Cash Receipts -> Daftar Penerimaan
  - Cash Payments -> Daftar Pembayaran
  - Stock Balances -> Daftar Saldo
  - fallback: `Daftar ${pageLabel}`
- Secondary plus button opens new unsaved form tab:
  - "Data Baru"
  - if multiple: "Data Baru 2", "Data Baru 3"
- Secondary non-list tabs closable.
- Closing dirty secondary form tab should show same unsaved confirmation logic eventually, but for this task at least implement dirty-state simulation.

F. Close All

- Button near user menu, compact, not large.
- Text: "Close All"
- Close all only closes open tabs/forms, not Dashboard.
- Process must be one-by-one.
- For each open secondary form tab / dirty tab, check dirty state.
- If dirty:
  show modal:
  - title: Unsaved Form
  - show form/tab label
  - body: Form ini belum disimpan. Simpan perubahan sebelum ditutup?
  - buttons:
    - Batal
    - Jangan Simpan
    - Simpan
- Batal stops close all process.
- Jangan Simpan closes current tab and continues.
- Simpan calls placeholder async save function, then closes current tab and continues.
- After all done, only Dashboard should remain active.
- Add comments where future real form dirty-state and save handlers will be connected.

G. User menu

- Top right.
- Compact size.
- Dropdown:
  - Edit Profile
  - Edit Password
  - Log Out
- Clicking outside anywhere closes it.
- Do not use overlay that blocks clicks.
- Use ref + document pointerdown listener.
- Dropdown must be above virtual tabs and content.

STYLE REQUIREMENTS:

- Use Tailwind classes.
- Do not use CSS modules.
- Put palette variables in globals.css if helpful.
- Use responsive widths and overflow-x for tab bars.
- Keep UI professional, clean, and similar to ERP desktop application.
- Avoid oversized buttons.
- Sidebar colors:
  - dark navy gradient
  - lime/teal active state
- Primary active tab:
  - rose/pink background similar Accurate screenshot
- Secondary tabs:
  - neutral gray/white tabs
  - list tab icon-only
- Floating submenu cards:
  - dynamic pastel container colors

TYPE SAFETY REQUIREMENTS:

- No `any` unless unavoidable.
- Define clear types:
  - NavGroup
  - NavItem
  - PrimaryTab
  - SecondaryTab
  - DirtyFormState
- Avoid TypeScript errors.
- Avoid unused imports.
- Avoid duplicate identifiers.
- No duplicate `submenuCardThemes` or similar arrays.
- All components must be client components if they use state/effects.
- Use `'use client';` where required.

IMPORTANT INTEGRATION DETAIL:
Because current AppShell receives `{children}`, do not try to render actual form content inside virtual tabs yet.
For now:

- Virtual tabs are a shell/navigation state.
- Route navigation still uses existing Next.js route pages through `router.push(href)`.
- The active page content remains `{children}`.
- Secondary tabs simulate list/form instances only at shell state level.

ROUTER BEHAVIOR:
When clicking a submenu:

1. Set active module.
2. Add/open primary tab using item.href as stable ID or item key.
3. Ensure secondary list tab exists for that primary tab.
4. Set secondary active tab to list.
5. `router.push(item.href)`.

When selecting an existing primary tab:

1. Activate that tab.
2. Restore its last active secondary tab.
3. Route to tab.href if available.

For Dashboard:

- Primary tab id should be `/dashboard` or `dashboard`, but be consistent.
- No secondary tabs.
- `router.push('/dashboard')`.

ACCEPTANCE CHECKLIST:

1. `npm run lint` passes.
2. `npm run build` passes.
3. Login flow still works.
4. After login, dashboard still renders inside AppShell.
5. Active company display still works from localStorage.
6. Permissions still filter visible modules/submenus.
7. Logout clears same localStorage keys and redirects to `/login`.
8. Full sidebar:
   - shows inline submenu
   - only one module expanded at once
   - no floating panel exists
9. Minimal sidebar:
   - icon-only
   - clicking module opens floating panel
   - clicking another module replaces floating panel content immediately
   - clicking outside closes floating panel
10. Primary virtual tabs:

- contain Dashboard and work page tabs only
- no module group tabs such as Accounting/Sales/Purchase
- no plus button

11. Secondary virtual tabs:

- hidden for Dashboard
- first tab is list icon only
- plus button opens Data Baru form tab

12. Close All:

- compact button
- closes tabs one by one
- asks confirmation for dirty simulated form tabs

13. User menu:

- Edit Profile
- Edit Password
- Log Out
- closes when clicking anywhere outside

14. No duplicate identifier errors.
15. No document/body submenu grid in normal content; submenu floating only in minimal sidebar mode.

IMPLEMENTATION ORDER:

1. Add `lucide-react` to package.json if using icons.
2. Add/adjust CSS variables in `frontend/app/globals.css`.
3. Create layout types.
4. Create normalized navigation builder.
5. Create Sidebar.
6. Create FloatingSubmenuPanel.
7. Create PrimaryVirtualTabs.
8. Create SecondaryVirtualTabs.
9. Create UserMenu.
10. Create CloseAllTabsDialog.
11. Replace `AppShell.tsx` to use these components.
12. Run lint/build.
13. Fix all TypeScript/import issues.
14. Do not touch backend.

COMMIT MESSAGE:
feat(frontend): replace app shell with ERP sidebar and virtual tabs layout
