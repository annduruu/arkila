# Arkila Puerto Princesa

Static request site. No server, no login, nothing is stored. A guest picks a vehicle and dates, and the site builds a message to send to your Facebook page.

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
`seats` means riders, and `specs` holds `cc`, `helmets`, `mileage` and `deposit` (the refundable cash security deposit paid to the owner at pickup, separate from the 20% booking deposit).
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
