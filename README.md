# Arkila (Phase 1 beta)

Static site (GitHub Pages) with a Supabase database (see `ARKILA-BACKEND-SETUP.md`).
Flow: admin lists vehicles, renter sends a request, Arkila confirms on Messenger, renter pays after confirmation, then pick-up.
If `SUPABASE` in `config.js` is left empty, the site runs in test mode and everything stays in the visitor's browser (localStorage, prefix `arkila2-`).

## Files
- `index.html` renter site. `admin.html` staff dashboard (needs a staff sign-in). `owner.html` owner dashboard (TEST ONLY, not linked, never gets database access).
- `config.js` brand, settings (extra-hour rate and maximum are used by the site), Supabase keys. `store.js` local data layer (`ST`). `db.js` database layer (`DB`). `svgs.js` vehicle art. `legal.js` terms, privacy, renter notice. `fil.js` Filipino strings.
- `dash.js` + `dash.css` Insights tab. `csv.js` CSV export/import. `cal.js` blocked-dates calendar and the `vAt()`/`vid()` helpers (buttons carry vehicle ids, not list positions).
- `arkila-supabase.sql` database setup. Re-run it after changing it (it is safe to run again).
- Script tags use `?v=137`. Bump them all together when a JS or CSS file changes.

## What each screen has
- Renter: search, filters, sort, map, saved, trip planner, request flow, "Your requests" with cancel / delete. Reviews are hidden in Phase 1 (they are only stored on the renter's device until a reviews table exists).
- Admin: Overview, Requests (filter, search, bulk actions with the same checks as single ones, CSV export), Vehicles (approve, pause, delete, CSV import/export, blocked dates calendar), Insights.

## Before launch
See `../NEEDS-YOUR-ACTION.md`.
