# Arkila Puerto Princesa

Static demo site. No server: accounts, listings and requests are saved in each visitor's own browser (localStorage), so nothing is shared between devices yet. A renter picks a vehicle, dates and passengers, and the site builds a request message to send to your Facebook page. Owners list vehicles, and the Arkila team approves them.

## Put it online with GitHub Pages
1. Create a new repository on GitHub (public).
2. Upload everything in this folder to the repository root (index.html, style.css, app.js, config.js, .nojekyll).
3. Repository Settings, then Pages. Under Source choose "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
4. After a minute the site is live at `https://<your-username>.github.io/<repository-name>/`.

## Edit without coding
Open `config.js` on GitHub (pencil icon) and change:
- `BRAND`: your name, logo, Facebook page, Instagram, WhatsApp, email and phone. Filled-in links appear in the footer, and a Facebook page also turns on the floating Chat button and the Open Messenger button.
- `isSample`: set to `false` once real vehicles are listed.
- `CARS`: one line per vehicle. Copy a line, change the name, price, area, seats, type and service. Use `active:false` to hide one. Each `id` must be unique.

## How a request reaches you
The guest copies the message and sends it to your page on Messenger. The last line (`Request ref: ...`) holds the vehicle, dates and phone, so the Arkila back office can turn a pasted message into a booking.

## Adding real photos
1. In the repository, click Add file, then Create new file. Type `photos/vios-1.jpg` in the name box is not possible for images, so use Add file, then Upload files, and upload the photos into a folder called `photos`.
2. In `config.js`, set the vehicle's `images` list, for example `images:['photos/vios-1.jpg','photos/vios-2.jpg']`.
3. Photos should be JPG, under 500 KB each, landscape.

## Map
The pickup pin uses OpenStreetMap through Leaflet. Area coordinates in `config.js` are approximate. Adjust them if a pickup area is off.

## Languages and currencies
- The site ships in English and Filipino. The language menu (globe button, top right) also switches the currency.
- Currencies: PHP, USD, AUD, EUR, GBP, KRW, JPY, CNY, SGD, CAD. Prices in other currencies are a guide. Payments are in Philippine pesos.
- Exchange rates refresh automatically about every 12 hours from a free public service. If that fails, the rates in `config.js` are used.
- To add a language: open `i18n.js`, copy the whole `en:{...}` block, translate the values on the right, name it with a short code (for example `ko`), and add it to `LANGS` in `config.js`.
- Vehicle names, descriptions and features are written by owners in one language and are not translated.

## Motorbikes

Motorbikes live in the same list as cars. In `config.js` the sample bikes are added with `CARS.push(...)` and have `kind:'motor'`.
`seats` means riders, and `specs` holds `cc`, `helmets`, `mileage` and `deposit` (the refundable security deposit, paid online to Arkila with the rental fee).
Owners choose "Motorbike or scooter" in the Add a vehicle form. Types: Scooter, Underbone, Mid-size, Big bike. The sample bikes and prices are for testing only.

## Availability calendar

Each vehicle page has a calendar. Booked and blocked days are greyed out and cannot be picked, and a rental cannot run across a blocked day.

- **Confirmed bookings** block their dates automatically (when the Arkila screen marks the payment as received).
- **Owners** open Owner dashboard, press Calendar on a vehicle, and tap free days to block or unblock them. In this demo that is saved on the same device only.
- **Real blocks:** until the backend exists, when an owner asks for dates to be blocked, add them to the `BLOCKED` list at the bottom of `config.js` (both days are included). Example: `'m-click':[['2026-11-12','2026-11-15']]`. The two sample ranges there can be deleted.


Note: when pickup and return dates are set, vehicles already booked or blocked for those dates are hidden from the list, and the count shows how many were hidden.


## Money and notices (Terms draft)

- Renters pay the rental fee and a refundable security deposit online to Arkila after the owner confirms the dates. There is no pay-later and no cash at pickup.
- Default deposits are in `config.js` (`SETTINGS.deposit`). Owners can set their own on a listing. These are placeholders, decide before launch.
- The renter notice is ticked when a request is sent, and the owner declaration when a vehicle is submitted. Both are stored on the request or listing as `ack`. The full wording lives in `i18n.js` under `nt.*` and must match the Terms of Service draft.
- The cancellation text in `SETTINGS.cancellation` is a placeholder that matches the Terms draft.

