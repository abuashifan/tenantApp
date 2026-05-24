# frontend-vue Sales/Purchase Form Endpoint Map

Generated from `php artisan route:list --path=api --json`.

> Note: URIs below are backend `api/...` routes; frontend axios calls should use paths like `/sales/invoices`.

## Sales

### `sales/ar`

- actions:
  - ledger: GET `api/sales/ar/customers/{customerId}/ledger`
  - ledger: GET `api/sales/ar/invoices/{invoiceId}/ledger`

### `sales/billings`

- list: GET `api/sales/billings`
- detail: GET `api/sales/billings/{id}`
- create: POST `api/sales/billings`
- actions:
  - cancel: PATCH `api/sales/billings/{id}/cancel`
  - issue: PATCH `api/sales/billings/{id}/issue`

### `sales/customer-deposits`

- list: GET `api/sales/customer-deposits`
- detail: GET `api/sales/customer-deposits/{id}`
- create: POST `api/sales/customer-deposits`
- actions:
  - post: PATCH `api/sales/customer-deposits/{id}/post`
  - refund: PATCH `api/sales/customer-deposits/{id}/refund`
  - void: PATCH `api/sales/customer-deposits/{id}/void`

### `sales/delivery-orders`

- list: GET `api/sales/delivery-orders`
- detail: GET `api/sales/delivery-orders/{id}`
- create: POST `api/sales/delivery-orders`
- update: PATCH `api/sales/delivery-orders/{id}`
- actions:
  - cancel: PATCH `api/sales/delivery-orders/{id}/cancel`
  - deliver: PATCH `api/sales/delivery-orders/{id}/deliver`
  - ready: PATCH `api/sales/delivery-orders/{id}/ready`
  - ship: PATCH `api/sales/delivery-orders/{id}/ship`
  - void: PATCH `api/sales/delivery-orders/{id}/void`

### `sales/invoices`

- list: GET `api/sales/invoices`
- detail: GET `api/sales/invoices/{id}`
- create: POST `api/sales/invoices`
- update: PATCH `api/sales/invoices/{id}`
- actions:
  - approve: PATCH `api/sales/invoices/{id}/approve`
  - post: PATCH `api/sales/invoices/{id}/post`
  - void: PATCH `api/sales/invoices/{id}/void`

### `sales/orders`

- list: GET `api/sales/orders`
- detail: GET `api/sales/orders/{id}`
- create: POST `api/sales/orders`
- update: PATCH `api/sales/orders/{id}`
- actions:
  - approve: PATCH `api/sales/orders/{id}/approve`
  - cancel: PATCH `api/sales/orders/{id}/cancel`
  - close: PATCH `api/sales/orders/{id}/close`
  - confirm: PATCH `api/sales/orders/{id}/confirm`

### `sales/proformas`

- list: GET `api/sales/proformas`
- detail: GET `api/sales/proformas/{id}`
- create: POST `api/sales/proformas`
- update: PATCH `api/sales/proformas/{id}`
- actions:
  - accept: PATCH `api/sales/proformas/{id}/accept`
  - cancel: PATCH `api/sales/proformas/{id}/cancel`
  - issue: PATCH `api/sales/proformas/{id}/issue`

### `sales/quotations`

- list: GET `api/sales/quotations`
- detail: GET `api/sales/quotations/{id}`
- create: POST `api/sales/quotations`
- update: PATCH `api/sales/quotations/{id}`
- actions:
  - accept: PATCH `api/sales/quotations/{id}/accept`
  - approve: PATCH `api/sales/quotations/{id}/approve`
  - cancel: PATCH `api/sales/quotations/{id}/cancel`
  - reject: PATCH `api/sales/quotations/{id}/reject`
  - send: PATCH `api/sales/quotations/{id}/send`

### `sales/receipts`

