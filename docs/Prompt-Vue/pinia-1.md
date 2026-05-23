PINIA STATE MANAGEMENT RULES:

Gunakan Pinia untuk state yang bersifat lintas halaman, lintas tab, atau perlu dipertahankan selama user berpindah workspace.

JANGAN gunakan local component state untuk data yang harus bertahan saat pindah tab/page.

Buat store berikut jika belum ada:

1. useAuthStore
   Untuk:

- auth token
- auth user
- permissions
- login state
- logout state

2. useCompanyStore
   Untuk:

- active company
- active company id
- company list
- company switch state

3. useWorkspaceTabsStore
   Untuk:

- primary virtual tabs
- secondary virtual tabs per primary tab
- active primary tab
- active secondary tab per primary tab
- open create tab
- open edit tab
- close tab
- close all tabs
- dirty state per secondary tab
- draft state per secondary tab

4. useJournalFormStore
   Untuk:

- draft journal header
- draft journal lines
- balance summary
- dirty state journal form
- reset draft
- restore draft saat user kembali ke tab form

5. useUiStore
   Untuk:

- sidebar collapsed/full mode
- mobile sidebar drawer open/close
- floating submenu open/close
- modal/dialog state global jika diperlukan

STATE RULES:

1. Virtual tab state wajib berada di Pinia.
   Tidak boleh hanya local state di AppShell.

2. Form draft state wajib bisa bertahan saat user pindah:
   Journal Form -> Sales Invoice List -> kembali ke Journal Form.

3. Create New dari workspace list harus memanggil:
   workspaceTabsStore.openCreateSecondaryTab(primaryTabId)

4. Edit row dari table harus memanggil:
   workspaceTabsStore.openEditSecondaryTab(primaryTabId, entity)

5. Secondary tab tidak punya add button.
   Tab form hanya bertambah dari action Create New atau Edit.

6. Search/filter/table selection bisa local state jika hanya untuk halaman list sementara.
   Tapi jika list state harus dipertahankan saat pindah tab, simpan di Pinia:
   workspaceTabsStore.updateListState(primaryTabId, state)

7. Void button active state boleh berasal dari selected row state.
   Jika selection harus bertahan saat pindah tab, simpan di Pinia.

8. Modal/dialog state:

- Boleh local untuk dialog sederhana.
- Gunakan Pinia/useUiStore jika dialog dipanggil lintas component atau global.

9. Jangan simpan data besar permanen di Pinia.
   Pinia hanya untuk UI/workspace state, draft form, selected IDs, dan active context.
   Data besar tetap dari API/table query.

10. Jika nanti memakai persisted state:

- Persist hanya auth/company/workspace ringan.
- Jangan persist full table dataset besar.
- Jangan persist sensitive data berlebihan.

REQUIRED STORE FILES:

src/stores/authStore.ts
src/stores/companyStore.ts
src/stores/workspaceTabsStore.ts
src/stores/uiStore.ts

Optional jika Journal form sudah dibuat:
src/stores/journalFormStore.ts

workspaceTabsStore minimum state:

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

workspaceTabsStore minimum actions:

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

Journal form:

- Jangan hanya memakai ref lokal jika draft harus bertahan.
- Hubungkan JournalEntryFormPage ke workspaceTabsStore draftState.
- Gunakan composable:
  src/composables/useWorkspaceDraft.ts

useWorkspaceDraft harus:

- membaca active secondary tab
- mengambil draftState dari Pinia
- update draftState saat form berubah
- set dirty state
- restore draft saat tab dibuka kembali
