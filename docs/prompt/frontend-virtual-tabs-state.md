# Frontend Virtual Tabs State

## Architecture

Virtual tabs are workspace state, not visual-only buttons. `VirtualTabsProvider` owns the active primary tab, each primary tab's secondary tabs, the active secondary tab per primary tab, dirty state, and draft state.

Primary tabs use stable route hrefs as IDs, for example `/accounting/journals` and `/sales/invoices`. Dashboard is the fixed non-closable primary tab and has no secondary tabs.

Secondary tabs are scoped under a primary tab:

- List tab: `${primaryTabId}::list`, mode `list`, icon-only, not closable.
- Create tab: `${primaryTabId}::create::${timestamp}`, mode `create`, closable, allows multiple instances.
- Edit tab: `${primaryTabId}::edit::${entityId}`, mode `edit`, closable, one per entity.
- Detail tab: `${primaryTabId}::detail::${entityId}`, mode `detail`, closable, one per entity.

The active secondary tab is stored in `activeSecondaryTabIdByPrimaryId`, so switching Journal Entries to Sales Invoices and back restores the last active Journal secondary tab instead of resetting to the list.

## Draft And Dirty State

Drafts are stored in `draftStateBySecondaryTabId`. Dirty flags are stored in `dirtyStateBySecondaryTabId`.

Forms can opt into draft persistence with:

```tsx
const { draft, patchDraft, setDirty, resetDraft } = useVirtualTabDraft(initialState);
```

The hook reads the current active secondary tab from virtual tabs context. If no secondary tab is active, it falls back to local component state.

Journal Entry form is wired to this hook. Its header fields and journal lines are restored when the Journal primary tab is reselected while the AppShell session is alive.

## Opening Forms From Lists

List pages should open workspace tabs before navigation:

```tsx
const tab = openCreateFormForCurrentPrimary({ href: '/accounting/journals/new' });
router.push(tab?.href ?? '/accounting/journals/new');
```

Edit actions should use stable entity IDs:

```tsx
const tab = openEditFormForCurrentPrimary({
  entityId: row.id,
  entityNumber: row.document_number,
  label: row.document_number,
  href: `/module/documents/${row.id}/edit`,
});
router.push(tab?.href ?? `/module/documents/${row.id}/edit`);
```

Journal Entries and Sales Invoices create/edit list actions are wired this way. The secondary plus button also calls `openCreateSecondaryTab(activePrimaryTabId)`.

## Close Behavior

Closing a dirty secondary tab opens the existing unsaved confirmation dialog:

- `Batal` cancels the close.
- `Jangan Simpan` discards the draft and closes the tab.
- `Simpan` currently runs a placeholder async save handler, then closes the tab.

Closing a primary tab checks every dirty secondary tab under it. Close All processes dirty tabs one by one, then resets the workspace to Dashboard.

## Session Persistence

Workspace state is persisted in `sessionStorage` under `tenantApp.virtualTabs.${companyId}`. Auth tokens are not stored there. Company switch and logout clear the active workspace and return to Dashboard/login flow.

## Known Limitations

The current shell still renders Next.js route children. Forms must use `useVirtualTabDraft` to preserve unsaved input across route unmounts. Journal Entry form is integrated; other forms can adopt the same hook incrementally. The placeholder save action in the dirty confirmation dialog still needs a real per-form save handler.

## Manual Test Checklist

1. Login works.
2. Dashboard opens.
3. Open Journal Entries from sidebar.
4. Journal primary tab opens.
5. Journal secondary list tab appears as icon only.
6. Click secondary plus button.
7. `Data Baru` secondary tab appears and becomes active.
8. Type unsaved journal data if form exists.
9. Open Sales Invoices from sidebar.
10. Sales Invoice primary tab opens with its own list secondary tab.
11. Return to Journal primary tab.
12. Journal `Data Baru` secondary tab is still active.
13. Unsaved journal draft state is still available.
14. Open edit Journal record.
15. Edit tab appears and does not duplicate if same record opened again.
16. Close dirty tab triggers confirmation.
17. Close All handles dirty tabs one by one.
18. Switch company clears virtual tabs state.
