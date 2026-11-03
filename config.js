/* ---- settings the Arkila team edits ---- */
const SETTINGS={
  fbPage:'',        // your Facebook page username, e.g. 'arkilapuertoprincesa' (opens m.me/<name>)
  contact:'',       // optional mobile number shown to guests, e.g. '0917 123 4567'
  depositRate:0.20, // share of the total paid as deposit
  isSample:true     // set to false once real vehicles are listed, to hide the sample banner
};
/* ---- vehicles: one line each. Set active:false to hide one. ---- */
const CARS=[
  {"id": "l-fortuner", "name": "Toyota Fortuner", "type": "SUV", "seats": 7, "service": "With driver", "area": "Sabang", "price": 6000, "color": "#1F2933", "active": true},
  {"id": "l-grandia", "name": "Toyota Grandia", "type": "Van", "seats": 10, "service": "With driver", "area": "City Proper", "price": 6000, "color": "#7D8794", "active": true},
  {"id": "l-hiace", "name": "Toyota Hiace Commuter", "type": "Van", "seats": 12, "service": "With driver", "area": "Airport", "price": 5500, "color": "#D6DBE2", "active": true},
  {"id": "l-hilux", "name": "Toyota Hilux", "type": "Pickup", "seats": 5, "service": "Self-drive", "area": "Irawan", "price": 3500, "color": "#3E6B4E", "active": true},
  {"id": "l-innova", "name": "Toyota Innova", "type": "SUV", "seats": 7, "service": "With driver", "area": "Baywalk", "price": 4200, "color": "#3B5B7A", "active": true},
  {"id": "l-mirage", "name": "Mitsubishi Mirage G4", "type": "Sedan", "seats": 5, "service": "Self-drive", "area": "Honda Bay", "price": 1500, "color": "#C0392B", "active": true},
  {"id": "l-vios", "name": "Toyota Vios", "type": "Sedan", "seats": 5, "service": "Self-drive", "area": "Airport", "price": 1800, "color": "#A9B3C0", "active": true},
  {"id": "l-wigo", "name": "Toyota Wigo", "type": "Hatchback", "seats": 5, "service": "Self-drive", "area": "City Proper", "price": 1300, "color": "#2E86DE", "active": true}
];
