# Point 10 — Rapikan API Interceptor dan Error Handling

## TASK TITLE
Harden API Interceptor and Error Handling

## PROJECT
TenantAppDevelopment / tenantApp

## FOCUS POINT
Point 10 — Rapikan API interceptor dan error handling

## MAIN GOAL
Rapikan API client/interceptor/error handling di frontend Vue agar semua request konsisten membawa Authorization Bearer token dan X-Company-ID, serta error 401/403/422/network ditangani dengan jelas di seluruh aplikasi.

Task ini harus memperkuat fondasi, bukan mengubah flow besar.

---

## STRICT GUARDRAILS — DO NOT BREAK EXISTING FIXED AREAS

### DO NOT

- Do not rewrite the whole API layer from scratch if existing API client works.
- Do not change backend API contracts.
- Do not change auth token storage keys unless absolutely required and migrated safely.
- Do not change company selection flow.
- Do not break X-Company-ID behavior.
- Do not break existing services.
- Do not rewrite all pages.
- Do not introduce Redux/Zustand or new state library.
- Do not redirect aggressively on every 403.
- Do not hide useful Laravel validation errors.
- Do not hardcode company ID/token.
- Do not change visual design globally.
- Do not run destructive commands.

### PRESERVE

- Existing login.
- Existing logout.
- Existing select company.
- Existing auth store.
- Existing company store.
- Existing Pinia setup.
- Existing service function names if used by pages.
- Existing route guards.
- Existing workspace/virtual tab behavior.

---

## READ FIRST

### Frontend Vue

```text
frontend-vue/src/services/api.ts
frontend-vue/src/plugins/apiInterceptors.ts
frontend-vue/src/stores/auth.store.ts
frontend-vue/src/stores/company.store.ts
frontend-vue/src/stores/permissions.store.ts
frontend-vue/src/router/index.ts
frontend-vue/src/services/**/*.ts
frontend-vue/src/composables/*error*
frontend-vue/src/utils/*error*
```

### Backend

```text
backend/config/api_errors.php if exists
backend/app/Exceptions/*
backend/app/Http/Requests/*
backend/routes/api.php
```

### Docs

```text
docs/frontend-audit-gap-report.md
docs/update-roadmap.md
```

Search terms:

```text
axios
interceptor
Authorization
Bearer
X-Company-ID
401
403
422
validation
ApiError
network error
logout
select-company
```

---

## REQUIREMENTS

### 1. Request Interceptor

Ensure every authenticated API request sends:

```text
Authorization: Bearer <token>
X-Company-ID: <activeCompanyId>
Accept: application/json
Content-Type: application/json when request has body
```

Do not send X-Company-ID for public auth endpoints if current backend does not need it.

Public endpoints:

```text
/api/auth/login
/api/auth/register
/api/health
```

Company-scoped endpoints must include X-Company-ID.

### 2. Response/Error Normalizer

Create or update centralized error normalizer.

Support:

```text
401 unauthenticated
403 forbidden
404 not found
409 conflict
422 validation error
500 server error
network/offline error
```

Normalized shape example:

```ts
type NormalizedApiError = {
  status?: number
  message: string
  errors?: Record<string, string[]>
  code?: string
  raw?: unknown
}
```

Use existing type names if already present.

### 3. 401 Handling

On 401:

```text
[ ] clear auth token/user if token is invalid
[ ] keep behavior consistent with current logout
[ ] redirect to login only when appropriate
[ ] avoid infinite redirect loop
[ ] do not redirect if already on login/register
```

### 4. 403 Handling

On 403:

```text
[ ] show permission denied message
[ ] do not logout automatically
[ ] do not redirect user to login
[ ] allow page/component to display proper error state
```

### 5. 422 Handling

On 422:

```text
[ ] preserve Laravel validation errors
[ ] expose field errors to forms
[ ] do not collapse into generic failed message
```

### 6. Network Error Handling

For network errors:

```text
[ ] show clear connection/backend unavailable message
[ ] do not clear auth token
[ ] do not redirect to login
```

### 7. Service Compatibility

Existing services should continue to work.

If changing API helper return shape, update call sites safely.
Prefer not to change return shape unless current shape is broken.

### 8. Toast / Notification

If app already has notification/toast utility, reuse it.
If not, keep error state in page/component. Do not add new heavy toast library.

### 9. Company Switch Behavior

When company changes:

```text
[ ] new requests use new X-Company-ID
[ ] old cached tenant data should be refreshed where current app already supports it
[ ] do not leak old company data
```

Do not attempt full cache invalidation refactor unless existing store supports it.

---

## ACCEPTANCE CRITERIA

```text
[ ] API requests include Bearer token when authenticated.
[ ] Company-scoped requests include X-Company-ID.
[ ] Login/register/health do not require X-Company-ID.
[ ] 401 invalid token clears auth and redirects safely.
[ ] 403 shows permission denied without logout.
[ ] 422 validation errors remain accessible to forms.
[ ] Network error displays clear message.
[ ] Existing services still compile.
[ ] Existing pages still compile.
[ ] No infinite redirect loop.
[ ] Company switch still works.
[ ] Existing workspace pages still load.
```

---

## TESTING

Frontend:

```bash
cd frontend-vue
npm run typecheck
npm run lint
npm run build
```

Manual QA:

```text
[ ] Login success.
[ ] Logout success.
[ ] Select company success.
[ ] Open company-scoped page and verify X-Company-ID sent.
[ ] Trigger 403 with unauthorized user and confirm no logout.
[ ] Trigger 422 form validation and confirm field errors appear.
[ ] Stop backend temporarily and confirm network error message.
[ ] Expired/invalid token redirects to login without loop.
```

Backend optional:

```bash
php artisan route:list --path=api
```

---

## DOCUMENTATION

Create/update:

```text
docs/point-10-api-interceptor-error-handling.md
```

Include:

```text
request header rules
public endpoint exceptions
error normalization
401/403/422 behavior
manual QA checklist
known limitations
```

Update `docs/frontend-audit-gap-report.md` with point 10 status.

---

## FINAL SUMMARY REQUIRED

Report:

```text
1. Root cause / inconsistency found.
2. API files changed.
3. Error normalizer behavior.
4. 401 handling.
5. 403 handling.
6. 422 handling.
7. Network error handling.
8. Compatibility changes.
9. Commands run and result.
10. Regression checklist.
```

---

## COMMIT AND PUSH REQUIRED

```bash
git status --short
git add <relevant files only>
git commit -m "harden api interceptor and error handling"
git push origin main
```

If current branch is not main:

```bash
git push origin HEAD
```

Final response must include commit hash and push result.
