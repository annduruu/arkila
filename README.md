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

## Adding real photos
1. In the repository, click Add file, then Create new file. Type `photos/vios-1.jpg` in the name box is not possible for images, so use Add file, then Upload files, and upload the photos into a folder called `photos`.
2. In `config.js`, set the vehicle's `images` list, for example `images:['photos/vios-1.jpg','photos/vios-2.jpg']`.
3. Photos should be JPG, under 500 KB each, landscape.

## Map
The pickup pin uses OpenStreetMap through Leaflet. Area coordinates in `config.js` are approximate. Adjust them if a pickup area is off.
