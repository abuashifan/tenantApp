# Codex Prompt — Implement Chart of Accounts Workspace in Vue

You are working on the Vue frontend for TenantAppDevelopment.

## Goal

Create a **Chart of Accounts workspace page** that looks and behaves like a simple operational accounting grid, similar to the provided prototype/screenshot reference:

- compact toolbar
- filters on the left
- action buttons
- search box on the right
- total record indicator
- hierarchical COA table
- create/edit drawer or side panel
- mobile card layout fallback

This must be implemented inside the existing Vue SPA/workspace/virtual tabs architecture.

## Very Important Design Rule

Do **not** blindly copy the prototype colors.

The prototype is only a layout and behavior reference.
Use the existing frontend theme/design tokens already used in the current Vue project.

Follow the current project colors, spacing, typography, button style, border radius, and table style conventions.
Do not force the prototype's exact blue/gray colors if they do not match the current project theme.

The visual target is:

```text
simple operational accounting grid
clean master-data workspace
not dashboard-heavy
not card-heavy
not overdesigned
similar layout composition to the prototype
but themed using the current Vue app design system
```

## Current Stack

The frontend is Vue and already uses:

```json
"@tanstack/vue-table": "^8.21.3"
```

Use TanStack Vue Table for the COA table behavior.
Do not build a custom table engine if TanStack Table is already available.

Expected stack:

- Vue 3
- TypeScript
- Vite
- TailwindCSS or existing styling system
- Pinia if state is needed
- Vue Router
- @tanstack/vue-table ^8.21.3

## Design-First Guardrail

Do not invent a new UI direction.
Do not redesign the entire page.
Do not create a dashboard-style COA page.
Do not add summary cards unless they already exist in the approved design system or are explicitly required.

The intended page is closer to a classic accounting master-data table:

```text
[Filter row]
[Action row + Search]
[Hierarchical table]
[Optional drawer for create/edit]
```

## Workspace Behavior Requirement

This page must open as a workspace tab, not replace the entire app shell.

When clicking the Chart of Accounts menu:

- AppShell must remain persistent.
- Existing Dashboard tab must not disappear.
- Open or activate a workspace tab named `Chart of Accounts`.
- If the COA tab already exists, activate it instead of creating duplicates.
- The table state should be preserved when switching tabs:
  - search text
  - active filters
  - expanded hierarchy rows
  - sorting
  - pagination if used

If the current project already has a workspace tab store, integrate with it.
Do not create a competing workspace system.

Suggested tab identity:

```ts
{
  id: 'chart-of-accounts',
  title: 'Chart of Accounts',
  module: 'accounting',
  componentKey: 'ChartOfAccountsWorkspace',
  closable: true,
  keepAlive: true
}
```

## Required Page Layout

Create a page/workspace component similar to:

```text
Chart of Accounts Workspace
├── Compact title/header area
├── Toolbar area
│   ├── Left: filters
│   │   ├── Account Type dropdown
│   │   ├── Inactive dropdown
│   │   └── filter button
│   ├── Action row
│   │   ├── Add button
│   │   ├── Refresh button
│   │   ├── Import/Export/Print/Settings buttons if reusable components exist
│   │   ├── Search input
│   │   └── total count box
├── Table area
│   ├── Account Code
│   ├── Account Name
│   ├── Account Type
│   └── Balance
└── Drawer/side panel for Create/Edit Account
```

## Table Requirements

Use `@tanstack/vue-table`.

Required columns:

```text
Kode Perkiraan / Account Code
Nama / Account Name
Tipe Akun / Account Type
Saldo / Balance
Actions / optional compact menu
```

The table must support:

- sorting where appropriate
- search/global filter
- account type filter
- inactive/active filter
- hierarchical indentation
- expand/collapse groups if feasible in current scope
- compact row height
- alternating row background only if consistent with current theme
- right-aligned balance column
- tabular numbers if available
- responsive behavior

## COA Hierarchy Display

The data should support account hierarchy using fields like:

```ts
type ChartOfAccountRow = {
  id: string
  code: string
  name: string
  type: string
  balance?: number
  parentId?: string | null
  level: number
  isGroup?: boolean
  isActive: boolean
  children?: ChartOfAccountRow[]
}
```

Display rules:

- Parent/group rows should be visually distinguishable, but not oversized.
- Child rows should be indented based on `level`.
- Expand/collapse icon should appear on group rows.
- Leaf rows should align cleanly with parent rows.
- Do not make the table look like a dashboard card grid.

## Data Source for Initial Implementation

If the backend API endpoint for COA already exists, use it.
Search the repo first for:

```text
chart-of-accounts
chart_of_accounts
coa
accounts
ledger accounts
```

