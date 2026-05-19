<?php

namespace App\Http\Requests\Concerns;

trait HasReportDateFilters
{
    public function dateFilterRules(): array
    {
        return [
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}

