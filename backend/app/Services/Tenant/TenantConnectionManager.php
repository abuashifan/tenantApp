<?php

namespace App\Services\Tenant;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class TenantConnectionManager
{
    public function connect(string $databasePath): void
    {
        Config::set('database.connections.tenant.database', $databasePath);

        DB::purge('tenant');
        DB::reconnect('tenant');

        // Some CI/dev sandboxes restrict SQLite rollback journal file creation.
        // For tests we can safely keep SQLite journals in memory to avoid disk I/O errors.
        if (app()->environment('testing') && (string) config('database.connections.tenant.driver') === 'sqlite') {
            DB::connection('tenant')->statement('PRAGMA journal_mode = MEMORY');
            DB::connection('tenant')->statement('PRAGMA synchronous = OFF');
        }
    }

    public function disconnect(): void
    {
        DB::disconnect('tenant');
    }
}
