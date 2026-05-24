# Frontend Form Design System

## Components

Reusable form components live in `frontend-vue/src/components/form`.

The transaction form layer uses:

- `FormPageShell`
- `FormHeader`
- `FormSection`
- `FormGrid`
- `FormField`
- `FormTextInput` / `FormInput`
- `FormTextarea`
- `FormSelect`
- `FormDateInput`
- `FormNumberInput`
- `FormMoneyInput`
- `FormCheckbox`
- `FormSwitch`
- `FormActionBar`
- `FormStatusBadge`
- `FormValidationSummary`
- `FormLineItemsTable`
- `FormDirtyIndicator`
- `FormLoadingState`
- `FormErrorState`

## Transaction Form Pattern

All generated transaction forms follow the same structure:

1. `FormPageShell`
2. `FormHeader` with title, document number, mode, status badge and dirty indicator
3. Main information sections from endpoint-specific config
4. `FormLineItemsTable` when the backend request supports `lines`
5. Summary section for line totals and journal debit/credit balance
6. Notes section when supported by the backend request
7. Audit/status section for existing documents
8. Sticky `FormActionBar`

## Line Items

`FormLineItemsTable` receives column config from `backendResource.form.config.ts`. It supports text, number, money and select cells, and emits add/remove row events. Journal entries use debit/credit columns and block save/post while unbalanced.

## Actions And Status

Workflow buttons are declared per endpoint. Each action maps only to an existing backend route, for example `/sales/invoices/{id}/post` or `/inventory/stock-opnames/{id}/finalize`.

Buttons are hidden unless:

- the user has the configured permission,
- the current document status is allowed,
- the active tab has an entity id.

Read-only statuses: `posted`, `void`, `voided`, `cancelled`, `closed`, `finalized`.

## Virtual Tabs

Workspace lists open create/edit/detail inside secondary tabs. The active form reads the active secondary tab from `workspaceTabsStore`, stores draft values per tab id, and marks the tab dirty while the user edits.

Switching primary tabs preserves the draft because the workspace content is kept alive and draft state is stored centrally.

## Coverage Checklist

- Accounting: Journal Entry
- Sales & AR: quotations, orders, delivery orders, proformas, invoices, billings, deposits, receipts, returns
- Purchase & AP: requests, orders, goods receipts, bills, deposits, payments, returns
- Cash Bank: cash receipts, cash payments, bank transfers, bank reconciliations
- Inventory: stock movements, stock adjustments, stock opname
- Master data support: contacts, units, categories, products, warehouses, departments, projects, account mappings
