/* ---- settings the Arkila team edits ---- */
const SETTINGS={
  fbPage:'',        // your Facebook page username, e.g. 'arkilapuertoprincesa' (opens m.me/<name>)
  contact:'',       // optional mobile number shown to guests, e.g. '0917 123 4567'
  depositRate:0.20, // share of the total paid as deposit
  cancellation:'Free cancellation up to 48 hours before pickup. After that the deposit is not refunded.', // edit to your real policy
  commission:0.12,  // Arkila share of each trip total (shown on the admin screen)
  isSample:true     // set to false once real vehicles are listed, to hide the sample banner
};

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

/* ---- vehicles ----
   Each vehicle is a block you can copy. Fields to fill:
   id (unique, no spaces), name, type (Sedan, Hatchback, SUV, Van, Pickup), seats, service ('Self-drive' or 'With driver'),
   area (one of the AREAS above), price (per day, PHP), color, active (false hides it),
   description (1-2 sentences), specs (year, transmission, fuel, bags, aircon), features (list),
   images: a list of photo paths, e.g. ['photos/vios-1.jpg','photos/vios-2.jpg']. Leave [] to show sample illustrations. */
const CARS=[
  {id:'l-wigo',name:'Toyota Wigo',type:'Hatchback',seats:5,service:'Self-drive',area:'City Proper',price:1300,color:'#2E86DE',active:true,
   description:'Small, easy to park and light on fuel. A good pick for getting around the city and nearby beaches.',
   specs:{year:2022,transmission:'Manual',fuel:'Gasoline',bags:2,aircon:'Yes'},
   features:['Air conditioning','Bluetooth audio','USB charging','Good for city driving'],images:[]},
  {id:'l-mirage',name:'Mitsubishi Mirage G4',type:'Sedan',seats:5,service:'Self-drive',area:'Honda Bay',price:1500,color:'#C0392B',active:true,
   description:'Compact sedan with a proper trunk. Comfortable for a couple or a small family on the road to Honda Bay.',
   specs:{year:2021,transmission:'Automatic',fuel:'Gasoline',bags:3,aircon:'Yes'},
   features:['Air conditioning','Automatic','Large trunk','Rear camera'],images:[]},
  {id:'l-vios',name:'Toyota Vios',type:'Sedan',seats:5,service:'Self-drive',area:'Airport',price:1800,color:'#A9B3C0',active:true,
   description:'Reliable sedan, available at the airport. Smooth on the highway to the north.',
   specs:{year:2022,transmission:'Automatic',fuel:'Gasoline',bags:3,aircon:'Yes'},
   features:['Air conditioning','Automatic','Airport pickup','Bluetooth audio'],images:[]},
  {id:'l-hilux',name:'Toyota Hilux',type:'Pickup',seats:5,service:'Self-drive',area:'Irawan',price:3500,color:'#3E6B4E',active:true,
   description:'Tough pickup for rough roads and extra gear. Good for groups heading out of town.',
   specs:{year:2020,transmission:'Manual',fuel:'Diesel',bags:5,aircon:'Yes'},
   features:['4x2 pickup','Open cargo bed','Air conditioning','Good ground clearance'],images:[]},
  {id:'l-innova',name:'Toyota Innova',type:'SUV',seats:7,service:'With driver',area:'Baywalk',price:4200,color:'#3B5B7A',active:true,
   description:'Seven seats with a driver who knows the area. Good for family tours and island-hopping days.',
   specs:{year:2021,transmission:'Manual',fuel:'Diesel',bags:4,aircon:'Yes'},
   features:['Driver included','Seats 7','Air conditioning','Local tour knowledge'],images:[]},
  {id:'l-fortuner',name:'Toyota Fortuner',type:'SUV',seats:7,service:'With driver',area:'Sabang',price:6000,color:'#1F2933',active:true,
   description:'Comfortable SUV with a driver, based near Sabang for the Underground River trip.',
   specs:{year:2022,transmission:'Automatic',fuel:'Diesel',bags:4,aircon:'Yes'},
   features:['Driver included','Seats 7','Automatic','Leather seats'],images:[]},
  {id:'l-grandia',name:'Toyota Grandia',type:'Van',seats:10,service:'With driver',area:'City Proper',price:6000,color:'#7D8794',active:true,
   description:'Ten-seat van with a driver for small groups, airport runs and day tours.',
   specs:{year:2021,transmission:'Automatic',fuel:'Diesel',bags:8,aircon:'Yes'},
   features:['Driver included','Seats 10','Rear air conditioning','Space for luggage'],images:[]},
  {id:'l-hiace',name:'Toyota Hiace Commuter',type:'Van',seats:12,service:'With driver',area:'Airport',price:5500,color:'#D6DBE2',active:true,
   description:'The largest option, for bigger groups and events. Driver and fuel to the agreed route are covered by the owner.',
   specs:{year:2019,transmission:'Manual',fuel:'Diesel',bags:10,aircon:'Yes'},
   features:['Driver included','Seats 12','Air conditioning','Airport pickup'],images:[]}
];
