# Arkila backend setup (Supabase, free plan)

Nothing here goes live until you do these steps. About 15 minutes.

1. Go to supabase.com, sign up, New project (name: arkila, region: Singapore, set a database password and save it).
2. Left menu: SQL Editor > New query. Open `arkila-supabase.sql`, change `you@example.com` on the last line to the email you will log in to Admin with, paste everything, Run. It should say "Success".
3. Left menu: Authentication > Users > Add user > Create new user. Use that same email and a strong password. Tick "Auto Confirm User".
4. Authentication > Sign In / Providers (or Settings): turn OFF "Allow new users to sign up" so nobody else can create an account.
5. Project Settings > API: copy the Project URL and the `anon` public key.
6. In `config.js`, set `const SUPABASE={url:'<Project URL>',key:'<anon key>'};` and re-upload the site.
7. Open `admin.html`, sign in with the email and password from step 3.

The anon key is meant to be public. It can only add requests, check a renter's own request by its private code, and read approved vehicles. Names and phone numbers are readable only after Admin sign-in.

## What it does
- Requests from the website land in the database instantly. Admin sees them within 30 seconds, no import.
- Confirm, mark paid, decline, block dates, pause or add vehicles in Admin: the website and the renter's Requests page update by themselves.
- Works offline for renters: the request is kept on the phone and sent when the connection returns.

## Limits to know
- Messenger still needs the renter to tap Send (it cannot be automatic).
- Vehicle photos are stored inside the vehicle record, so keep them small. Real photos should later move to Supabase Storage.
- Owner sign-up stays locked in Phase 1.
- Free plan pauses a project after 7 days with no activity. Opening Admin counts as activity.
