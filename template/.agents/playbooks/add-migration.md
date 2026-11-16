# Playbook: add-migration (issue label `area:data`)
1. Migrations are SQL files under `supabase/migrations/`, forward-only, one concern each.
2. Every new table has row-level security on, with policies written from the data-access matrix in `docs/contracts/`.
3. Add or update negative tests: a user must not read or write another user's rows; an anonymous caller must get nothing.
4. Migrations, RLS and auth changes are never auto-merged. Label `needs-owner` and wait for approval.
