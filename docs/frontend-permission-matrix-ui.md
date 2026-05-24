# Frontend Permission Matrix UI

The User Access UI is available at `/access/users`.

Layout:

- User selector
- Account summary
- Role preset selector
- Copy Access button
- Reset to Role Default button
- Save button
- Module tabs
- Matrix permission table
- Special permission table

Checkbox behavior:

- Checked from role default: normal checked state.
- Checked from user allow override: highlighted checked state.
- Unchecked from user deny override: warning state.
- Unassigned: empty state.

When a checkbox changes:

- If role default grants it and user unchecks it, frontend sends a `deny` override.
- If role default does not grant it and user checks it, frontend sends an `allow` override.
- If user returns the checkbox to role default state, the override is removed.

Save behavior:

- `PUT /api/access/users/{companyUserId}/permissions`
- Payload sends only `role_id` and override rows.
- If the edited user is the current logged-in user, frontend refreshes `/api/auth/permissions`.

Copy behavior:

- `POST /api/access/users/{companyUserId}/copy-access`
- Source and target must belong to the same active company.
- User may copy role preset, user overrides, or both.

Reset behavior:

- `POST /api/access/users/{companyUserId}/reset-permissions`
- Deletes all user overrides and keeps the current role preset.
