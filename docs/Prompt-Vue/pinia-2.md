VIRTUAL TABS STATE RULES — REQUIRED:

Virtual tabs must use Pinia.
Do not keep virtual tab state only inside AppShell local state.

The ERP workspace must behave like desktop tabs:

1. Primary tabs represent work pages/modules:
   - Dashboard
   - Journal Entries
   - Sales Invoices
   - Purchase Orders
   - Chart of Accounts
   - Products
   - etc.

2. Secondary tabs belong to each primary tab:
   - First secondary tab is always the list tab.
   - List tab uses icon only.
   - List tab is not closable.
   - Additional secondary tabs represent create/edit/detail forms.

3. Secondary tab must not have an add button.
   Create form tab must only be opened from:
   - Create New button in workspace list toolbar
   - Edit action from table row
   - Detail action from table row

4. Search box must not be in Topbar.
   Search belongs to workspace list toolbar.

5. Create New button belongs to workspace list toolbar.
   It must call:
   workspaceTabsStore.openCreateSecondaryTab(primaryTabId)

6. Edit row action must call:
   workspaceTabsStore.openEditSecondaryTab(primaryTabId, entity)

7. Void button belongs to workspace list toolbar.
   It is disabled by default.
   It becomes active only when selected transaction exists.

8. When user opens Create New:
   - A new secondary tab is created.
   - Label: Data Baru
   - If multiple create tabs:
     Data Baru, Data Baru 2, Data Baru 3
   - The new tab becomes active.
   - The form must render in workspace content.

9. When user opens Edit:
   - Use stable tab id based on entity id.
   - Example:
     /accounting/journals::edit::123
   - If edit tab for that entity already exists, do not duplicate it.
   - Activate the existing edit tab.

10. When switching primary tabs:
    - Restore last active secondary tab for that primary tab.
    - Do not reset to list tab unless no active secondary tab exists.

Example:

- User opens Journal Entries primary tab.
- User clicks Create New.
- Secondary tab "Data Baru" appears.
- User fills journal form but does not save.
- User opens Sales Invoices primary tab.
- User returns to Journal Entries.
- The active Journal secondary tab must still be "Data Baru".
- Unsaved journal input must still be there.

11. Draft form state must be stored per secondary tab.
    Use workspaceTabsStore.draftStateBySecondaryTabId.

12. Dirty state must be stored per secondary tab.
    Use workspaceTabsStore.dirtyStateBySecondaryTabId or dirty property on SecondaryTab.

13. Closing secondary tab:
    - If not dirty, close directly.
    - If dirty, show UnsavedChangesDialog.
    - Options:
      Simpan
      Jangan Simpan
      Batal
    - Batal stops close.
    - Jangan Simpan closes tab and discards draft.
    - Simpan calls placeholder save handler for now, then closes tab.

14. Closing primary tab:
    - Check all secondary tabs under it.
    - If any dirty tab exists, show confirmation.
    - Closing primary tab removes:
      - secondary tabs under that primary
      - draft state under those secondary tabs
      - dirty state under those secondary tabs

15. Close All:
    - Only Dashboard remains.
    - Process dirty tabs one by one.
    - Show UnsavedChangesDialog when needed.
    - Batal stops process.

REQUIRED PINIA STORE:
Create:

src/stores/workspaceTabsStore.ts

Types:

type PrimaryTab = {
id: string
label: string
routeName?: string
path?: string
closable: boolean
}

type SecondaryTabMode = 'list' | 'create' | 'edit' | 'detail'

type SecondaryTab = {
id: string
primaryTabId: string
label: string
mode: SecondaryTabMode
entityId?: string | number
entityNumber?: string
closable: boolean
dirty: boolean
createdAt: number
updatedAt: number
}

type WorkspaceTabsState = {
primaryTabs: PrimaryTab[]
activePrimaryTabId: string
secondaryTabsByPrimaryId: Record<string, SecondaryTab[]>
activeSecondaryTabIdByPrimaryId: Record<string, string>
draftStateBySecondaryTabId: Record<string, unknown>
listStateByPrimaryTabId: Record<string, unknown>
}

Required actions:

- openPrimaryTab(tab)
- activatePrimaryTab(primaryTabId)
- closePrimaryTab(primaryTabId)
- ensureListSecondaryTab(primaryTabId)
- openCreateSecondaryTab(primaryTabId, options?)
- openEditSecondaryTab(primaryTabId, entity)
- openDetailSecondaryTab(primaryTabId, entity)
- activateSecondaryTab(primaryTabId, secondaryTabId)
- closeSecondaryTab(primaryTabId, secondaryTabId)
- setSecondaryDirty(secondaryTabId, dirty)
- updateDraftState(secondaryTabId, value)
- patchDraftState(secondaryTabId, partial)
- clearDraftState(secondaryTabId)
- updateListState(primaryTabId, state)
- closeAllTabs()

ID RULES:
Primary tab id:

- use stable path/module id
- example: /accounting/journals

Secondary list tab id:

- `${primaryTabId}::list`

Create tab id:

- `${primaryTabId}::create::${timestamp}`

Edit tab id:

- `${primaryTabId}::edit::${entityId}`

Detail tab id:

- `${primaryTabId}::detail::${entityId}`

REQUIRED COMPOSABLE:
Create:

src/composables/useWorkspaceDraft.ts

Purpose:

- Connect form components to the active secondary tab draft state.

Must return:

- draft
- setDraft
- patchDraft
- dirty
- setDirty
- secondaryTabId
- resetDraft

Behavior:

- Reads active primary and secondary tab from workspaceTabsStore.
- Saves draft into draftStateBySecondaryTabId.
- Sets dirty state when data changes.
- Restores draft when user returns to the tab.
- If no active secondary tab exists, fail gracefully.

JOURNAL FORM INTEGRATION:
JournalEntryFormPage must use useWorkspaceDraft.

Do not keep journal form only in local ref if the form can be opened inside a secondary tab.

When Create New is clicked from Journal Entries list:

- openCreateSecondaryTab('/accounting/journals')
- active secondary tab becomes Data Baru
- JournalEntryFormPage renders
- draft state is stored under that secondary tab

When Edit is clicked from Journal Entries table:

- openEditSecondaryTab('/accounting/journals', entity)
- tab label should use journal number, e.g. JRN.2026.0001
- if tab exists, activate existing tab

ACCEPTANCE CRITERIA FOR VIRTUAL TABS:
[ ] Secondary tab add button does not exist
[ ] Create New creates a form secondary tab
[ ] Edit row creates or activates edit secondary tab
[ ] List tab is icon-only and not closable
[ ] Active secondary tab is restored when switching primary tabs
[ ] Journal form draft survives switching to another primary tab and back
[ ] Dirty state is tracked per secondary tab
[ ] Closing dirty tab triggers UnsavedChangesDialog
[ ] Close All processes dirty tabs correctly
[ ] Search/filter/table state can be restored if stored in listStateByPrimaryTabId
[ ] Virtual tabs state is in Pinia, not only local component state
