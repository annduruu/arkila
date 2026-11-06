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
  'Baywalk':[9.7455,118.7343],
  'Sabang':[10.1578,118.8369],
  'Honda Bay':[9.8097,118.7633],
  'Irawan':[9.7970,118.6820]
};

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
const CARS=[
  {id:'l-wigo',name:'Toyota Wigo',type:'Hatchback',seats:5,service:'Self-drive',area:'City Proper',price:1300,color:'#2E86DE',active:true,
   description:'Small, easy to park and light on fuel. A good pick for getting around the city and nearby beaches.\n\nA compact hatchback with air conditioning and room for two to three people with light bags. It is easy to drive in town traffic and cheap to run, so it suits short stays and budget trips. Pick it up, check it over with the owner, and keep to the fuel level you agreed.',
   specs:{year:2022,transmission:'Manual',fuel:'Gasoline',bags:2,aircon:'Yes'},
   features:['Air conditioning','Bluetooth audio','USB charging','Good for city driving'],images:[]},
  {id:'l-mirage',name:'Mitsubishi Mirage G4',type:'Sedan',seats:5,service:'Self-drive',area:'Honda Bay',price:1500,color:'#C0392B',active:true,
   description:'Compact sedan with a proper trunk. Comfortable for a couple or a small family on the road to Honda Bay.\n\nThe trunk takes proper luggage, and the air conditioning keeps the ride comfortable in the heat. A good choice for a few days of sightseeing around Puerto Princesa, with an easy, predictable drive on paved roads.',
   specs:{year:2021,transmission:'Automatic',fuel:'Gasoline',bags:3,aircon:'Yes'},
   features:['Air conditioning','Automatic','Large trunk','Rear camera'],images:[]},
  {id:'l-vios',name:'Toyota Vios',type:'Sedan',seats:5,service:'Self-drive',area:'Airport',price:1800,color:'#A9B3C0',active:true,
   description:'Reliable sedan, available at the airport. Smooth on the highway to the north.\n\nPickup at the airport saves you the trip into town. Good for couples and small families, with a steady ride on the long highway north and room for the bags from your flight.',
   specs:{year:2022,transmission:'Automatic',fuel:'Gasoline',bags:3,aircon:'Yes'},
   features:['Air conditioning','Automatic','Airport pickup','Bluetooth audio'],images:[]},
  {id:'l-hilux',name:'Toyota Hilux',type:'Pickup',seats:5,service:'Self-drive',area:'Irawan',price:3500,color:'#3E6B4E',active:true,
   description:'Tough pickup for rough roads and extra gear. Good for groups heading out of town.\n\nHigher ground clearance and four-wheel drive handle rough and unpaved roads better than a sedan. The open cargo bed carries dive gear, coolers and bags, so it suits groups heading out to the north or the south.',
   specs:{year:2020,transmission:'Manual',fuel:'Diesel',bags:5,aircon:'Yes'},
   features:['4x2 pickup','Open cargo bed','Air conditioning','Good ground clearance'],images:[]},
  {id:'l-innova',name:'Toyota Innova',type:'SUV',seats:7,service:'With driver',area:'Baywalk',price:4200,color:'#3B5B7A',active:true,
   description:'Seven seats with a driver who knows the area. Good for family tours and island-hopping days.\n\nThe driver handles the roads and the parking, so everyone can relax and enjoy the views. Tell the owner your route and hours before you book so the day runs on time, and ask about stops for meals.',
   specs:{year:2021,transmission:'Manual',fuel:'Diesel',bags:4,aircon:'Yes'},
   features:['Driver included','Seats 7','Air conditioning','Local tour knowledge'],images:[]},
  {id:'l-fortuner',name:'Toyota Fortuner',type:'SUV',seats:7,service:'With driver',area:'Sabang',price:6000,color:'#1F2933',active:true,
   description:'Comfortable SUV with a driver, based near Sabang for the Underground River trip.\n\nStarting near Sabang saves time on the early run to the Underground River. The driver knows the road and the boat schedule, and the SUV has air conditioning and space for the whole group.',
   specs:{year:2022,transmission:'Automatic',fuel:'Diesel',bags:4,aircon:'Yes'},
   features:['Driver included','Seats 7','Automatic','Leather seats'],images:[]},
  {id:'l-grandia',name:'Toyota Grandia',type:'Van',seats:10,service:'With driver',area:'City Proper',price:6000,color:'#7D8794',active:true,
   description:'Ten-seat van with a driver for small groups, airport runs and day tours.\n\nA good fit for family groups, friends or a small team. The driver and the van\'s air conditioning keep long days comfortable, and the owner can quote a fixed route if you ask in advance.',
   specs:{year:2021,transmission:'Automatic',fuel:'Diesel',bags:8,aircon:'Yes'},
   features:['Driver included','Seats 10','Rear air conditioning','Space for luggage'],images:[]},
  {id:'l-hiace',name:'Toyota Hiace Commuter',type:'Van',seats:12,service:'With driver',area:'Airport',price:5500,color:'#D6DBE2',active:true,
   description:'The largest option, for bigger groups and events. Driver and fuel to the agreed route are covered by the owner.\n\nA commuter van for up to twelve passengers. Agree the route, pickup times and any waiting hours with the owner before you book, so there are no surprises on the day.',
   specs:{year:2019,transmission:'Manual',fuel:'Diesel',bags:10,aircon:'Yes'},
   features:['Driver included','Seats 12','Air conditioning','Airport pickup'],images:[]}
];

