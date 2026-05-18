<?php

namespace App\Http\Requests\MasterData;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['sometimes', 'string', 'max:30'],
            'name' => ['sometimes', 'string', 'max:100'],
            'precision' => ['nullable', 'integer', 'min:0', 'max:8'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}

