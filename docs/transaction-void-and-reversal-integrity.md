# Transaction Void and Reversal Integrity

## Principles

- Void is a backend business operation. The Vue frontend only requests an action and displays its result.
- A void reason is required for single and bulk void requests.
- Each document void runs inside a tenant database transaction and is checked against the document date/locked-period rule.
- Posted accounting lines are not edited or deleted. Under the current accounting policy, system-generated journal entries are retained and marked `void` so reporting excludes their effect while preserving the audit trail.
- Posted inventory effects are not deleted. The existing stock movement engine creates an inverse posted movement and its accounting journal.
- No transaction, journal, movement, allocation, or ledger record is hard deleted.

## Module Behavior

| Module / Document | Void handling | Related effect handling |
|---|---|---|
| Journal Entry | Existing manual journal void service | Requires reason and policy/date validation; system-generated journals must be voided from their source transaction. |
| Sales Quotation / Sales Order / Proforma / Billing Invoice | No void endpoint; existing lifecycle cancellation only | No bulk void action exposed. |
| Delivery Order | Voided atomically | Reverses generated stock movement when present; restores delivered quantities; blocks void when a non-void invoice depends on it. |
| Sales Invoice | Voided atomically | Voids generated journals, reverses configured direct stock movement, reverses deposit allocations, restores source invoiced quantities; blocks posted receipt/return dependencies. |
| Customer Deposit | Voided atomically | Voids post/refund/allocation journals and reverses posted allocations on affected invoices. |
| Sales Receipt | Voided atomically | Voids generated journal and restores invoice paid amount, balance, and status. |
| Sales Return | Voided atomically | Voids generated journal, reverses generated stock movement, and restores returned invoice quantities/amounts. |
| Purchase Request / Purchase Order | No void endpoint; existing lifecycle cancellation only | No bulk void action exposed. |
| Goods Receipt | Voided atomically | Reverses generated stock movement and restores purchase order received quantities/status. |
| Vendor Bill | Voided atomically | Voids generated journals, reverses configured direct stock movement, reverses deposit allocations, and restores source billed quantities; blocks posted payment/return dependencies. |
| Vendor Deposit | Voided atomically | Voids post/refund/allocation journals and reverses posted allocations on affected bills. |
| Vendor Payment | Voided atomically | Voids generated journal and restores bill paid amount, balance, and status. |
| Purchase Return | Voided atomically | Voids generated journal, reverses generated stock movement, and restores returned bill/receipt quantities. |
| Cash Receipt / Cash Payment / Bank Transfer | Voided atomically | Voids each generated journal effect. |
| Bank Reconciliation | No void endpoint in the current backend | Not exposed as a void action. |
| Stock Movement | Existing reversal operation strengthened | Requires reason/date validation; posted movement creates inverse movement rather than deleting stock history. |
| Stock Adjustment / Stock Opname | Existing cascading reversal strengthened | Requires reason/date validation and reverses generated stock movements through inventory services. |

## Bulk Void

There is no new bulk API contract. The Vue workspace performs bulk void by sending each selected item to its existing single-document void endpoint with one confirmed reason. Every backend item remains atomic and independent.

The UI:

- requires confirmation and a reason;
- reports successful and failed item counts with per-item failure messages;
- refreshes list data after processing;
- clears selected rows only when all selected operations succeed;
- retains the existing virtual-tab workspace state.

Only resources with a real backend void endpoint display Bulk Void. Cancel-only documents and bank reconciliation do not call a fabricated void action.

## Source Restoration

- Voiding a delivered delivery order restores sales order delivered quantities.
- Voiding a sales invoice restores sales order and delivery order invoiced quantities and reopens a converted proforma where applicable.
- Voiding a goods receipt restores purchase order received quantities/status.
- Voiding a vendor bill restores purchase order and goods receipt billed quantities.
- Voiding receipt/payment/deposit allocation effects restores invoice or bill paid balances and status.
- Voiding sales or purchase returns restores returned quantities and monetary balances on the originating invoice or bill.

## Period, Dependency, and Audit Rules

- A locked fiscal period blocks void before mutation.
- A second void is rejected or treated as the established safe no-op for the underlying stock reversal operation; it cannot create a second journal or stock reversal.
- Dependencies which cannot be automatically restored safely are blocked, including posted sales receipts/returns on an invoice and posted vendor payments/returns on a bill.
- Automatically reversible generated effects are handled inside the source operation: generated journals, stock movements, and posted deposit allocations.
- Source void operations and generated journal/stock reversals write audit metadata including the reason and affected generated IDs where available.

The generic `TransactionDependencyService` checkers remain a foundation with limited rule coverage. Current source services enforce the material dependency rules used by these workflows; broader centralized dependency coverage is follow-up work as additional conversions and reconciliations are implemented.

## Manual QA Checklist

- Post a sales invoice, void it with a reason, and confirm its journal is retained with status `void`.
- Allocate a customer deposit to an invoice, void the invoice or deposit, and confirm allocation and AR balance restoration.
- Deliver stock from a delivery order, void it, and confirm inverse stock movement plus restored sales order quantity.
- Receive purchase stock, void the goods receipt, and confirm inverse stock movement plus restored purchase order quantity.
- Post and void a vendor bill/payment/deposit workflow and confirm AP balances and journals reverse.
- Void cash receipt, cash payment, and bank transfer documents and confirm generated journals become `void`.
- Attempt void in a locked period and confirm the backend rejects it.
- Attempt a second void and confirm no duplicate journal or stock reversal is produced.
- Select multiple supported rows in a Vue workspace, supply a reason, and confirm success/failure summary, refreshed list, and selection behavior.
- Confirm documents without a backend void endpoint do not expose a Bulk Void operation.
