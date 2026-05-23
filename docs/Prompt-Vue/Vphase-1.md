TASK TITLE:
Implement Vue Frontend Phase 1K–1O Design with Reusable Component Rules

PROJECT:
TenantAppDevelopment — Vue Frontend

STACK TARGET:

- Vue 3
- Vite
- TypeScript
- TailwindCSS
- Vue Router 4
- Pinia
- Axios
- TanStack Table for table logic
- VeeValidate + Zod for form validation
- lucide-vue-next for icons

IMPORTANT CONTEXT:
This project is currently designing and implementing the VueJS frontend, not React and not Next.js.

Critical rule:

- Do not use React.
- Do not use JSX.
- Do not use Next.js.
- Use Vue 3 Single File Components only.
- Use <script setup lang="ts"> where possible.
- Every page/pattern must be implemented as Vue components.

CURRENT DESIGN FILES / REFERENCES:
Use the uploaded/available design references as visual guidance:

- LoginPageDesign.vue
- RegisterPageDesign.vue
- SelectCompanyPageDesign.vue
- phase_1_vue_reusable_table_layout_design_vue.vue
- Phase 1K Journal Entry Form preview/design from current discussion

PHASE SCOPE TO IMPLEMENT:
Implement Phase 1K until Phase 1O only:

[ ] Phase 1K — Journal entry form
[ ] Phase 1L — Reusable table layout
[ ] Phase 1M — Reusable form layout
[ ] Phase 1N — Modal/dialog pattern
[ ] Phase 1O — Mobile layout

DO NOT:

- Do not implement backend.
- Do not change backend API.
- Do not implement real accounting posting logic.
- Do not implement Sales/Purchase/Cash Bank/Inventory modules.
- Do not create tenant/company creation UI.
- Do not hardcode design only inside one page.
- Do not duplicate the same table/form/modal code in many pages.
- Do not create custom components if an existing selected library already provides the correct primitive.

MAIN IMPLEMENTATION RULE:
Use reusable components first.

Before creating a custom component:

1. Check if the selected library already provides the needed behavior.
2. If a library component/logic exists, use it.
3. If the needed component does not exist in the library, create a custom reusable component.
4. Register custom components in a reusable/shared component structure.
5. Do not create one-off components inside page files unless they are truly page-specific.

LIBRARY USAGE RULES:

TABLE:
Use TanStack Table for table state and logic:

- column definitions
- row selection
- sorting
- pagination
- filtering
- reusable table rendering structure

Do not manually build table behavior repeatedly per page.

Allowed custom table components:

- DataTable.vue
- DataTableToolbar.vue
- DataTablePagination.vue
- DataTableEmptyState.vue
- DataTableStatusBadge.vue
- DataTableRowActions.vue

These components may wrap TanStack Table logic, but should stay reusable.

FORM:
Use VeeValidate + Zod for form validation:

- form schema validation
- field errors
- submit handling
- dirty/touched state if useful

Do not manually write duplicated validation per form page.

Allowed custom form components:

- FormShell.vue
- FormSection.vue
- FormGrid.vue
- FormField.vue
- FormInput.vue
- FormTextarea.vue
- FormSelect.vue
- FormDateInput.vue
- FormMoneyInput.vue
- FormNumberInput.vue
- FormActions.vue
- FormErrorMessage.vue

MODAL / DIALOG:
If no dialog library has been selected yet, create a reusable custom modal system first.

Allowed custom dialog components:

- BaseModal.vue
- ConfirmDialog.vue
- UnsavedChangesDialog.vue
- VoidTransactionDialog.vue
- DeleteConfirmDialog.vue

The dialog pattern must be reusable and not tied only to Journal.

ICONS:
Use lucide-vue-next.

Do not use lucide-react.

PHASE 1K — JOURNAL ENTRY FORM

Create a journal entry form page and reusable components.

Recommended route:
src/pages/accounting/journals/JournalEntryFormPage.vue

If route structure already exists, follow existing project convention.

UI requirements:

1. Page header:
   - Title: Input Jurnal Umum
   - Subtitle explaining journal form
   - Status badge: Draft
   - Actions: Cancel, Save Draft

2. Journal Header section:
   - Journal Date
   - Journal Number
   - Reference
   - Memo

3. Journal Lines section:
   - line-based table form
   - Account selector
   - Description
   - Department selector
   - Project selector
   - Debit input
   - Credit input
   - Remove line action
   - Add line button

4. Balance Summary sidebar:
   - Total Debit
   - Total Credit
   - Difference
   - Status: Balanced / Not Balanced

5. Action rules:
   - Save Draft allowed anytime
   - Submit/Post only if balanced
   - Dirty state must be trackable
   - Department and Project optional per line

