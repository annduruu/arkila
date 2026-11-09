/* Demo data layer. Everything is saved in this browser only. A real backend (Supabase) replaces this file later. */
const mem={};
const lsg=(k,d)=>{const fb=()=>k in mem?mem[k]:d;try{const v=localStorage.getItem('arkila2-'+k);if(!v)return fb();const j=JSON.parse(v);if(Array.isArray(d)&&!Array.isArray(j))return fb();if(d&&typeof d==='object'&&!Array.isArray(d)&&(!j||typeof j!=='object'||Array.isArray(j)))return fb();return j}catch(e){return fb()}};
const lss=(k,v)=>{mem[k]=v;try{localStorage.setItem('arkila2-'+k,JSON.stringify(v));return true}catch(e){return false}};
const ST={users:lsg('users',[]),listings:lsg('listings',[]),requests:lsg('requests',[]),sid:lsg('sid',null),favs:lsg('favs',[]),reviews:lsg('reviews',[]),blocks:lsg('blocks',{}),
  save(){return [lss('users',this.users),lss('listings',this.listings),lss('requests',this.requests),lss('sid',this.sid),lss('favs',this.favs),lss('reviews',this.reviews),lss('blocks',this.blocks)].every(Boolean)},
  me(){return this.users.find(u=>u.id===this.sid)||null}};
if(!ST.blocks||typeof ST.blocks!=='object'||Array.isArray(ST.blocks))ST.blocks={};
/* safety: old or damaged saved data is tidied on load so a bad record can never blank the page. DATA_VER lets future updates upgrade old data. */
const DATA_VER=3;
(function(){const ok=x=>x&&typeof x==='object'&&!Array.isArray(x)&&x.id!=null;
  ST.users=(Array.isArray(ST.users)?ST.users:[]).filter(ok);ST.users.forEach(u=>{if(!Array.isArray(u.roles))u.roles=['guest'];u.name=String(u.name||'User')});
  ST.listings=(Array.isArray(ST.listings)?ST.listings:[]).filter(ok);ST.listings.forEach(l=>{l.name=String(l.name||'Vehicle');l.price=+l.price>0?+l.price:0;l.seats=+l.seats||1;if(!Array.isArray(l.pos)||l.pos.length<2||!isFinite(l.pos[0])||!isFinite(l.pos[1]))l.pos=[9.7392,118.7353]});
  ST.requests=(Array.isArray(ST.requests)?ST.requests:[]).filter(ok&&(x=>ok(x)&&x.from&&x.to));ST.requests.forEach(r=>{r.time=r.time||'';r.extraH=+r.extraH||0;r.extraFee=+r.extraFee||0;r.total=+r.total||0;r.deposit=+r.deposit||0;r.days=+r.days||1});
  ST.reviews=(Array.isArray(ST.reviews)?ST.reviews:[]).filter(x=>x&&typeof x==='object');ST.favs=Array.isArray(ST.favs)?ST.favs:[];
  /* self-heal: a published sample vehicle (S-) replaces its device-only test twin (T-) so nothing shows twice */
  (function(){const ids=new Set(ST.listings.map(l=>String(l.id)));const n=ST.listings.filter(l=>!(String(l.id).startsWith('T-')&&ids.has('S-'+String(l.id).slice(2))));if(n.length!==ST.listings.length){ST.listings=n;lss('listings',n)}})();
  if(lsg('ver',0)!==DATA_VER)lss('ver',DATA_VER)})();
/* if the page ever breaks, show a calm reload bar instead of a blank screen */
(function(){let shown=0;const bar=()=>{if(shown)return;shown=1;const d=document.createElement('div');d.setAttribute('role','alert');d.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;background:#1F2933;color:#fff;border-radius:14px;padding:12px 14px;display:flex;gap:12px;align-items:center;justify-content:space-between;font:15px system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.3)';d.innerHTML='<span>Something went wrong. Your saved data is safe.</span><button style="border:0;border-radius:10px;padding:8px 14px;font-weight:700;cursor:pointer" onclick="location.reload()">Reload</button>';(document.body||document.documentElement).appendChild(d)};
  addEventListener('error',e=>{if(e&&e.message&&!/ResizeObserver|Script error/.test(e.message))bar()});addEventListener('unhandledrejection',()=>bar())})();
const allCars=()=>[...CARS.filter(c=>!ST.listings.some(l=>l.id===c.id)).map(c=>Object.assign({ownerId:'sample',ownerName:'Arkila sample',status:'approved'},c)),...ST.listings];
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30);
const reviewsOf=c=>ST.reviews.filter(r=>r.carId===c.id);
const ratingOf=c=>{const r=reviewsOf(c);return r.length?{avg:r.reduce((s,x)=>s+x.rating,0)/r.length,n:r.length}:null};
const stars=n=>'★'.repeat(Math.round(n))+'☆'.repeat(5-Math.round(n));