/* Sample motorbikes (kind:'motor'). seats = riders. specs.deposit = refundable cash security deposit paid to the owner at pickup. Replace with real listings. */
CARS.push(
  {id:'m-click',kind:'motor',name:'Honda Click 125i',type:'Scooter',seats:2,service:'Self-drive',area:'City Proper',price:600,color:'#C0392B',active:true,
   description:'Light automatic scooter, easy for first-time riders. Good for the city, Baywalk and short beach runs.\n\nTwist-and-go riding with no gears to worry about. A helmet is included for each rider, and the seat is comfortable for short trips around town. Please wear your helmet at all times and keep to the speed limit.',
   specs:{year:2023,transmission:'Automatic',cc:125,fuel:'Gasoline',helmets:2,mileage:'150 km/day',deposit:2000},
   features:['Automatic','2 helmets included','Under-seat storage','Fuel efficient'],images:[]},
  {id:'m-mio',kind:'motor',name:'Yamaha Mio 125',type:'Scooter',seats:2,service:'Self-drive',area:'Airport',price:500,color:'#2E86DE',active:true,
   description:'Budget-friendly scooter with airport pickup. A simple way to get around town for a few days.\n\nPick it up at the airport and ride straight to your hotel. It is light, easy to park and very cheap on fuel, which makes it a good pick for a few relaxed days in the city.',
   specs:{year:2022,transmission:'Automatic',cc:125,fuel:'Gasoline',helmets:2,mileage:'150 km/day',deposit:2000},
   features:['Automatic','2 helmets included','Airport pickup','Phone holder'],images:[]},
  {id:'m-nmax',kind:'motor',name:'Yamaha NMAX 155',type:'Scooter',seats:2,service:'Self-drive',area:'Baywalk',price:900,color:'#1F2933',active:true,
   description:'Bigger, more stable scooter for longer rides and two people with bags.\n\nA larger frame and bigger wheels feel steadier on the highway, with enough room for two riders and a small bag. A good step up if you plan to ride out of the city.',
   specs:{year:2023,transmission:'Automatic',cc:155,fuel:'Gasoline',helmets:2,mileage:'200 km/day',deposit:3000},
   features:['Automatic','Comfortable for two','Large under-seat storage','2 helmets included'],images:[]},
  {id:'m-adv',kind:'motor',name:'Honda ADV 150',type:'Scooter',seats:2,service:'Self-drive',area:'Sabang',price:1000,color:'#3E6B4E',active:true,
   description:'Adventure-style scooter with higher ground clearance, based near Sabang for the north road.\n\nThe higher ride copes better with rough patches and speed bumps on the road to the Underground River. Check the tyres and brakes together at pickup and take photos of any marks.',
   specs:{year:2022,transmission:'Automatic',cc:150,fuel:'Gasoline',helmets:2,mileage:'200 km/day',deposit:3000},
   features:['Automatic','Higher ground clearance','2 helmets included','Good for rougher roads'],images:[]},
  {id:'m-sniper',kind:'motor',name:'Yamaha Sniper 150',type:'Underbone',seats:2,service:'Self-drive',area:'Irawan',price:700,color:'#A9B3C0',active:true,
   description:'Sporty underbone with manual-style gears. For riders who are comfortable shifting.\n\nQuick and light, but you need to be confident with a clutch-less manual shift. Ride within your skill level, especially on wet roads, and bring your motorcycle licence.',
   specs:{year:2021,transmission:'Semi-automatic',cc:150,fuel:'Gasoline',helmets:2,mileage:'150 km/day',deposit:2500},
   features:['Foot-shift gears','2 helmets included','Lightweight','Quick on city roads'],images:[]},
  {id:'m-loncin',kind:'motor',name:'Loncin RC Classic 250',type:'Mid-size',seats:2,service:'Self-drive',area:'City Proper',price:1400,color:'#7D8794',active:true,
   description:'Retro-style 250cc manual bike for longer rides. Experienced riders only.\n\nA 250cc engine suits longer day rides, but it needs a rider with real manual-bike experience. A valid motorcycle licence is required, and the owner may ask to see it at pickup.',
   specs:{year:2024,transmission:'Manual',cc:250,fuel:'Gasoline',helmets:2,mileage:'250 km/day',deposit:5000},
   features:['5-speed manual','2 helmets included','Side bags','Crash bars'],images:[]},
  {id:'m-himalayan',kind:'motor',name:'Royal Enfield Himalayan',type:'Big bike',seats:2,service:'Self-drive',area:'Airport',price:2500,color:'#D6DBE2',active:true,
   description:'Adventure tourer for long distances and rough roads. Experienced riders with a motorcycle licence only.\n\nBuilt for long days and rough roads, with a tall, upright seat and strong suspension. It is heavy and powerful, so it is for experienced riders only. Check the luggage rack, tyres and fuel with the owner at pickup.',
   specs:{year:2022,transmission:'Manual',cc:411,fuel:'Gasoline',helmets:2,mileage:'Unlimited',deposit:5000},
   features:['Adventure touring','2 helmets included','Luggage rack','Long-distance comfort'],images:[]}
);

/* Dates a vehicle is not available (both days included). The Arkila team edits this list when an owner asks to block dates.
   Greyed out on the website for everyone. The two ranges below are samples: delete them any time. */
const BLOCKED={
  'm-click':[['2026-11-12','2026-11-15'],['2026-11-24','2026-11-26']]
};