If no API exists yet, create a local mock dataset only inside the frontend workspace/component layer with a clear TODO comment:

```ts
// TODO: Replace mockChartOfAccounts with Laravel API response when endpoint is available.
```

Do not modify backend.
Do not create backend endpoints.
Do not change database migrations.

## Create/Edit Drawer Requirements

Create or reuse an existing drawer/dialog component.

The drawer should be simple and operational, not fancy.

Fields:

```text
Account Code
Account Name
Account Type
Parent Account
Normal Balance
Status
```

Buttons:

```text
Cancel
Save
```

Optional:

```text
Deactivate
```

Guardrail note:

```text
Accounts already used in posted journals should not be deleted.
Use inactive status instead.
```

Do not implement backend save unless the existing API is already available and the pattern is clear.
If no API exists, keep the drawer as UI-ready with TODO comments.

## Mobile Layout Requirement

On mobile width:

- Do not force the full desktop table if it becomes unreadable.
- Provide a compact card-list representation or horizontally scrollable table depending on existing design system.
- Preferred mobile pattern:
  - account code and name at top
  - account type and balance below
  - indentation still visible for hierarchy
  - search remains accessible
  - add button remains easy to access

## Theme Requirement

Use current frontend theme.

Before implementing, inspect existing files such as:

```text
src/assets
src/styles
src/main.css
src/index.css
tailwind.config.*
src/components/ui
src/components/base
src/components/layout
src/components/table
src/components/form
```

Use existing reusable components first.
If a reusable button/input/select/table shell/drawer already exists, use it.
Only create new reusable components when the project does not already provide them.

## Suggested Files

Do not assume exact paths. Search the repo first.

Possible target files:

```text
src/modules/accounting/chart-of-accounts/ChartOfAccountsWorkspace.vue
src/modules/accounting/chart-of-accounts/components/ChartOfAccountsToolbar.vue
src/modules/accounting/chart-of-accounts/components/ChartOfAccountsTable.vue
src/modules/accounting/chart-of-accounts/components/ChartOfAccountsDrawer.vue
src/modules/accounting/chart-of-accounts/mockChartOfAccounts.ts
src/modules/accounting/chart-of-accounts/types.ts
```

If the project uses `src/pages` instead of `src/modules`, follow the existing structure.
Do not introduce a new architecture that conflicts with the current repo.

## TanStack Vue Table Implementation Notes

Use TanStack Vue Table idiomatically.

Expected features:

- `useVueTable`
- `getCoreRowModel`
- `getSortedRowModel`
- `getFilteredRowModel`
- optional expanded row model if hierarchy is implemented using expansion
- column definitions typed with `ColumnDef`
- reactive filter/search state

Keep the rendering simple and compatible with existing Tailwind/theme classes.

## Acceptance Criteria

Implementation is acceptable if:

```text
[ ] Chart of Accounts opens inside the existing SPA workspace/virtual tab system.
[ ] Dashboard does not disappear when COA menu is clicked.
[ ] Clicking COA menu again activates the existing COA tab, not duplicate tabs.
[ ] Layout is simple and close to the prototype composition.
[ ] Colors follow the current app theme, not forced prototype colors.
[ ] Table uses @tanstack/vue-table ^8.21.3.
[ ] Toolbar has filters, action buttons, search, and total count.
[ ] Table columns include Account Code, Account Name, Account Type, Balance.
[ ] Hierarchy indentation is visible.
[ ] Balance column is right-aligned.
[ ] Create/Edit drawer or side panel exists.
[ ] Mobile view remains usable.
[ ] No backend changes.
[ ] No new dashboard widgets.
[ ] No one-off styling if reusable components exist.
[ ] Build/typecheck/lint are run if available.
```

## Manual Test Checklist

After implementation, test:

```text
1. Start Vue dev server.
2. Open app dashboard.
3. Click Chart of Accounts menu.
4. Confirm Dashboard tab remains visible.
5. Confirm Chart of Accounts tab opens/activates.
6. Search account name/code.
7. Filter by account type.
8. Toggle active/inactive filter.
9. Expand/collapse hierarchy rows if implemented.
10. Click add account.
11. Confirm drawer opens.
12. Close drawer.
13. Switch to Dashboard tab.
14. Return to Chart of Accounts tab.
15. Confirm search/filter/table state is preserved.
16. Test mobile viewport.
17. Run build/typecheck/lint.
```

## Final Report Required

When finished, report:

```text
Root cause / integration approach
Changed files
New files
Which existing components were reused
How TanStack Table was used
How workspace tab opening works
How theme was preserved
How to test manually
Any commands run and results
Any TODOs left for backend API integration
```
