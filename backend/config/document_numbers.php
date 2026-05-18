<?php

return [
    'default_format' => '{PREFIX}-{YEAR}-{NUMBER}',

    'default_reset_period' => 'fiscal_year',

    'default_padding' => 6,

    'default_mode' => 'auto',

    'allow_manual_number_default' => false,

    'allow_duplicate_number_default' => false,

    'document_types' => [
        'journal_entry' => [
            'prefix' => 'JV',
            'name' => 'Journal Entry',
        ],
        'sales_invoice' => [
            'prefix' => 'SI',
            'name' => 'Sales Invoice',
        ],
        'purchase_invoice' => [
            'prefix' => 'PI',
            'name' => 'Purchase Invoice',
        ],
        'cash_receipt' => [
            'prefix' => 'CR',
            'name' => 'Cash Receipt',
        ],
        'cash_payment' => [
            'prefix' => 'CP',
            'name' => 'Cash Payment',
        ],
        'bank_transfer' => [
            'prefix' => 'BT',
            'name' => 'Bank Transfer',
        ],
        'stock_adjustment' => [
            'prefix' => 'SA',
            'name' => 'Stock Adjustment',
        ],
        'stock_movement' => [
            'prefix' => 'SM',
            'name' => 'Stock Movement',
        ],
        'stock_opname' => [
            'prefix' => 'SO',
            'name' => 'Stock Opname',
        ],
        'opening_balance' => [
            'prefix' => 'OB',
            'name' => 'Opening Balance',
        ],
        'closing_entry' => [
            'prefix' => 'CL',
            'name' => 'Closing Entry',
        ],
    ],
];

