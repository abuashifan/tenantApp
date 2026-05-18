<?php

return [
    'modules' => [
        'sales',
        'purchase',
        'inventory',
        'cash_bank',
        'journal',
        'opening_balance',
        'closing',
        'tax',
    ],

    'required_mappings' => [
        'sales.accounts_receivable' => [
            'module' => 'sales',
            'label' => 'Accounts Receivable',
            'required' => true,
            'account_types' => ['asset'],
            'description' => 'Default receivable account for sales invoices.',
        ],
        'sales.revenue' => [
            'module' => 'sales',
            'label' => 'Sales Revenue',
            'required' => true,
            'account_types' => ['revenue'],
            'description' => 'Default revenue account for sales invoices.',
        ],
        'sales.discount' => [
            'module' => 'sales',
            'label' => 'Sales Discount',
            'required' => false,
            'account_types' => ['expense', 'revenue'],
            'description' => 'Default sales discount account.',
        ],
        'sales.return' => [
            'module' => 'sales',
            'label' => 'Sales Return',
            'required' => false,
            'account_types' => ['revenue'],
            'description' => 'Default sales return account.',
        ],
        'sales.tax_output' => [
            'module' => 'sales',
            'label' => 'Output Tax',
            'required' => false,
            'account_types' => ['liability'],
            'description' => 'Default output tax account.',
        ],

        'purchase.accounts_payable' => [
            'module' => 'purchase',
            'label' => 'Accounts Payable',
            'required' => true,
            'account_types' => ['liability'],
            'description' => 'Default payable account for purchase invoices.',
        ],
        'purchase.default_purchase' => [
            'module' => 'purchase',
            'label' => 'Default Purchase / Expense',
            'required' => true,
            'account_types' => ['asset', 'expense'],
            'description' => 'Default purchase or expense account.',
        ],
        'purchase.tax_input' => [
            'module' => 'purchase',
            'label' => 'Input Tax',
            'required' => false,
            'account_types' => ['asset'],
            'description' => 'Default input tax account.',
        ],

        'inventory.asset' => [
            'module' => 'inventory',
            'label' => 'Inventory Asset',
            'required' => true,
            'account_types' => ['asset'],
            'description' => 'Default inventory asset account.',
        ],
        'inventory.cogs' => [
            'module' => 'inventory',
            'label' => 'Cost of Goods Sold',
            'required' => true,
            'account_types' => ['expense'],
            'description' => 'Default COGS account.',
        ],
        'inventory.adjustment_gain' => [
            'module' => 'inventory',
            'label' => 'Inventory Adjustment Gain',
            'required' => false,
            'account_types' => ['revenue', 'expense'],
            'description' => 'Default gain account for positive stock adjustment.',
        ],
        'inventory.adjustment_loss' => [
            'module' => 'inventory',
            'label' => 'Inventory Adjustment Loss',
            'required' => false,
            'account_types' => ['expense'],
            'description' => 'Default loss account for negative stock adjustment.',
        ],

        'cash_bank.default_cash' => [
            'module' => 'cash_bank',
            'label' => 'Default Cash',
            'required' => true,
            'account_types' => ['asset'],
            'description' => 'Default cash account.',
        ],
        'cash_bank.default_bank' => [
            'module' => 'cash_bank',
            'label' => 'Default Bank',
            'required' => true,
            'account_types' => ['asset'],
            'description' => 'Default bank account.',
        ],
        'cash_bank.bank_admin_fee' => [
            'module' => 'cash_bank',
            'label' => 'Bank Admin Fee',
            'required' => false,
            'account_types' => ['expense'],
            'description' => 'Default bank admin fee account.',
        ],
        'cash_bank.bank_interest_income' => [
            'module' => 'cash_bank',
            'label' => 'Bank Interest Income',
            'required' => false,
            'account_types' => ['revenue'],
            'description' => 'Default bank interest income account.',
        ],

        'opening_balance.equity' => [
            'module' => 'opening_balance',
            'label' => 'Opening Balance Equity',
            'required' => true,
            'account_types' => ['equity'],
            'description' => 'Default balancing equity account for opening balances if needed.',
        ],

        'closing.retained_earnings' => [
            'module' => 'closing',
            'label' => 'Retained Earnings',
            'required' => true,
            'account_types' => ['equity'],
            'description' => 'Default retained earnings account for fiscal closing.',
        ],
        'closing.current_year_earnings' => [
            'module' => 'closing',
            'label' => 'Current Year Earnings',
            'required' => true,
            'account_types' => ['equity'],
            'description' => 'Default current year earnings account.',
        ],

        'journal.suspense' => [
            'module' => 'journal',
            'label' => 'Suspense Account',
            'required' => false,
            'account_types' => ['asset', 'liability', 'equity', 'expense', 'revenue'],
            'description' => 'Suspense account for temporary classification. Use carefully.',
        ],
    ],
];

