# Source Conversion Workflow: Sales and Purchase

## Purpose

This workflow lets users create downstream Sales and Purchase documents from upstream source documents without re-entering header and line data. The backend remains authoritative for source references, remaining quantity checks, pricing resolution, posting effects, period locks, permissions, audit logging, and void restoration. The Vue UI only exposes allowed conversion actions, calls the existing API client, and opens the created target document in the existing workspace tabs.

## Sales Conversion Matrix

| Source | Target | Endpoint | Notes |
|---|---|---|---|
| Sales Quotation | Sales Order | `POST /api/sales/orders/from-quotation/{quotationId}` | Existing backend conversion. |
| Sales Order | Delivery Order | `POST /api/sales/delivery-orders/from-sales-order/{salesOrderId}` | Uses remaining undelivered quantity. |
| Sales Order | Proforma Invoice | `POST /api/sales/proformas/from-sales-order/{salesOrderId}` | Existing backend conversion. |
| Sales Order | Sales Invoice | `POST /api/sales/invoices/from-sales-order/{salesOrderId}` | Uses remaining uninvoiced quantity. |
| Delivery Order | Sales Invoice | `POST /api/sales/invoices/from-delivery-order/{deliveryOrderId}` | Requires delivered source; uses remaining uninvoiced delivered quantity. |
| Proforma Invoice | Sales Invoice | `POST /api/sales/invoices/from-proforma/{proformaId}` | Existing backend endpoint; blocks converted/cancelled proformas. |
| Sales Invoice | Sales Return | `POST /api/sales/returns/from-invoice/{invoiceId}` | Existing backend conversion. |
| Delivery Order | Sales Return | `POST /api/sales/returns/from-delivery-order/{deliveryOrderId}` | Existing backend conversion. |

## Purchase Conversion Matrix

| Source | Target | Endpoint | Notes |
|---|---|---|---|
| Purchase Request | Purchase Order | `POST /api/purchase/orders/from-request/{purchaseRequestId}` | Requires vendor selection. |
| Purchase Order | Goods Receipt | `POST /api/purchase/goods-receipts/from-purchase-order/{purchaseOrderId}` | Uses remaining unreceived quantity. |
| Purchase Order | Vendor Bill | `POST /api/purchase/bills/from-purchase-order/{purchaseOrderId}` | Uses remaining unbilled quantity. |
| Goods Receipt | Vendor Bill | `POST /api/purchase/bills/from-goods-receipt/{goodsReceiptId}` | Requires received source; resolves pricing from purchase order line. |
| Vendor Bill | Purchase Return | `POST /api/purchase/returns/from-bill/{billId}` | Existing backend conversion. |
| Goods Receipt | Purchase Return | `POST /api/purchase/returns/from-goods-receipt/{goodsReceiptId}` | Existing backend conversion. |

## Source Reference Rules

Target document headers preserve:

- `source_type`
- `source_id`
- `source_number`
- `source_revision`

Target lines preserve:

- `source_line_type`
- `source_line_id`
- native foreign keys where available, such as `sales_order_line_id`, `delivery_order_line_id`, `purchase_order_line_id`, and `goods_receipt_line_id`

Manual document creation remains valid because all source fields are nullable.

## Sales Invoice From Sales Order

The backend copies customer, address, salesperson, currency, exchange rate, tax flags, header discount, and line commercial data from the sales order. Invoice lines use remaining uninvoiced sales order quantity and preserve product, product code, description, unit, unit price, discount, tax, warehouse, department, and project.

Over-invoicing is blocked by backend validation. Source sales order quantities and status are updated when the invoice is posted, and void restores those source quantities/statuses.

## Sales Invoice From Delivery Order

The backend copies delivery lines into invoice lines using delivered quantity that has not yet been invoiced. Delivery order lines do not carry all commercial pricing fields, so invoice pricing, discount, and tax are resolved from the linked sales order line. If that source chain is missing, the backend returns a clear validation error instead of silently using zero price.

Delivery order line references are stored on each invoice line, so a delivery item can become an invoice line and remain traceable.

## Price Resolution From Source Chain

- Delivery Order to Sales Invoice resolves `unit_price`, discount, and tax from `sales_order_lines`.
- Goods Receipt to Vendor Bill resolves `unit_price`, discount, and tax from `purchase_order_lines`.
- If source pricing cannot be resolved, the backend rejects the conversion with a source-pricing error.

## Partial And Remaining Quantity Rules

Conversions support partial line quantities when the endpoint receives line overrides. Backend rules enforce:

- target quantity must be greater than zero,
- target quantity must not exceed remaining source quantity,
- fully converted lines are omitted,
- fully converted source documents cannot be converted again,
- cancelled, void, or closed sources are not convertible.

Source progress quantities are updated by backend posting actions and restored by backend void actions. Draft converted documents preserve source references but do not consume source quantities until posted.

## Permission And Status Rules

All conversion endpoints remain behind `auth:sanctum`, `company.access`, and granular permissions. Vue conversion buttons are configured per document type and only render when the user has the required permission and the current source status is eligible. Backend validation remains the final guard for permissions, status, period locks, and remaining quantities.

## Error Handling

The frontend displays normalized backend messages for permission errors, locked periods, already converted sources, cancelled/void sources, zero remaining quantity, missing source pricing, missing account mappings, validation errors, conflicts, and network failures. It uses the existing API client, so `Authorization: Bearer ...` and `X-Company-ID` behavior is preserved.

## Void/Reversal Integrity

This workflow follows `docs/transaction-void-and-reversal-integrity.md`: posted effects are reversed through backend void operations, source quantities are restored atomically, generated journals and stock movements are not hard deleted, and audit metadata is retained.

## Manual QA Checklist

- Create Sales Invoice manually and save it.
- Convert Sales Order to Sales Invoice and confirm header, line data, source header, and source line references.
- Convert Delivery Order to Sales Invoice after delivery and confirm line price comes from Sales Order.
- Partially invoice a Sales Order, post it, and confirm remaining quantity is used on the next invoice.
- Try to invoice more than remaining quantity and confirm backend rejection.
- Convert Proforma Invoice to Sales Invoice and confirm duplicate conversion is blocked after posting.
- Convert Purchase Request to Purchase Order with a vendor.
- Convert Purchase Order to Goods Receipt and confirm remaining unreceived quantity.
- Convert Purchase Order to Vendor Bill and confirm remaining unbilled quantity.
- Convert Goods Receipt to Vendor Bill after receipt and confirm price comes from Purchase Order.
- Confirm conversion buttons respect permissions and source status.
- Confirm converted documents open in existing workspace secondary tabs.
- Confirm login, company selection, master data, products/product history location, product categories, journal, reports, virtual tabs, secondary tabs, and bulk selection still behave as before.
