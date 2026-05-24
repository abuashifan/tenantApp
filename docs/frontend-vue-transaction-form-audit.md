# Transaction Form Product Dropdown Audit

## Scope

The reusable transaction line UI is shared by the product-based Sales and Purchase input forms:

- Sales Quotations, Sales Orders, Delivery Orders, Proforma Invoices, Sales Invoices, Billing Invoices, and Sales Returns.
- Purchase Requests, Purchase Orders, Goods Receipts, Vendor Bills, and Purchase Returns.

The customer/vendor selector and cash/bank account selector were also checked because they use dropdown behavior in the same form shell.

## Root Causes

1. Product mapping was coupled to inconsistent raw names. The backend product resource uses `product_code` and `product_name`, while some frontend logic still expected aliases such as `code`, `sku`, or `name`.
2. Product lists were extracted only from one response level. That fails when an API response is wrapped or later paginated.
3. Product selection previously stored only `product_id`; it did not copy product code, description, unit, or the applicable transaction price field into the line.
4. The dropdown was rendered inside the horizontally scrollable line table. CSS `overflow-x-auto` creates clipping behavior that cannot be reliably avoided by adding `overflow-y-visible`.
5. Loading/API errors were not shown inside the selectable panel, making authorization or request failures appear to be an empty product list.

## Backend Product Shape

The current Laravel product model exposes:

- `id`
- `product_code`
- `product_name`
- `unit_id`
- `is_active`
- product/account metadata fields

The current backend product model does not expose selling or purchase price columns, and its list endpoint supports `is_active` and `product_type` filters rather than a search parameter. Product search therefore filters the loaded active list in the frontend. Price inputs remain editable and default to `0` unless a future API response supplies one of the supported price aliases.

## Normalization Rules

`frontend-vue/src/utils/normalizeProduct.ts` maps product payloads to a stable shape:

- Code: `product_code`, `code`, `sku`, then `item_code`.
- Name: `product_name`, `name`, `item_name`, then `description`.
- Label: `code - name`, falling back to whichever value exists.
- Sales price: `selling_price`, `default_selling_price`, `price`, then `unit_price`.
- Purchase price: `purchase_price`, `default_purchase_price`, `cost_price`, then `unit_cost`.
- Lists: arrays are extracted safely from direct, `data`, nested `data.data`, paginated, or `items` responses.

## Dropdown Fix

`TransactionSearchableSelect` now:

- supports a standard `modelValue` / `update:modelValue` contract while remaining compatible with VeeValidate `name`.
- emits the selected option object for line field population.
- renders by default through `Teleport` into `body`.
- positions the panel with `position: fixed` based on the trigger location and recalculates during scroll and resize.
- supports outside pointer close, escape, arrow navigation, enter selection, loading/error/empty states, and search events.

The same component is now used by product, partner, and cash/bank account selection, preventing table and workspace overflow containers from clipping the menu.

The transaction service wrapper and service re-exports were also lint-cleaned as direct dependencies of these form modules; no endpoint paths or service behavior changed.

## Line Population

After selecting a product, the reusable line table sets:

- `product_id`
- `product_code`
- `description`, unless the user already entered a custom description
- `unit_id`
- `unit_name` when present
- the configured price field

Sales configurations use the normalized sales price; purchase configurations use the normalized purchase price. Purchase Requests write to `estimated_unit_price`, and Billing Invoices write to `amount`.

## Manual Test Checklist

- Open each product-line create form listed under Scope and open the product selector.
- Confirm active products display and can be filtered by code or name.
- Select a product and confirm id, code, description, and unit fields are retained in the form data.
- For sales/purchase price documents, confirm a supplied backend price populates the configured price field; otherwise confirm manual price entry remains possible.
- Scroll horizontally in the line table and vertically in the workspace while the selector is open; confirm the teleported panel remains visible and correctly positioned.
- Check loading, empty, and API error messages in the dropdown.
- Open edit/detail or source-filled lines and confirm an existing code/description remains visible if the product is absent from active options.

## Remaining Issues

- The backend product resource currently does not return sales or purchase prices, so automatic price population is ready in the frontend but has no non-zero backend value to apply.
- Source-document import workflows are outside this dropdown fix and still require their separate implementation work.
