<?php

namespace App\Traits;

use App\Support\Api\ApiErrorCode;
use App\Support\Api\ApiResponseBuilder;

trait ApiResponse
{
    protected function successResponse(
        mixed $data = null,
        string $message = 'Success',
        int $status = 200
    ) {
        return ApiResponseBuilder::success($data, $message, $status);
    }

    protected function errorResponse(
        string $message = 'Error',
        int $status = 400,
        mixed $errors = null
    ) {
        return ApiResponseBuilder::error(ApiErrorCode::UNKNOWN_ERROR, $message, (array) ($errors ?? []), $status);
    }

    protected function errorCodeResponse(
        string $code,
        ?string $message = null,
        array $errors = [],
        int $status = 400,
        array $meta = []
    ) {
        return ApiResponseBuilder::error($code, $message, $errors, $status, $meta);
    }

    protected function warningResponse(
        string $code,
        ?string $message = null,
        array $errors = [],
        array $meta = [],
        int $status = 409
    ) {
        return ApiResponseBuilder::warning($code, $message, $errors, $meta, $status);
    }

    protected function validationErrorResponse(array $errors, string $message = 'The given data was invalid.', array $meta = [])
    {
        return ApiResponseBuilder::validation($errors, $message, $meta);
    }

    protected function policyResponse(mixed $policyResult, int $denyStatus = 403)
    {
        return ApiResponseBuilder::fromPolicyResult($policyResult, $denyStatus);
    }
}
