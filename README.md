# Arkila Puerto Princesa

Static request site. No server, no login, nothing is stored. A guest picks a vehicle and dates, and the site builds a message to send to your Facebook page.

## Put it online with GitHub Pages
1. Create a new repository on GitHub (public).
2. Upload everything in this folder to the repository root (index.html, style.css, app.js, config.js, .nojekyll).
3. Repository Settings, then Pages. Under Source choose "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
4. After a minute the site is live at `https://<your-username>.github.io/<repository-name>/`.

## Edit without coding
Open `config.js` on GitHub (pencil icon) and change:
- `fbPage`: your Facebook page username. This turns on the Open Messenger button.
- `contact`: a mobile number to show guests.
- `isSample`: set to `false` once real vehicles are listed.
- `CARS`: one line per vehicle. Copy a line, change the name, price, area, seats, type and service. Use `active:false` to hide one. Each `id` must be unique.

## How a request reaches you
The guest copies the message and sends it to your page on Messenger. The last line (`Request ref: ...`) holds the vehicle, dates and phone, so the Arkila back office can turn a pasted message into a booking.
