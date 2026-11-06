# Arkila (Phase 1 beta)

Static site (GitHub Pages). No backend yet: everything is saved in the visitor's browser (localStorage, prefix `arkila2-`).
Flow: admin lists vehicles, renter sends a request, Arkila confirms on Messenger, renter pays after confirmation, then pick-up.

## Files
- `index.html` renter site. `admin.html` staff dashboard. `owner.html` owner dashboard (TEST ONLY, not linked from the site).
- `config.js` brand, settings, sample vehicles. `store.js` data layer (`ST`). `db.js` empty database shell for later. `svgs.js` vehicle art. `legal.js` terms, privacy, renter notice. `fil.js` Filipino strings.
- `dash.js` + `dash.css` Insights tab (charts, hover/tap details, custom date range). Used by admin and owner.
- `csv.js` CSV export (requests, vehicles) and vehicle import (admin). `cal.js` tap-to-block availability calendar.
- Script tags use `?v=85`. Bump them all together when a JS or CSS file changes.

## What each screen has
- Renter: search, filters, sort, map, saved, request flow, "Your requests" with cancel / delete, ratings and reviews after a completed trip.
- Admin: Overview, Requests (filter, search, bulk select and actions, CSV export), Vehicles (approve, pause, delete, CSV import/export, blocked dates calendar), Insights.
- Owner: same as admin but only their own vehicles and requests.

## Before launch
- Set `BRAND.fb` in `config.js` (Messenger buttons stay hidden until then).
- Lawyer review of `legal.js` and the `[bracketed]` decisions.
- Move to a shared database through `db.js` (nothing else needs to change).
