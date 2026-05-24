# frontend-vue Transaction Form System

This repo uses **workspace primary/secondary tabs** (virtual tabs) for all transaction modules. Sales & Purchase transaction forms are implemented as **config-driven** pages to avoid duplicating 15+ unrelated “one-off” forms.

## Where the system lives

- Reusable UI components: `frontend-vue/src/components/transaction-form/`
- Composables (form logic, draft state, totals, API error mapping): `frontend-vue/src/composables/transaction-form/`
- Transaction workspace wrapper (list + secondary form tabs): `frontend-vue/src/features/transaction-form/TransactionWorkspacePage.vue`
- Form runner for a single secondary tab: `frontend-vue/src/features/transaction-form/TransactionFormPanel.vue`

## High-level architecture

1. Sidebar routes open a **primary tab** using `RouteIntent.vue`.
2. The **workspace registry** maps `primaryTabId` → the correct workspace component:
   - `frontend-vue/src/workspace/registry.ts`
3. Each transaction workspace shows:
   - a list table (mode `list`)
   - one or more secondary tabs (mode `create/edit/detail`)
4. Each secondary tab uses `useTransactionForm()` with the submenu’s `TransactionFormConfig`.

## Why config-driven

Every transaction type has a different header, lifecycle actions, and/or line requirements. Instead of:
- one giant component with many `if/else`, or
- 20 separate components with duplicated logic,

the project defines a `TransactionFormConfig` per document type and reuses:
- loading & error UX
- VeeValidate + Zod schema validation
- Laravel 422 mapping
- draft state persistence in workspace tabs
- basic totals calculation

## Draft state & dirty tabs

- Draft state is stored in `workspaceTabsStore.draftStateBySecondaryTabId`.
- `useTransactionDraftState()` syncs form values → store and sets `tab.dirty`.
- Closing a dirty tab uses the existing dialog in `AppWorkspaceShell.vue`.

## Validation + backend 422

- Client-side validation: VeeValidate + Zod (`@vee-validate/zod`)
- Backend validation: Laravel 422 is mapped to fields via `applyLaravelValidationErrors()`
  - `frontend-vue/src/composables/transaction-form/useTransactionValidation.ts`

## Totals

`useTransactionTotals()` recomputes:
- `lines[*].line_total`
- `subtotal`, `discount_amount`, `tax_amount`, `grand_total`

This is intentionally simple and can be extended later for:
- header discount type/value
- tax included logic
- deposit/payment allocations