- list: GET `api/sales/receipts`
- detail: GET `api/sales/receipts/{id}`
- create: POST `api/sales/receipts`
- actions:
  - post: PATCH `api/sales/receipts/{id}/post`
  - void: PATCH `api/sales/receipts/{id}/void`

### `sales/returns`

- list: GET `api/sales/returns`
- detail: GET `api/sales/returns/{id}`
- create: POST `api/sales/returns`
- update: PATCH `api/sales/returns/{id}`
- actions:
  - approve: PATCH `api/sales/returns/{id}/approve`
  - post: PATCH `api/sales/returns/{id}/post`
  - void: PATCH `api/sales/returns/{id}/void`

## Purchase

### `purchase/ap`

- actions:
  - ledger: GET `api/purchase/ap/bills/{billId}/ledger`
  - ledger: GET `api/purchase/ap/vendors/{vendorId}/ledger`

### `purchase/bills`

- list: GET `api/purchase/bills`
- detail: GET `api/purchase/bills/{id}`
- create: POST `api/purchase/bills`
- update: PATCH `api/purchase/bills/{id}`
- actions:
  - approve: PATCH `api/purchase/bills/{id}/approve`
  - post: PATCH `api/purchase/bills/{id}/post`
  - void: PATCH `api/purchase/bills/{id}/void`

### `purchase/goods-receipts`

- list: GET `api/purchase/goods-receipts`
- detail: GET `api/purchase/goods-receipts/{id}`
- create: POST `api/purchase/goods-receipts`
- update: PATCH `api/purchase/goods-receipts/{id}`
- actions:
  - cancel: PATCH `api/purchase/goods-receipts/{id}/cancel`
  - receive: PATCH `api/purchase/goods-receipts/{id}/receive`
  - void: PATCH `api/purchase/goods-receipts/{id}/void`

### `purchase/orders`

- list: GET `api/purchase/orders`
- detail: GET `api/purchase/orders/{id}`
- create: POST `api/purchase/orders`
- update: PATCH `api/purchase/orders/{id}`
- actions:
  - approve: PATCH `api/purchase/orders/{id}/approve`
  - cancel: PATCH `api/purchase/orders/{id}/cancel`
  - close: PATCH `api/purchase/orders/{id}/close`
  - confirm: PATCH `api/purchase/orders/{id}/confirm`

### `purchase/payments`

- list: GET `api/purchase/payments`
- detail: GET `api/purchase/payments/{id}`
- create: POST `api/purchase/payments`
- actions:
  - post: PATCH `api/purchase/payments/{id}/post`
  - void: PATCH `api/purchase/payments/{id}/void`

### `purchase/requests`

- list: GET `api/purchase/requests`
- detail: GET `api/purchase/requests/{id}`
- create: POST `api/purchase/requests`
- update: PATCH `api/purchase/requests/{id}`
- actions:
  - approve: PATCH `api/purchase/requests/{id}/approve`
  - cancel: PATCH `api/purchase/requests/{id}/cancel`
  - reject: PATCH `api/purchase/requests/{id}/reject`
  - submit: PATCH `api/purchase/requests/{id}/submit`

### `purchase/returns`

- list: GET `api/purchase/returns`
- detail: GET `api/purchase/returns/{id}`
- create: POST `api/purchase/returns`
- update: PATCH `api/purchase/returns/{id}`
- actions:
  - approve: PATCH `api/purchase/returns/{id}/approve`
  - post: PATCH `api/purchase/returns/{id}/post`
  - void: PATCH `api/purchase/returns/{id}/void`

### `purchase/vendor-deposits`

- list: GET `api/purchase/vendor-deposits`
- detail: GET `api/purchase/vendor-deposits/{id}`
- create: POST `api/purchase/vendor-deposits`
- actions:
  - post: PATCH `api/purchase/vendor-deposits/{id}/post`
  - refund: PATCH `api/purchase/vendor-deposits/{id}/refund`
  - void: PATCH `api/purchase/vendor-deposits/{id}/void`

