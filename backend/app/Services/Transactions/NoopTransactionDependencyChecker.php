<?php

namespace App\Services\Transactions;

use App\Contracts\Transactions\TransactionDependencyChecker;

class NoopTransactionDependencyChecker implements TransactionDependencyChecker
{
    public function hasBlockingDependencies(mixed $transaction, string $action, string $module): bool
    {
        return false;
    }

    public function blockingReasons(mixed $transaction, string $action, string $module): array
    {
        return [];
    }
}

