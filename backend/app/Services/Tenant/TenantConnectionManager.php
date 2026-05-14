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
    }

    public function disconnect(): void
    {
        DB::disconnect('tenant');
    }
}