/* ---- trip details helpers (shared by renter, admin, owner) ---- */
const _te=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const osmUrl=p=>'https://www.openstreetmap.org/?mlat='+(+p[0])+'&mlon='+(+p[1])+'#map=16/'+(+p[0])+'/'+(+p[1]);
const _okp=p=>Array.isArray(p)&&p.length===2&&p.every(n=>isFinite(n)&&n!==null&&n!=='');
const tripOf=x=>{x=x||{};return {addr:String(x.pickupAddr||''),pin:_okp(x.pPin)?x.pPin.map(Number):null,dest:(Array.isArray(x.dest)?x.dest:[]).map(String),dpins:(Array.isArray(x.dPins)?x.dPins:[]).filter(d=>d&&_okp(d.p)).map(d=>({n:String(d.n||'Pinned spot'),p:d.p.map(Number)})),note:String(x.tripNote||'')}};
const _dl=n=>(typeof DEST_INFO!=='undefined'&&DEST_INFO[n]&&DEST_INFO[n].boat)?'by boat: '+n:n;
const tripDest=x=>{const t=tripOf(x);return t.dest.map(_dl).concat(t.dpins.map(d=>d.n))};
const tripMsg=x=>{const t=tripOf(x),a=tripDest(x),o=[];if(t.addr)o.push('We will meet you at '+_te(t.addr)+'.');if(a.length)o.push('Trip: '+a.map(_te).join(', ')+'.');return o.length?' '+o.join(' '):''};
const tripBox=x=>{const t=tripOf(x),o=[],a=tripDest(x);
 if(t.addr||t.pin)o.push('<div><span>Pickup spot</span>'+_te(t.addr||'Pinned on the map')+(t.pin?' · <a href="'+osmUrl(t.pin)+'" target="_blank" rel="noopener">Open in map &#8599;</a>':'')+'</div>');
 if(a.length)o.push('<div><span>Going to</span>'+t.dest.map(_te).join(', ')+(t.dest.length&&t.dpins.length?', ':'')+t.dpins.map(d=>'<a href="'+osmUrl(d.p)+'" target="_blank" rel="noopener">'+_te(d.n)+' &#8599;</a>').join(', ')+'</div>');
 if(t.note)o.push('<div><span>Trip note</span>'+_te(t.note)+'</div>');return o.join('')};
