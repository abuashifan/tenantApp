# Permission Catalog

The permission catalog is stored centrally in `permissions` and seeded from `backend/config/permissions.php` through `PermissionSeeder`.

Important fields:

- `key`: technical permission key used by middleware.
- `module`: top-level permission module.
- `feature`: feature inside a module.
- `action`: technical action.
- `matrix_column`: UI column mapping.
- `is_special`: true when action does not fit standard matrix columns.

Matrix column mapping:

- `view`, `list`, `index`, `show` -> `daftar`
- `create`, `store` -> `tambah`
- `edit`, `update` -> `ubah`
- `delete`, `deactivate`, `void`, `cancel` -> `hapus`
- `print`, `export_pdf` -> `cetak`
- `report`, `view_report` -> `laporan`
- `approve`, `post`, `confirm`, `close`, `reopen`, `receive`, `ship`, `deliver`, `finalize` -> `persetujuan`

Special permissions:

- `import`
- `export`
- `refund`
- `convert`
- `transfer`
- `manage`
- other actions outside the matrix mapping

Access-management permissions added:

- `access.users.view`
- `access.users.manage`
- `access.roles.view`
- `access.roles.manage`
- `access.permissions.view`
- `access.permissions.manage`
- `access.invitations.view`
- `access.invitations.manage`
