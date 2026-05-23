# Phase 15 — Purchase Frontend MVP

## Status

Phase 15 implements the Purchase Frontend MVP after Phase 14 Sales Frontend MVP. It consumes the existing Phase 10 Purchase & Accounts Payable backend and does not add new backend purchase business logic.

## Scope

- Purchase navigation and permission-aware workspace.
- Purchase Request, Purchase Order, Goods Receipt, Vendor Bill, Vendor Deposit, Vendor Payment, and Purchase Return pages.
- AP Ledger, AP Aging, Open Bills, and AP Reconciliation read-only report pages.
- Tenant-aware API calls through existing auth token and `X-Company-ID`.
- Loading, error, empty, status, totals, filters, backend workflow actions, and conversion shortcuts.

## Frontend Routes

- `/purchase`
- `/purchase/requests`
- `/purchase/requests/new`
- `/purchase/requests/{id}`
- `/purchase/requests/{id}/edit`
- `/purchase/orders`
- `/purchase/orders/new`
- `/purchase/orders/from-request/{requestId}`
- `/purchase/orders/{id}`
- `/purchase/orders/{id}/edit`
- `/purchase/goods-receipts`
- `/purchase/goods-receipts/from-purchase-order/{purchaseOrderId}`
- `/purchase/vendor-bills`
- `/purchase/vendor-bills/from-purchase-order/{purchaseOrderId}`
- `/purchase/vendor-bills/from-goods-receipt/{goodsReceiptId}`
- `/purchase/vendor-deposits`
- `/purchase/vendor-payments`
- `/purchase/vendor-payments/from-bill/{billId}`
- `/purchase/returns`
- `/purchase/returns/from-bill/{billId}`
- `/purchase/returns/from-goods-receipt/{goodsReceiptId}`
- `/purchase/ap-ledger`
- `/purchase/open-bills`
- `/purchase/ap-aging`
- `/purchase/ap-reconciliation`

## Permission Mapping

- `purchase.requests.*`
- `purchase.orders.*`
- `purchase.goods_receipts.*`
- `purchase.bills.*`
- `purchase.deposits.*`
- `purchase.payments.*`
- `purchase.returns.*`
- `purchase.ap.view`
- `purchase.ap.reconcile`

## Notes

- Goods Receipt UI is document-only; stock movement UI remains Phase 17.
- Vendor Deposit and Vendor Payment screens use cash/bank accounts but do not create a general Cash Bank frontend.
- AP report pages are browser views only; export PDF/Excel is out of scope.
- Backend remains authoritative for calculations, posting, validation, audit, journal effects, AP ledger, and tenant isolation.

## Out Of Scope

- Backend purchase business logic changes.
- Sales, Cash Bank, or Inventory frontend modules.
- Stock movement UI and inventory valuation UI.
- Landed cost, FIFO/moving average UI, or warehouse stock card UI.
- Advanced AP allocation UI.
- PDF/Excel export.

## Validation Commands

```bash
cd frontend
npm run lint
npm run build
```
