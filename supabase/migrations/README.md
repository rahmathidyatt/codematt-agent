# Versioned migrations

Phase 0 defines the schema in docs/DATABASE.md. No executable database migration is included yet.
Phase 2 must add timestamped SQL migrations for profiles, settings, brand kits and RLS, then test with two users on a local or staging Supabase project.
Never run destructive resets against production. Generate TypeScript database types after applying migrations.
