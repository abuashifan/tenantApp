<?php

namespace App\Services\Inventory\Reports;

use App\Exceptions\ApiException;
use App\Models\Tenant\StockMovementLine;

class StockCardReportService
{
    public function card(int $productId, ?int $warehouseId, array $filters = []): array
    {
        $start = $filters['start_date'] ?? null;
        $end = $filters['end_date'] ?? null;
        $includeVoid = (bool) ($filters['include_void'] ?? false);

        $base = StockMovementLine::query()
            ->select('stock_movement_lines.*', 'stock_movements.movement_number', 'stock_movements.movement_date', 'stock_movements.movement_type', 'stock_movements.status as movement_status')
            ->join('stock_movements', 'stock_movements.id', '=', 'stock_movement_lines.stock_movement_id')
            ->where('stock_movement_lines.product_id', $productId);

        if ($warehouseId) $base->where('stock_movement_lines.warehouse_id', $warehouseId);

        if ($includeVoid) {
            $base->whereIn('stock_movements.status', ['posted', 'void']);
        } else {
            $base->where('stock_movements.status', 'posted');
        }

        $openingQty = 0.0;
        $openingVal = 0.0;
        if ($start) {
            $openingLines = (clone $base)
                ->whereDate('stock_movements.movement_date', '<', (string) $start)
                ->orderBy('stock_movements.movement_date')
                ->orderBy('stock_movements.movement_number')
                ->orderBy('stock_movement_lines.sort_order')
                ->orderBy('stock_movement_lines.id')
                ->get();

            foreach ($openingLines as $ln) {
                $dir = (string) $ln->direction;
                if ($dir === 'in') {
                    $openingQty += (float) $ln->quantity;
                    $openingVal += (float) $ln->total_cost;
                } elseif ($dir === 'out') {
                    $openingQty -= (float) $ln->quantity;
                    $openingVal -= (float) $ln->total_cost;
                }
            }
        }

        $linesQ = (clone $base);
        if ($start) $linesQ->whereDate('stock_movements.movement_date', '>=', (string) $start);
        if ($end) $linesQ->whereDate('stock_movements.movement_date', '<=', (string) $end);

        $movementLines = $linesQ
            ->orderBy('stock_movements.movement_date')
            ->orderBy('stock_movements.movement_number')
            ->orderBy('stock_movement_lines.sort_order')
            ->orderBy('stock_movement_lines.id')
            ->get();

        $running = $this->runningBalances($movementLines, $openingQty, $openingVal);

        return [
            'filters' => array_merge($filters, ['product_id' => $productId, 'warehouse_id' => $warehouseId]),
            'opening_quantity' => round($openingQty, (int) config('inventory.stock_precision', 4)),
            'opening_value' => round($openingVal, (int) config('inventory.amount_precision', 2)),
            'movements' => $running['movements'],
            'ending_quantity' => $running['ending_quantity'],
            'ending_value' => $running['ending_value'],
        ];
    }

    public function runningBalances($movementLines, float $openingQty = 0.0, float $openingValue = 0.0): array
    {
        $qty = $openingQty;
        $val = $openingValue;
        $rows = [];

        foreach ($movementLines as $ln) {
            $dir = (string) $ln->direction;
            $qtyIn = $dir === 'in' ? (float) $ln->quantity : 0.0;
            $qtyOut = $dir === 'out' ? (float) $ln->quantity : 0.0;
            $valIn = $dir === 'in' ? (float) $ln->total_cost : 0.0;
            $valOut = $dir === 'out' ? (float) $ln->total_cost : 0.0;

            $qty += $qtyIn;
            $qty -= $qtyOut;
            $val += $valIn;
            $val -= $valOut;

            $rows[] = [
                'date' => optional($ln->movement_date)->toDateString() ?: (string) $ln->movement_date,
                'number' => (string) $ln->movement_number,
                'type' => (string) $ln->movement_type,
                'status' => (string) $ln->movement_status,
                'qty_in' => $qtyIn,
                'qty_out' => $qtyOut,
                'running_quantity' => round($qty, (int) config('inventory.stock_precision', 4)),
                'unit_cost' => (float) ($ln->unit_cost ?? 0),
                'value_in' => (float) $valIn,
                'value_out' => (float) $valOut,
                'running_value' => round($val, (int) config('inventory.amount_precision', 2)),
            ];
        }

        return [
            'movements' => $rows,
            'ending_quantity' => round($qty, (int) config('inventory.stock_precision', 4)),
            'ending_value' => round($val, (int) config('inventory.amount_precision', 2)),
        ];
    }
}

