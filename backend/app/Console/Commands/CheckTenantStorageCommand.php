<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckTenantStorageCommand extends Command
{
    protected $signature = 'tenant:check-storage';

    protected $description = 'Check tenant database storage directory';

    public function handle(): int
    {
        $path = config('tenant.database_path');

        if (! is_dir($path)) {
            $this->error("Tenant directory does not exist: {$path}");
            return self::FAILURE;
        }

        if (! is_writable($path)) {
            $this->error("Tenant directory is not writable: {$path}");
            return self::FAILURE;
        }

        $this->info("Tenant directory is ready: {$path}");

        return self::SUCCESS;
    }
}