## Public legal pages

- `legal.js` holds the Terms of Service, Privacy Notice, renter notice and owner declaration. They open at `#terms` and `#privacy` without logging in, and from the footer and the tick boxes.
- Items in [square brackets] show highlighted. Fill them, and update the matching Claude Docs, before real payments. A Philippine lawyer should review everything first.
- `SETTINGS.damageCap` in `config.js` is a placeholder (₱50,000 cars, ₱30,000 motorbikes). Decide the real amounts.
- The Filipino view shows a short summary above the full English notice, which is the version people agree to. A full Filipino version is still to be written.


## Search, places and accounts
- The Where box searches the built-in places in `config.js` (`PLACES`, `AREAS`) and, as you type, any place in Palawan through the free Photon service (needs internet). Owners use the same search to set a vehicle's pickup location, and the vehicle then shows at that spot on the map.
- Logged-in users get an Account page (menu, Account) to edit personal details, download their data or delete the account. This is demo data on the device only.
- Dates in the past cannot be requested, and the same vehicle and dates cannot be requested twice by one renter.

## Pickup time and admin
- Rentals are 24-hour days from the pickup time the renter picks (Time tab in the search bar, the availability panel and the request form). Return is the same time on the last day.
- The admin screen is a backoffice: Overview, Vehicles, Bookings, Users, Payouts, Settings. Tables have search, sorting, tick-box bulk actions and CSV export. Vehicles can be imported from CSV (Import CSV, then "Use the template"). Log in with "Admin demo login" to open it.

## Dates & time picker, dashboards and test data (latest)
- One shared "Dates & time" picker (search bar, vehicle page popup, booking form). Pickup time and extra hours can be typed ("9:30 am", "930", "21:00", "2") or picked from a small dropdown. The code lives in app.js under "shared pickup time + extra hours boxes".
- Admin has a Dashboard tab (KPIs, monthly value and commission, weekly bookings, busiest days, outcomes, areas, types, top vehicles and owners). Owners get their own dashboard on the Owner screen; the admin can open any owner's view from Users. Charts are plain SVG/CSS in dash.js, no library.
- Admin, Settings, Test load: loads about 40 owners, 60 renters, 120 vehicles and 600 bookings (demo.js), tagged demo and removable with Clear demo data.
- Safety nets: damaged saved data is tidied on load (store.js), a reload bar appears if the page errors, and Admin, Settings has Download backup / Restore.
- Still demo only: anyone can edit browser data. Real logins, payments and shared data need the Phase 2 backend.

## Required fields and names
- Owner form: every field is required except photos and features. Dropdowns start at "Select…" and number boxes start empty (placeholders only), so nothing is pre-filled. A missed field is outlined in red with a message.
- CSV import has the same rules: name, kind, type, seats, service, area, price (300 or more), hourly (1 up to the daily price), deposit, description (20+ characters), year, transmission and fuel are needed, plus bags for cars and cc, helmets and distance for motorbikes. The preview lists each problem per row.
- Names are first name + last name (booking form, login and account). Older accounts with one name are split automatically.

## Hover details and demo accounts
- Every dashboard tile, bar, line point, donut slice, list row and heatmap cell shows a small details box on hover (tap on phones). It lives in dash.js (one shared box, `data-tip` on each element).
- After "Load demo data", the login box offers "Demo owner" and "Demo renter". The demo owner has 5 vehicles (one paused, one waiting for approval), many past bookings and a few new requests to answer.

## Owner area (tabs)
The owner page now has the same tabbed layout as the admin, with only the owner's own data: Dashboard, Tasks (requests to answer, things to know), Vehicles (search, filters, calendar, pause, delete), Bookings (search, filters, sort, answer requests, CSV), Payouts (what is paid and still to be paid) and Add vehicle. Owners can only answer requests for their own vehicles.

## Test accounts
- Admin > Settings > Test load (after loading demo data): "Open owner area (Demo Owner)" and "Open renter view (Demo Renter)" sign you in as a test account. A banner on the owner area has a "Back to admin" button.

