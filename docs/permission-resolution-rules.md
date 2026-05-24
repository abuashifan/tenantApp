# Permission Resolution Rules

Permissions are resolved per `company_user`, not globally per user.

Formula:

```text
effective_permissions = role_default_permissions + allow_overrides - deny_overrides
```

Sources:

- `role_default`: permission comes from the selected role preset.
- `user_override_allow`: permission is added directly to the user for this company.
- `user_override_deny`: permission is removed directly from the user for this company.
- `not_assigned`: permission is not granted by role or user override.

Rules:

- A deny override always wins over role default and allow previews.
- Removing an override restores role default behavior.
- Owner/admin legacy wildcard roles still work.
- Existing middleware remains active and calls the effective resolver.
- Overrides are linked to `company_user_permission_overrides.company_user_id`.

Self-edit protection:

- A user cannot modify their own permissions unless their active company role is `owner` or `admin`.
- Cross-company edits are blocked because target company users are queried only inside active company scope.
