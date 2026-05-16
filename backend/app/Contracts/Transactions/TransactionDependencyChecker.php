<?php

namespace App\Contracts\Transactions;

interface TransactionDependencyChecker
{
    public function hasBlockingDependencies(mixed $transaction, string $action, string $module): bool;

    public function blockingReasons(mixed $transaction, string $action, string $module): array;
}