## Dashboard date range
The range chips (30 days, 90 days, 12 months, All time) now have a **Custom range** chip. It opens a two-month calendar (one month on phones): pick the first day, then the last day, then Apply. KPIs, charts, weekly and heatmap views follow the range and compare with the previous period of the same length. Ranges of 31 days or less show daily bars; longer ones show months. Reset to default (or the × chip) goes back to 90 days. Not remembered between visits. Admin and owner dashboards both have it (owners only see their own data).

## Tabs and filters
Tabs are a grey segmented bar with a white active tab and small count badges (vehicles waiting, bookings to pay, payouts unpaid). Filter chips are filled blue when on and show counts. The old chart colour filter chips were removed (the three blues and hover details cover it).

## Vehicle details bar
The vehicle details window has a pinned bar: a top ribbon on desktop (name, dates, total, Choose button) and a bottom bar on phones (total, dates, Choose button). Tapping the dates opens the availability calendar. Hearts show for everyone; tapping one while signed out opens sign in.

## Look and feel (Airbnb style)
- Flat cards, one blue accent, underline tabs for owner and admin, thin-rule KPI tiles (hover details kept).
- My bookings shows a 4-step progress bar (Requested, Owner OK, Confirmed, Done).
- On phones a bottom bar gives Rent, Shortlist, My bookings and Menu.
- Vehicle details keep the pinned dates and Choose button.

## Layout update
- Search is one round pill on web. On phones it is a single tap bar ("Where are you driving?") that opens the full form and closes after Search.
- Category tabs keep their blue underline. Type and Service share one row.
- Vehicle details show key facts on one icon row, then a clean list. Phones show "Show all details".
- The bottom bar appears on touch devices only.

## Draft match (cards, bookings, bars)
- Vehicle cards are photo-first: name, rating, type, price. The extra-hour line and service badge are gone (service is still a filter).
- My bookings cards have a photo; the price breakdown opens from one line.
- On touch phones the bottom bar changes inside the owner area (Today, Tasks, Vehicles, Payouts) and admin area (Overview, Vehicles, Payouts).
- Dark mode uses neutral greys; light mode keeps the blue and white.

## Cleanup
- Removed repeated style rules left from earlier looks and unused style names and text lines. Nothing on screen changed (checked by comparing every element's style on 80 screens before and after).

## Dates and shadows
- Vehicle details dates open in the same wide two-month window as home (one month on phones).
- Shadows use two sizes everywhere: one for cards and pills, one for pop-outs.
- The small search bar shown when scrolling on phones is a floating pill.

## One icon row
- Browse has one icon row: All, Cars & vans, Motorbikes, then the types for the chosen group. Tap a chosen type again to clear it.
- Listings rated 4.8 or more with 2+ reviews show a "Top rated" badge.
- The admin dashboard shows vehicles waiting for approval at the top.

## Phone search
- On phones the search is the same pill as on web (Pickup, Dates, Passengers, round search button).
- Scrolling down shrinks it to a small pill under the header. Tapping it opens the full pill in place over a dimmed list, without scrolling to the top. Search, the dimmed area or Esc closes it.

## Vehicle page bar
- Dates, price and Choose this vehicle are always together in one bar (top on web, bottom on phone). The separate Availability row was removed. Tap the dates in the bar to open the calendar.

## Resize fixes (web <-> phone)
Window ratio changes now keep everything in step: the "Anywhere" / "Town, airport or place" placeholder, the number of months in the home date pop-out and the vehicle date pop-out (2 on wide, 1 on narrow), and the floating search pill is released when you go back to web width. Checked with a resize fuzz at 13 widths, mouse and touch (0 issues).

## Cleanup (round 3)
Removed the old Availability-row handler, the old pill styles, unused icon/globe/chart styles and 24 unused text keys (EN and FIL). Checked with a 68-screen style snapshot (0 differences), all regression suites, the resize fuzz and a click-every-button audit on all roles (no dead buttons, no errors).

## Dark mode tweak
Dark header bar is now `#161618` and the search pill border `#29292D` (new tokens `--hdr` and `--pillb`; light mode unchanged).
