# Accounting App

Stack:
- Laravel API
- Next.js Frontend
- TailwindCSS
- SQLite
- Multi-tenant database per company

Architecture:
- central.sqlite for users, companies, subscriptions, tenant metadata
- one SQLite file per company
