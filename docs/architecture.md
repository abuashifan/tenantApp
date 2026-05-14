# Architecture

## Domain Model

Initial domain:

```text
http://localhost:3000
```

Database Model
backend/database/central.sqlite
backend/database/tenants/company_xxx.sqlite

# Access Flow

============================
User login
↓
System checks central.sqlite
↓
System returns companies accessible by user
↓
User selects active company
↓
Frontend sends X-Company-ID on API requests
↓
Backend validates access
↓
Backend connects to selected company SQLite
