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
