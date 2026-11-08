/* ---- brand and contact: the footer, the Messenger button and the logo read from here ---- */
const BRAND={
  name:'Arkila',
  tagline:'Puerto Princesa',
  logo:'',       // path to a square logo image, e.g. 'logo.png' (upload it to the repo). Leave '' for the default car mark.
  fb:'',         // Facebook page username, e.g. 'arkilapuertoprincesa' (links to facebook.com/<name> and m.me/<name>)
  ig:'',         // Instagram username, e.g. 'arkila.pp'
  whatsapp:'',   // WhatsApp number with country code, digits only, e.g. '639171234567'
  email:'',      // contact email
  phone:''       // optional contact mobile, e.g. '0917 123 4567'
};
/* Phase 1: Arkila lists the vehicles and handles every booking on Messenger. Owner sign-up, the owner area, online deposits and payouts are locked.
   The code stays in the site. Set to false in Phase 2 to unlock it. */
const PHASE1=true;
const SETTINGS={
  damageCap:{car:50000,motor:30000}, // most a renter pays for damage in one rental (placeholder amounts: decide)
  deposit:{car:5000,motor:2000}, // refundable security deposit, paid online to Arkila and held until the return check (placeholder amounts: decide)
  extraHourRate:0.2, // each extra hour costs this share of the daily rate (placeholder: decide)
  maxExtraHours:4,   // more than this, book another day instead
  turnaroundHours:3, // break between two rentals of the same vehicle (cleaning, checks, fuel)
  commission:0.12,  // Arkila share of each trip total (shown on the admin screen)
  cancellation:"Free if you cancel 14 or more days before pickup. After that the owner may keep part of the rental fee: 20% from 7 to 13 days before, 50% from 2 to 6 days before, and up to 100% (at most 3 days' rental) with less than 48 hours' notice or if you do not show up. Your security deposit is always refunded.", // placeholder, matches the Terms draft. Edit to your real policy
  isSample:true     // set to false once real vehicles are listed, to hide the sample banner
};

/* ---- languages and currencies shown in the language menu ---- */
const LANGS=[['en','English'],['fil','Filipino']];
const CURRENCIES=[['PHP','Philippine peso'],['USD','US dollar'],['AUD','Australian dollar'],['EUR','Euro'],['GBP','British pound'],['KRW','South Korean won'],['JPY','Japanese yen'],['CNY','Chinese yuan'],['SGD','Singapore dollar'],['CAD','Canadian dollar']];
/* Units per 1 Philippine peso on 2 Nov 2026. The live site refreshes these automatically when it can. */
const RATES={PHP:1,USD:0.015698,AUD:0.02233,EUR:0.014068,GBP:0.011725,KRW:20.916605,JPY:2.474329,CNY:0.1047,SGD:0.020069,CAD:0.021939};
const RATEINFO={date:'2026-11-02'};

/* ---- map: centre of Puerto Princesa and the pickup areas (approximate, edit freely) ---- */
const CENTER=[9.7392,118.7353];
const AREAS={
  'Airport':[9.7421,118.7587],
  'City Proper':[9.7392,118.7353],
  'Baywalk':[9.7455,118.7343]
};
/* Pickup is limited to Puerto Princesa city (renters land here first, then head to Sabang, El Nido and the rest). Pins must be within this many km of CENTER. */
const PICKUP_KM=15;

/* ---- places shown in the Where search before anyone types (approximate centres, edit freely).
   Searching also finds any other place in Palawan online. n=name, s=line under it, p=[lat,lng] ---- */
const PLACES=[
  {n:'Puerto Princesa Airport',s:'Puerto Princesa, Palawan',p:[9.7421,118.7587]},
  {n:'El Nido',s:'Palawan',p:[11.1784,119.3939]},
  {n:'Coron',s:'Palawan',p:[11.9986,120.2043]},
  {n:'San Vicente',s:'Palawan',p:[10.5224,119.2793]},
  {n:'Port Barton',s:'San Vicente, Palawan',p:[10.4167,119.1500]},
  {n:'Sabang (Underground River)',s:'Puerto Princesa, Palawan',p:[10.1578,118.8369]},
  {n:'Taytay',s:'Palawan',p:[10.8267,119.5206]},
  {n:'Roxas',s:'Palawan',p:[10.3236,119.3431]},
  {n:'Narra',s:'Palawan',p:[9.2833,118.4167]},
  {n:'Puerto Princesa City',s:'Palawan',p:[9.7392,118.7353]}
];