Reusable requirement:
Do not build Journal form as a one-off page only.
Extract reusable line-form and transaction form components where useful.

Suggested components:
src/components/form/FormShell.vue
src/components/form/FormSection.vue
src/components/form/FormGrid.vue
src/components/form/FormInput.vue
src/components/form/FormTextarea.vue
src/components/form/FormSelect.vue
src/components/form/FormDateInput.vue
src/components/form/FormMoneyInput.vue
src/components/form/FormActions.vue

src/components/transaction/TransactionLineTable.vue
src/components/transaction/TransactionBalanceSummary.vue
src/components/transaction/TransactionStatusBadge.vue

src/features/accounting/journals/JournalEntryFormPage.vue
src/features/accounting/journals/components/JournalLineEditor.vue

Journal form data can still be mock/static in this phase.
No API integration is required unless existing API client and routes are already available and safe to use.

PHASE 1L — REUSABLE TABLE LAYOUT

Implement reusable table layout for workspace list pages.

Recommended components:
src/components/table/DataTable.vue
src/components/table/DataTableToolbar.vue
src/components/table/DataTablePagination.vue
src/components/table/DataTableEmptyState.vue
src/components/table/DataTableStatusBadge.vue
src/components/table/DataTableRowActions.vue

Use TanStack Table for:

- columns
- row selection
- pagination
- sorting
- filtering

Workspace toolbar requirements:

- Search input inside workspace list, not topbar
- Start Date
- End Date
- Filter menu button
- Create New button
- Void button
  - default disabled
  - active only when selected transaction exists

Important:

- Do not put search box in topbar/global header.
- Do not put add button in secondary virtual tab.
- Create New opens a form secondary tab later through virtual tab system.
- Void button should become active only when selectedIds.length > 0.

Table design requirements:

- row checkbox selection
- status badge
- row action menu placeholder
- pagination area
- responsive horizontal scroll
- empty state support
- loading state support

Create a demo page:
src/pages/design/ReusableTableLayoutDemo.vue
or follow existing route convention.

PHASE 1M — REUSABLE FORM LAYOUT

Implement reusable form layout system.

Required components:
src/components/form/FormShell.vue
src/components/form/FormHeader.vue
src/components/form/FormSection.vue
src/components/form/FormGrid.vue
src/components/form/FormField.vue
src/components/form/FormActions.vue
src/components/form/FormFooter.vue
src/components/form/FormDirtyIndicator.vue

Form layout must support:

- single-column mobile layout
- multi-column desktop layout
- section cards
- sticky or consistent footer actions
- dirty state indicator
- validation error display
- disabled/read-only mode
- loading/submitting state

Use VeeValidate + Zod for validation pattern.
Create a demo page:
src/pages/design/ReusableFormLayoutDemo.vue

PHASE 1N — MODAL / DIALOG PATTERN

Implement reusable modal/dialog pattern.

Required dialogs:

1. ConfirmDialog
   - title
   - message
   - confirm label
   - cancel label
   - danger variant support

2. UnsavedChangesDialog
   - Simpan
   - Jangan Simpan
   - Batal

3. VoidTransactionDialog
   - transaction number
   - reason textarea
   - confirm void
   - cancel

Rules:

- Modal overlay must not be hardcoded per feature.
- Dialog must be reusable.
- Dialog should support keyboard escape close if reasonable.
- Dialog should support clicking outside to close if safe.
- Destructive actions need danger styling.
- Void dialog should require reason before confirm.

Create:
src/components/dialog/BaseModal.vue
src/components/dialog/ConfirmDialog.vue
src/components/dialog/UnsavedChangesDialog.vue
src/components/dialog/VoidTransactionDialog.vue

Create a demo page:
src/pages/design/ModalDialogPatternDemo.vue

PHASE 1O — MOBILE LAYOUT

Implement mobile layout pattern for ERP workspace.

Mobile requirements:

- responsive AppShell pattern
- mobile topbar
- hamburger menu
- slide-over sidebar or drawer
- compact company indicator
- primary virtual tabs horizontally scrollable
- secondary virtual tabs horizontally scrollable
- workspace table becomes horizontally scrollable
- form sections stack vertically
- action buttons become full-width or bottom action bar
- avoid cramped desktop table on mobile

Important:

- Do not replace desktop design.
- Add responsive behavior using Tailwind breakpoints.
- Mobile layout should reuse existing components, not duplicate entire pages.

Suggested components:
src/components/layout/MobileTopbar.vue
src/components/layout/MobileSidebarDrawer.vue
src/components/layout/MobileBottomActionBar.vue

Create demo page:
src/pages/design/MobileLayoutDemo.vue

VIRTUAL TAB RULES TO REMEMBER:

- Add button must not exist in secondary virtual tabs.
- Secondary virtual tab increases when user opens Create New or Edit from workspace list.
- Search belongs to workspace list toolbar.
- Create New belongs to workspace list toolbar.
- Void belongs to workspace list toolbar.
- Void is disabled until transaction selection exists.
- List tab in secondary tabs should remain icon-only.
- Form tabs show labels like Data Baru, JRN.2026.0001, etc.

REUSABLE COMPONENT RULES:
Create a component only if:

- It will be reused in at least two places, or
- It standardizes system-wide UI behavior, or
- The library does not already provide the required primitive.

If the library provides the behavior:

- Use the library
- Wrap it only if the project needs consistent styling or API

Examples:

- TanStack Table handles table logic, but create DataTable.vue wrapper for consistent ERP UI.
- VeeValidate handles form validation, but create FormInput.vue/FormSelect.vue for consistent UI.
- Tailwind handles styling, but create BaseButton.vue/StatusBadge.vue for design consistency.

SUGGESTED FOLDER STRUCTURE:
src/
├── components/
│ ├── ui/
│ │ ├── BaseButton.vue
│ │ ├── StatusBadge.vue
│ │ ├── IconButton.vue
│ │ └── EmptyState.vue
│ ├── form/
│ │ ├── FormShell.vue
│ │ ├── FormHeader.vue
│ │ ├── FormSection.vue
│ │ ├── FormGrid.vue
│ │ ├── FormField.vue
│ │ ├── FormInput.vue
│ │ ├── FormTextarea.vue
│ │ ├── FormSelect.vue
│ │ ├── FormDateInput.vue
│ │ ├── FormMoneyInput.vue
│ │ └── FormActions.vue
│ ├── table/
│ │ ├── DataTable.vue
│ │ ├── DataTableToolbar.vue
│ │ ├── DataTablePagination.vue
│ │ ├── DataTableEmptyState.vue
│ │ ├── DataTableStatusBadge.vue
│ │ └── DataTableRowActions.vue
│ ├── dialog/
│ │ ├── BaseModal.vue
│ │ ├── ConfirmDialog.vue
│ │ ├── UnsavedChangesDialog.vue
│ │ └── VoidTransactionDialog.vue
│ ├── transaction/
│ │ ├── TransactionLineTable.vue
│ │ ├── TransactionBalanceSummary.vue
│ │ └── TransactionStatusBadge.vue
│ └── layout/
│ ├── MobileTopbar.vue
│ ├── MobileSidebarDrawer.vue
│ └── MobileBottomActionBar.vue
├── features/
│ └── accounting/
│ └── journals/
│ ├── JournalEntryFormPage.vue
│ └── components/
│ └── JournalLineEditor.vue
└── pages/
└── design/
├── ReusableTableLayoutDemo.vue
├── ReusableFormLayoutDemo.vue
├── ModalDialogPatternDemo.vue
└── MobileLayoutDemo.vue

DEPENDENCIES:
Check package.json first.

If missing, install:

- @tanstack/vue-table
- vee-validate
- zod
- @vee-validate/zod
- lucide-vue-next

Do not install unnecessary UI libraries unless already decided.

If a UI component library was already installed in the project, inspect it first and use its primitives where appropriate before creating custom primitives.

ACCEPTANCE CRITERIA:
Phase 1K–1O is complete when:

[ ] Journal entry form page exists and follows approved design
[ ] Journal line input supports add/remove line
[ ] Balance summary calculates debit, credit, and difference
[ ] Reusable table components exist
[ ] Table toolbar has search, start date, end date, filter, create new, void
[ ] Void button disabled by default and active when transaction selected
[ ] Reusable form layout components exist
[ ] Modal/dialog reusable pattern exists
[ ] Mobile layout demo/pattern exists
[ ] No React code exists
[ ] No JSX exists
[ ] No Next.js code is introduced
[ ] Components use Vue 3 Composition API
[ ] TanStack Table is used for table logic
[ ] VeeValidate + Zod is used for form validation pattern
[ ] Custom components are reusable and not page-only unless justified
[ ] Existing reusable/library components are used before creating new custom components
[ ] Styling follows current project colors: - #06131e - #091c2a - #b4db24 - #f7fbe9 - #49b66f - #24a1db

VALIDATION COMMANDS:
Run if available:
npm install
npm run dev
npm run build
npm run lint

If any command cannot run, explain why in final summary.

FINAL SUMMARY REQUIRED:
After implementation, report:

- Files created
- Files modified
- Dependencies added
- Reusable components created
- Library components used
- Pages/demo pages created
- Commands run
- Commands failed/not run and why
- Scope intentionally not implemented
