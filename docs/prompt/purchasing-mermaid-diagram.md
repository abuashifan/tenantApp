# Purchasing Workflow Mermaid Diagram

Dokumen ini berisi diagram Mermaid untuk alur **Purchasing Workflow & Accounts Payable** pada project TenantAppDevelopment.

Fokus diagram:

- Purchase Request
- Purchase Order
- Vendor Deposit
- Goods Receipt
- Vendor Bill
- Vendor Payment
- Purchase Return
- AP Subsidiary Ledger & Aging
- Batasan Phase 10 terhadap stock movement dan inventory valuation

---

## 1. Main Purchasing Workflow

```mermaid
flowchart TD
    A[Purchase Request] -->|convert| B[Purchase Order]
    B -->|optional DP from PO| C[Vendor Deposit]
    B -->|receive goods| D[Goods Receipt]
    D -->|bill from receipt| E[Vendor Bill]
    B -->|bill from PO| E
    E -->|apply vendor deposit| F[Vendor Deposit Allocation]
    E -->|pay bill| G[Vendor Payment]
    E -->|return goods / price correction| H[Purchase Return]

    E --> I[AP Subsidiary Ledger]
    F --> I
    G --> I
    H --> I
    I --> J[AP Aging]
    I --> K[AP vs GL Reconciliation]

    D -. Phase 10 .-> L[Document Only]
    L -. no stock update .-> M[No Stock Movement]
    L -. no valuation .-> N[No Inventory Valuation]
    M -. deferred .-> O[Phase 12 Inventory Backend]
    N -. deferred .-> O
```

---

## 2. Purchase Document Chain

```mermaid
flowchart LR
    PR[Purchase Request] --> PO[Purchase Order]
    PO --> GR[Goods Receipt]
    GR --> VB[Vendor Bill]
    VB --> VP[Vendor Payment]

    PO --> VD[Vendor Deposit]
    VD --> VDA[Vendor Deposit Allocation]
    VDA --> VB

    VB --> RET[Purchase Return]
```

---

## 3. Direct Document Creation Options

```mermaid
flowchart TD
    A[Purchase Request] --> B[Purchase Order]
    B --> C[Goods Receipt]
    C --> D[Vendor Bill]
    D --> E[Vendor Payment]

    X1[Direct Purchase Order] --> B
    X2[Direct Goods Receipt] --> C
    X3[Direct Vendor Bill] --> D
    X4[Direct Vendor Payment] --> E
```

---

## 4. Vendor Deposit Flow

```mermaid
flowchart TD
    A[Purchase Order] -->|has_down_payment = true| B[Vendor Deposit]
    B -->|post deposit| C[Journal: Dr Vendor Deposit / Cr Cash Bank]
    B -->|available deposit| D[Vendor Bill]
    D -->|apply deposit| E[Vendor Deposit Allocation]
    E --> F[Journal: Dr Accounts Payable / Cr Vendor Deposit]
    E --> G[Reduce Bill Balance Due]
    E --> H[AP Subsidiary Ledger]
```

---

## 5. Vendor Bill Posting Flow

```mermaid
flowchart TD
    A[Vendor Bill Draft] --> B[Approve Vendor Bill]
    B --> C[Post Vendor Bill]
    C --> D{Taxable?}

    D -->|No| E[Journal: Dr Purchase Expense / Cr Accounts Payable]
    D -->|Yes| F[Journal: Dr Purchase Expense + Dr Input Tax / Cr Accounts Payable]

    E --> G[Update AP Ledger]
    F --> G
    G --> H[Update Open AP]
    H --> I[AP Aging]
```

---

## 6. Vendor Payment Flow

```mermaid
flowchart TD
    A[Posted Vendor Bill] --> B[Open AP Balance]
    B --> C[Vendor Payment]
    C --> D[Post Payment]
    D --> E[Journal: Dr Accounts Payable / Cr Cash Bank]
    E --> F[Reduce Bill Balance Due]
    F --> G{Fully Paid?}
    G -->|Yes| H[Bill Status: Paid]
    G -->|No| I[Bill Status: Partially Paid]
    H --> J[AP Subsidiary Ledger]
    I --> J
```

---

## 7. Purchase Return Flow

```mermaid
flowchart TD
    A[Vendor Bill] --> B[Purchase Return]
    B --> C[Approve Return]
    C --> D[Post Return]
    D --> E[Journal: Dr Accounts Payable / Cr Purchase Return]
    E --> F[Reduce AP Balance]
    F --> G[AP Subsidiary Ledger]

    B -. Phase 10 .-> H[No Stock Movement]
    H -. deferred .-> I[Phase 12 Inventory Backend]
```

---

## 8. Phase 10 Scope Boundary

```mermaid
flowchart TD
    A[Phase 10 Purchase & AP Backend] --> B[Purchase Request]
    A --> C[Purchase Order]
    A --> D[Vendor Deposit]
    A --> E[Goods Receipt Document]
    A --> F[Vendor Bill]
    A --> G[Vendor Payment]
    A --> H[Purchase Return]
    A --> I[AP Ledger & Aging]

    A -. excludes .-> X1[Frontend Purchase]
    A -. excludes .-> X2[Stock Movement Engine]
    A -. excludes .-> X3[Inventory Valuation]
    A -. excludes .-> X4[Stock Card]
    A -. excludes .-> X5[Landed Cost]
    A -. excludes .-> X6[FIFO / Moving Average Costing]

    X1 --> Y1[Phase 15]
    X2 --> Y2[Phase 12]
    X3 --> Y2
    X4 --> Y2
    X5 --> Y2
    X6 --> Y2
```

---

## 9. AP Ledger Source Diagram

```mermaid
flowchart TD
    A[AP Subsidiary Ledger] --> B[Posted Vendor Bills]
    A --> C[Posted Vendor Payments]
    A --> D[Posted Vendor Deposit Allocations]
    A --> E[Posted Purchase Returns]

    B --> F[Debit/Credit AP Movement]
    C --> F
    D --> F
    E --> F

    F --> G[Open Vendor Balance]
    G --> H[AP Aging]
    G --> I[AP vs GL Reconciliation]
```

---

## 10. Status Summary

```mermaid
flowchart LR
    A[Purchase Request] -->|draft/submitted/approved/rejected/cancelled/converted| B[Purchase Order]
    B -->|draft/approved/confirmed/partially_received/received/partially_billed/billed/closed/cancelled| C[Goods Receipt]
    C -->|draft/received/partially_billed/billed/cancelled/void| D[Vendor Bill]
    D -->|draft/approved/posted/partially_paid/paid/overdue/void| E[Vendor Payment]
    E -->|draft/posted/void| F[AP Ledger]
```

---

## Notes

- Phase 10 adalah backend-first.
- Frontend Purchase MVP masuk Phase 15.
- Goods Receipt pada Phase 10 hanya dokumen penerimaan barang.
- Goods Receipt belum menambah stok.
- Vendor Bill belum membuat stock movement.
- Inventory valuation ditunda ke Phase 12.
- AP Subsidiary Ledger wajib reconcile dengan GL Accounts Payable.