/* ---- vehicles ----
   Each vehicle is a block you can copy. Fields to fill:
   id (unique, no spaces), name, type (Sedan, Hatchback, SUV, Van, Pickup), seats, service ('Self-drive' or 'With driver'),
   area (one of the AREAS above), price (per day, PHP), color, active (false hides it),
   description (1-2 sentences), specs (year, transmission, fuel, bags, aircon), features (list),
   images: a list of photo paths, e.g. ['photos/vios-1.jpg','photos/vios-2.jpg']. Leave [] to show sample illustrations. */
const CARS=[];  /* The site loads empty. Real vehicles come from the database. Sample vehicles live in testfleet.js and only appear when Test data is loaded. */


/* Dates a vehicle is not available (both days included). The Arkila team edits this list when an owner asks to block dates.
   Greyed out on the website for everyone. The two ranges below are samples: delete them any time. */
const BLOCKED={};

/* ---- "Before you book" box shown to renters. Edit the words freely. Leave deposit '' until you decide; renters then see that Arkila confirms it on Messenger. ---- */
const BOOKING_INFO={
  deposit:'',
  fuel:'Return the vehicle with the same fuel level you picked it up with.',
  licenceCar:"Valid driver's licence (bring the original). Foreign licences: bring your passport too.",
  licenceMotor:"Valid motorcycle licence (bring the original). Helmet provided.",
  cancel:'If your plans change, message us as early as you can. Full terms are in the renter notice (see the checkout).',
  pay:'You pay Arkila after we confirm on Messenger. Nothing is charged now.'
};

/* Trip planner: APPROXIMATE road distances from Puerto Princesa city. Edit freely.
   km = one way, h = driving hours, rough = rough final road, night = night activity,
   boat = island, no road (rental stays on Palawan), wharf = boat trip leaves from a wharf,
   permit = permit needed ahead, dir = N or S of the city (used to flag opposite directions) */
const DEST_INFO={
 'City tour':{km:10,h:.5},'Underground River (Sabang)':{km:80,h:2,wharf:1,permit:1,dir:'N'},'Honda Bay':{km:15,h:.5,wharf:1},'Nagtabon Beach':{km:25,h:1,rough:1},'Ugong Rock':{km:30,h:1},'Iwahig Firefly Watching':{km:25,h:.7,night:1},"Mitra's Ranch":{km:8,h:.3},"Baker's Hill":{km:7,h:.3},
 'Narra':{km:70,h:1.5,dir:'S'},'Quezon':{km:120,h:2.5,dir:'S'},"Brooke's Point":{km:180,h:4,dir:'S'},'Rizal':{km:215,h:4.5,dir:'S'},
 'Roxas':{km:130,h:3,dir:'N'},'San Vicente':{km:165,h:4,dir:'N'},'Port Barton':{km:180,h:4.5,rough:1,dir:'N'},'Taytay':{km:200,h:4.5,dir:'N'},'El Nido':{km:240,h:5.5,dir:'N'},
 'Coron':{boat:1},'Balabac':{boat:1},'Linapacan':{boat:1}};

/* Free request inbox (Google Sheet). Paste the web app link from arkila-request-script.gs here.
   Leave '' to keep requests in the browser only (test mode). */
const REQUEST_ENDPOINT='';

/* Backend (Supabase, free). After running arkila-supabase.sql, paste your Project URL and the public "anon" key here.
   Leave both '' for test mode (requests stay in the browser, or go to the Google Sheet if REQUEST_ENDPOINT is set). */
const SUPABASE={url:'https://uqiiowgidsjruwlviddm.supabase.co',key:'sb_publishable_foCsX8iSK2HwlXfVmlvECA_PTZc8nLg'};

/* Social login: set to true only after the provider is switched on in Supabase (Authentication > Providers). */
const SOCIAL={google:false,facebook:false};
