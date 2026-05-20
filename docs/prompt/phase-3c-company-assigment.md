[Progress Notes] Phase 3C - Internal Company Assignment & Demo Seeder

Scope completed:
- Added internal Artisan command `php artisan company:assign-user` (supports interactive prompt if options missing).
- Added internal Artisan command `php artisan company:seed-demo` (idempotent demo seeder, no tenant migrations).
- Implemented `App\Services\Companies\CompanyUserAssignmentService` with validations:
  - company exists + status active
  - user exists by email
  - tenant_database exists + status active + sqlite file exists
  - role limited to owner|admin|staff|viewer
  - creates/updates `company_users` and reactivates inactive assignments by setting status=active
- `company:seed-demo` ensures:
  - user `admin@example.com` exists (password hashed)
  - companies `PT Maju Jaya` + `CV Sumber Rejeki` exist (status active)
  - tenant_databases for both exist + sqlite files exist (created only if missing, no overwrite)
  - admin assigned to PT Maju Jaya as owner, and CV Sumber Rejeki as admin
- Security preserved:
  - no frontend changes
  - no public API endpoints for assignment/create tenant/company/migrate
  - tenant migration remains handled by `php artisan tenant:migrate`

Files created/updated:
- backend/app/Services/Companies/CompanyUserAssignmentService.php
- backend/app/Console/Commands/AssignCompanyUserCommand.php
- backend/app/Console/Commands/SeedDemoCompaniesCommand.php
- docs/phase-3c-company-assignment.md