const tripMsgRaw=x=>{const t=tripOf(x),a=tripDest(x),o=[];if(t.addr)o.push('We will meet you at '+t.addr+'.');if(a.length)o.push('Trip: '+a.join(', ')+'.');return o.length?' '+o.join(' '):''};
/* ---- Test data: loaded and removed by the admin only. Everything is stamped _test (ids start with T-), stays on this device, and is never sent to the live database (see the guards in db.js). ---- */
const TD={is:x=>!!(x&&(x._test||String(x.id||'').startsWith('T-'))),
 counts(){const r=ST.requests.filter(TD.is).length,u=ST.users.filter(TD.is).length,l=ST.listings.filter(TD.is).length,b=Object.keys(ST.blocks).filter(k=>k.startsWith('T-')).reduce((n,k)=>n+(ST.blocks[k]||[]).length,0);return {r,u,l,b,any:r+u+l+b>0}},
 unload(){ST.requests=ST.requests.filter(x=>!TD.is(x));ST.users=ST.users.filter(x=>!TD.is(x));ST.listings=ST.listings.filter(x=>!TD.is(x));ST.reviews=(ST.reviews||[]).filter(x=>!TD.is(x));Object.keys(ST.blocks).forEach(k=>{if(k.startsWith('T-'))delete ST.blocks[k]});lss('outbox',(lsg('outbox',[])||[]).filter(i=>!String(i).startsWith('T-')));if(String(ST.sid||'').startsWith('T-'))ST.sid=null;ST.save()},
 load(){TD.unload();(typeof TD_FLEET!=='undefined'&&!ST.listings.some(l=>String(l.id).startsWith('S-'))?TD_FLEET:[]).forEach(c=>ST.listings.push(Object.assign({},c,{id:'T-'+c.id,_test:true,status:'approved',ownerId:'arkila',ownerName:'Arkila (test)',pos:(typeof AREAS!=='undefined'&&AREAS[c.area]&&AREAS[c.area].length>1)?AREAS[c.area]:[9.7392,118.7353]})));const iso=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},now=Date.now();
  const cars=allCars().filter(c=>!TD.is(c)&&c.status==='approved'&&c.active!==false),pick=i=>cars[i%Math.max(cars.length,1)]||{id:'x',name:'Vehicle',price:1000,area:''};
  const ppl=[['Maria Santos','09171110001'],['Ken Ito','09171110002'],['Lea Cruz','09171110003'],['Paolo Reyes','09171110004'],['Anna Lim','09171110005'],['Joe Dela Cruz','09171110006'],['Mia Tan','09171110007'],['Sam Go','09171110008']];
  ST.users.push(...ppl.slice(0,3).map((p,i)=>({id:'T-u'+(i+1),name:'Test '+p[0],phone:p[1],provider:'test',roles:['guest'],createdAt:now,_test:true})),{id:'T-owner',name:'Test Owner',phone:'09179990000',provider:'test',roles:['guest','owner'],createdAt:now,_test:true});
  const plan=[[0,3,5,'new',0],[0,4,6,'new',0],[2,2,4,'new',0],[1,10,12,'confirmed',0],[3,1,3,'confirmed',1],[4,6,7,'declined',0],[5,-6,-4,'completed',1],[6,8,9,'cancelled',0]];
  const reqs=plan.map((q,i)=>{const c=pick(q[0]),p=ppl[i],days=Math.max(1,q[2]-q[1]),id='T-REQ-'+(9001+i);return {id,group:id,carId:c.id,carName:c.name,hostId:'arkila',hostName:'Arkila',guestId:i<3?'T-u'+(i+1):'T-g'+i,guestName:'Test '+p[0],guestPhone:p[1],guestEmail:'test'+(i+1)+'@example.com',from:iso(q[1]),to:iso(q[2]),time:'9:00 AM',extraH:0,extraFee:0,days,total:(+c.price||1000)*days,deposit:0,spot:c.area||'Airport',pickupAddr:'',dest:i%2?['El Nido']:['City tour'],notes:'',msg:'',status:q[3],reason:q[3]==='declined'?'Test reason: already booked on those dates.':'',paid:!!q[4],track:'T-trk-'+(i+1),updatedAt:now-i*3600e3,createdAt:now-i*3600e3,_test:true}});
  [[0,'new',20,22],[1,'confirmed',24,26]].forEach((q,k)=>{const id='T-REQ-'+(9101+k),p=ppl[k];reqs.push({id,group:id,carId:'T-L1',carName:'Test Suzuki Jimny',hostId:'T-owner',hostName:'Test Owner',guestId:'T-u'+(k+1),guestName:'Test '+p[0],guestPhone:p[1],guestEmail:'test'+(k+1)+'@example.com',from:iso(q[2]),to:iso(q[3]),time:'9:00 AM',extraH:0,extraFee:0,days:2,total:6400,deposit:0,spot:'City Proper',pickupAddr:'',dest:['City tour'],notes:'',msg:'',status:q[1],reason:'',paid:false,track:'T-trk-'+(20+k),updatedAt:now,createdAt:now-k*1000,_test:true})});
  ST.requests.unshift(...reqs);
  const pos=(typeof AREAS!=='undefined'&&AREAS['City Proper']&&AREAS['City Proper'].length>1)?AREAS['City Proper']:[9.7392,118.7353];
  ST.listings.push({id:'T-L1',name:'Test Suzuki Jimny',type:'SUV',seats:4,service:'Self-drive',area:'City Proper',price:3200,color:'#2E86DE',active:true,delivery:false,description:'Test listing, approved.',specs:{transmission:'Manual',fuel:'Gasoline',year:2020},features:['Air conditioning'],images:[],ownerId:'T-owner',ownerName:'Test Owner',status:'approved',pos,_test:true},{id:'T-L2',name:'Test Honda Beat',type:'Scooter',seats:2,service:'Self-drive',area:'Airport',price:500,color:'#C0392B',active:true,delivery:false,description:'Test listing, waiting for approval.',specs:{transmission:'Automatic',fuel:'Gasoline',year:2022},features:[],images:[],ownerId:'T-owner',ownerName:'Test Owner',status:'pending',kind:'motor',pos,_test:true});
  ST.blocks['T-L1']=[iso(14),iso(15),iso(16)];ST.blocks['T-m-click']=[iso(9),iso(10),iso(11),iso(12),iso(24),iso(25)];ST.save()}};

/* Test data control shared by the renter site and the owner page: a small footer link plus a bar while test data is loaded. Admin has its own box. */
TD.mount=function(host){try{const on=TD.counts().any;
 if(on&&!document.getElementById('tdb')){const b=document.createElement('div');b.id='tdb';b.setAttribute('role','status');b.style.cssText='position:relative;z-index:5;background:#FFF4D6;color:#6B4A00;border-bottom:1px solid #F0D58A;padding:8px 14px;display:flex;gap:12px;align-items:center;justify-content:center;font:600 13px system-ui,sans-serif';b.innerHTML='<span>Test renters and bookings are loaded (this device only)</span><button type="button" style="border:1px solid #D8B24C;background:#fff;color:#6B4A00;border-radius:999px;padding:4px 12px;font:700 12px system-ui,sans-serif;cursor:pointer">Remove</button>';b.querySelector('button').onclick=()=>{TD.unload();location.reload()};document.body.prepend(b)}
 if(host&&!host.querySelector('.tdl')){const p=document.createElement('p');p.className='tdl';p.style.cssText='margin:10px 0 0;font-size:12px;opacity:.7';const a=document.createElement('a');a.href='#';a.style.cssText='color:inherit;text-decoration:underline';a.textContent=on?'Remove test data':'Load test data';a.onclick=e=>{e.preventDefault();on?TD.unload():TD.load();location.reload()};p.appendChild(a);host.appendChild(p)}}catch(e){}};
