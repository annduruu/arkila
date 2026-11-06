# Arkila: renting cars and motorbikes in Puerto Princesa

Static site (GitHub Pages). Phase 1: Arkila lists the vehicles, the renter sends a request, we confirm on Messenger, then papers and payment, then pick-up.

## Pages
- index.html: renter site (English / Filipino, PHP and reference currencies)
- admin.html: staff dashboard (requests, vehicles, blocked dates, approve owner vehicles)
- owner.html: owner dashboard, TEST ONLY. Not linked from anywhere. Owner accounts are Phase 2.

## Files
- config.js: brand, vehicles, areas, rates, blocked dates. Edit here.
- store.js: browser storage (arkila2-* keys).
- db.js: the data shell. Fill it in to move to a shared database (Supabase or Firebase). Nothing else needs to change.
- svgs.js: sample illustrations used when a vehicle has no photos.
- fil.js: Filipino translation. Needs a Filipino speaker's proofread.
- legal.js: renter notice, Terms, Privacy. Items in [brackets] are open decisions.
- Cache busting: asset links use ?v=82. Change all of them together when you update a file.
- The previous version of the whole site is kept in arkila-site-legacy/.

## Still open
- No shared database yet: requests and accounts live in each browser. Staff on another device will not see a renter's request until db.js is filled in.
- Messenger username (BRAND.fb in config.js) is empty, so the Messenger buttons are hidden.
- Vehicle descriptions and legal text are English only.
- Add-on pricing (5 to 6 extra hours both cost a full day) still to be decided.
