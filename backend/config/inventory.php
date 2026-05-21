<?php

return [
    'valuation_method' => 'moving_average',
    'allow_negative_stock' => false,

    // Recognition policy (MVP)
    // - goods_receipt: inventory recognized when goods receipt posted
    // - vendor_bill: inventory recognized when vendor bill posted (direct receipt)
    'recognize_inventory_on' => 'goods_receipt',

    // Sales stock issue policy (MVP)
    'allow_sales_invoice_direct_stock_issue' => false,

    // Purchase direct receipt policy (MVP)
    'allow_vendor_bill_direct_stock_receipt' => true,

    'stock_precision' => 4,
    'cost_precision' => 6,
    'amount_precision' => 2,

    // Stock adjustment incoming cost policy (MVP)
    // - require_unit_cost: reject adjustment_in lines missing unit_cost
    // - fallback_average_cost: if unit_cost missing, use current average_cost
    'adjustment_in_unit_cost_policy' => 'fallback_average_cost',

    // Stock opname policy (MVP)
    'opname_allow_partial_count' => false,

    'default_movement_statuses' => [
        'draft',
        'posted',
        'void',
    ],

    'movement_types' => [
        'purchase_in',
        'purchase_return_out',
        'sales_out',
        'sales_return_in',
        'adjustment_in',
        'adjustment_out',
        'opname_in',
        'opname_out',
        'transfer_in',
        'transfer_out',
        'opening_stock',
    ],
];
