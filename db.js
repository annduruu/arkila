/* DATA SHELL. Today everything is saved in this browser (store.js).
   When you are ready for a shared database (Supabase or Firebase), only THIS file changes:
   1. set DB.mode='remote' and fill DB.cfg
   2. implement pullAll / pushRequest / pushListing / pushBlocks below
   The pages already call these hooks after every save, so nothing else needs to change.

   Example for Supabase (REST, no library needed):
     const H={apikey:DB.cfg.key,Authorization:'Bearer '+DB.cfg.key,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'};
     pushRequest:r=>fetch(DB.cfg.url+'/rest/v1/requests',{method:'POST',headers:H,body:JSON.stringify({id:r.id,data:r})})
     pullAll:async()=>{const j=await (await fetch(DB.cfg.url+'/rest/v1/requests?select=data',{headers:H})).json();ST.requests=j.map(x=>x.data);ST.save();return true}
   Tables: requests(id text primary key, data jsonb), listings(id text primary key, data jsonb), blocks(car_id text primary key, data jsonb).
   Also turn on row-level security so only signed-in staff can read all requests. */
const DB={
  mode:'local',          // 'local' = this browser only, 'remote' = shared database
  cfg:{url:'',key:''},   // project URL and public (anon) key
  pullAll:async()=>false,   // load shared data into ST. Return true if anything changed.
  pushRequest:r=>{},        // called after a request is created or changed
  pushListing:l=>{},        // called after a vehicle is added or changed
  pushBlocks:(id,days)=>{}  // called after blocked days change
};
