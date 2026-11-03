/* Login, host, trips and admin screens. Demo only: no real Facebook or Google yet. */
const ROUTES=['home','saved','host','trips','admin'];
const STATUS={new:['Requested','w'],confirmed:['Deposit received','b'],completed:['Completed','g'],cancelled:['Cancelled','r'],pending:['Waiting for approval','w'],approved:['Live','g'],rejected:['Not approved','r'],paused:['Paused','']};
const pill=k=>{const s=STATUS[k]||[k,''];return `<span class="pill ${s[1]}">${esc(t('st.'+k)===('st.'+k)?s[0]:t('st.'+k))}</span>`};
const has=(u,r)=>!!(u&&u.roles.includes(r));
const first=n=>String(n||'').split(' ')[0];

/* ---- requests ---- */
function saveRequest(q,name,phone,notes,spot,msg){
  const me=ST.me();let id;do{id='REQ-'+(1000+Math.floor(Math.random()*9000))}while(ST.requests.some(r=>r.id===id));
  const r={id,carId:q.c.id,carName:q.c.name,hostId:q.c.ownerId,hostName:q.c.ownerName,guestId:me.id,guestName:name,guestPhone:phone,from:q.a,to:q.b,days:q.d,total:q.total,deposit:q.dep,spot,notes,msg,status:'new',createdAt:Date.now()};
  ST.requests.unshift(r);ST.save();renderNav();return r;
}
const setReq=(id,status)=>{const r=ST.requests.find(x=>x.id===id);if(r){r.status=status;ST.save()}};

/* ---- nav ---- */
function renderNav(){
  const me=ST.me(),h=location.hash.slice(1)||'home',on=k=>h===k?' class="on"':'';
  const myTrips=me?ST.requests.filter(r=>r.guestId===me.id).length:0;
  $('#nav').innerHTML=`<a href="#home"${on('home')}>${esc(t('nav.rent'))}</a><a href="#saved"${on('saved')}>${esc(t('nav.saved'))}${ST.favs.length?`<b>${ST.favs.length}</b>`:''}</a>`+(me?`<a href="#trips"${on('trips')}>${esc(t('nav.trips'))}${myTrips?`<b>${myTrips}</b>`:''}</a><a href="#host"${on('host')}>${esc(has(me,'host')?t('nav.host'):t('nav.become'))}</a>`:'')+(has(me,'admin')?`<a href="#admin"${on('admin')}>${esc(t('nav.admin'))}</a>`:'')+(me?`<button type="button" class="chip" data-logout title="${esc(t('nav.logout'))}">${esc(first(me.name))} · ${esc(t('nav.logout'))}</button>`:`<button type="button" class="chip on" data-login>${esc(t('nav.login'))}</button>`);
  const sb=$('#setbtn');if(sb)sb.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="vertical-align:-3px"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="2"/></svg> ${PREF.lang.toUpperCase()} · ${PREF.cur}`;
}

/* ---- login ---- */
const ldlg=$('#ldlg');
function openLogin(msg){
  $('#lbody').innerHTML=`<h2 id="ltitle">${esc(t('l.title'))}</h2><p class="note" style="margin:6px 0 0">${esc(msg||t('l.sub'))}</p>
  <div class="banner" style="margin:12px 0">${esc(t('l.demo'))}</div>
  <div class="form"><label><span class="lab">${esc(t('l.name'))}</span><input id="lname" autocomplete="name" placeholder="Juan Dela Cruz"></label>
  <div class="rolepick" role="radiogroup"><label class="rp"><input type="radio" name="lrole" value="guest" checked><span><b>${esc(t('l.rent'))}</b><small>${esc(t('l.rents'))}</small></span></label><label class="rp"><input type="radio" name="lrole" value="host"><span><b>${esc(t('l.list'))}</b><small>${esc(t('l.lists'))}</small></span></label></div>
  <p class="err" id="lerr" role="alert"></p>
  <button type="button" class="btn" data-lgo="facebook">${esc(t('l.fb'))}</button><button type="button" class="btn ghost" data-lgo="google">${esc(t('l.g'))}</button>
  <button type="button" class="chip" data-lgo="admin" style="justify-self:start">${esc(t('l.admin'))}</button></div>`;
  if(!ldlg.open)ldlg.showModal();
}
function doLogin(provider){
  let name=$('#lname').value.trim();const wantHost=(document.querySelector('input[name="lrole"]:checked')||{}).value==='host';
  if(provider==='admin'&&!name)name='Arkila Admin';
  if(name.length<2){$('#lerr').textContent=t('l.err');return}
  const id=(provider==='admin'?'admin':provider)+':'+slug(name);let u=ST.users.find(x=>x.id===id);
  if(!u){u={id,name,provider,roles:['guest'],createdAt:Date.now()};ST.users.push(u)}
  if(provider==='admin'&&!has(u,'admin'))u.roles.push('admin');
  if(wantHost&&!has(u,'host'))u.roles.push('host');
  ST.sid=id;ST.save();$('#name').value=(provider==='admin'?'':name);ldlg.close();renderNav();toast(t('l.in',{n:first(name)}));
  if(wantHost)location.hash='host';else if(provider==='admin')location.hash='admin';else route();
  refreshHome();
}
ldlg.addEventListener('click',e=>{if(e.target===ldlg||e.target.closest('[data-lclose]'))ldlg.close();const g=e.target.closest('[data-lgo]');if(g)doLogin(g.dataset.lgo)});

/* ---- host ---- */
const HF={photos:[],err:''};
const COLORS=[['#A9B3C0','Silver'],['#1F2933','Black'],['#D6DBE2','White'],['#2E86DE','Blue'],['#C0392B','Red'],['#3E6B4E','Green'],['#7D8794','Grey']];
function readImg(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const sc=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.72))};im.onerror=rej;im.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}
function renderHost(){
  const me=ST.me(),el=$('#v-host');
  if(!has(me,'host')){el.innerHTML=`<h1>Earn from your vehicle</h1><p class="lead">List a car or van. Arkila finds the renter, collects the deposit and sends you the guest contact once the deposit is in. You are paid by the guest at pickup.</p><button class="btn" data-becomehost>Become a host</button>`;return}
  const mine=ST.listings.filter(l=>l.ownerId===me.id),reqs=ST.requests.filter(r=>r.hostId===me.id);
  el.innerHTML=`<h1>Host dashboard</h1><p class="lead">New vehicles are checked by the Arkila team before guests can see them.</p>
  <section class="step"><h2>Your vehicles</h2>${mine.length?mine.map(l=>{const k=l.status==='approved'&&l.active===false?'paused':l.status;return `<div class="lrow"><div class="lthumb">${imgsOf(l)[0]}</div><div class="lmain"><b>${esc(l.name)}</b> ${pill(k)}<p class="sub">${esc(l.type)} · ${l.seats} seats · ${esc(l.service)} · ${esc(l.area)} · ${php(l.price)}/day</p></div><div class="row2" style="gap:6px"><button class="chip" data-open="${esc(l.id)}">View</button>${l.status==='approved'?`<button class="chip" data-hpause="${esc(l.id)}">${l.active===false?'Resume':'Pause'}</button>`:''}<button class="chip" data-hdel="${esc(l.id)}">Delete</button></div></div>`}).join(''):'<div class="empty">No vehicles yet. Add your first one below.</div>'}</section>
  <section class="step"><h2>Add a vehicle</h2><form class="form" id="hf" novalidate>
    <label><span class="lab">Vehicle name</span><input id="hn" placeholder="Toyota Vios 2021"></label>
    <div class="f2"><label><span class="lab">Type</span><select id="ht">${['Sedan','Hatchback','SUV','Van','Pickup'].map(t=>`<option>${t}</option>`).join('')}</select></label>
    <label><span class="lab">Seats</span><input id="hs" type="number" min="1" max="20" value="5"></label></div>
    <div class="f2"><label><span class="lab">Service</span><select id="hv"><option>Self-drive</option><option>With driver</option></select></label>
    <label><span class="lab">Pickup area</span><select id="ha">${Object.keys(AREAS).map(a=>`<option>${esc(a)}</option>`).join('')}</select></label></div>
    <div class="f2"><label><span class="lab">Price per day (PHP)</span><input id="hp" type="number" min="300" step="50" placeholder="1800"></label>
    <label><span class="lab">Color</span><select id="hc">${COLORS.map(c=>`<option value="${c[0]}">${c[1]}</option>`).join('')}</select></label></div>
    <label><span class="lab">Short description</span><input id="hd" maxlength="200" placeholder="One or two sentences guests will read"></label>
    <div class="f2"><label><span class="lab">Year</span><input id="hy" type="number" min="1995" max="2030" value="2021"></label>
    <label><span class="lab">Luggage (bags)</span><input id="hb" type="number" min="0" max="20" value="3"></label></div>
    <div class="f2"><label><span class="lab">Transmission</span><select id="hm"><option>Automatic</option><option>Manual</option></select></label>
    <label><span class="lab">Fuel</span><select id="hfu"><option>Gasoline</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></label></div>
    <label><span class="lab">Features (separate with commas)</span><input id="hft" placeholder="Air conditioning, Bluetooth audio, USB charging"></label>
    <label><span class="lab">Photos (up to 4)</span><input id="hph" type="file" accept="image/*" multiple></label>
    <div class="thumbs" id="hthumbs"></div>
    <p class="err" id="herr" role="alert"></p><button class="btn" type="submit">Submit for approval</button></form></section>
  <section class="step"><h2>Requests for your vehicles</h2>${reqs.length?reqs.map(r=>`<div class="lrow"><div class="lmain"><b>${esc(r.carName)}</b> ${pill(r.status)}<p class="sub">${fmt(r.from)} to ${fmt(r.to)} · ${r.days} day${r.days>1?'s':''} · ${php(r.total)} · ${esc(r.id)}</p><p class="sub">Guest: ${esc(first(r.guestName))}${(r.status==='confirmed'||r.status==='completed')?` · ${esc(r.guestPhone)}`:' · contact shared once the deposit is received'}</p></div></div>`).join(''):'<div class="empty">No requests yet.</div>'}</section>`;
  renderHthumbs();
}
function renderHthumbs(){const t=$('#hthumbs');if(t)t.innerHTML=HF.photos.map((p,i)=>`<div class="th on" style="position:relative"><img src="${p}" alt="Photo ${i+1}"><button type="button" class="chip" data-hrm="${i}" style="position:absolute;right:2px;top:2px;padding:0 7px">×</button></div>`).join('')}
async function addHostListing(){
  const me=ST.me(),v=id=>$('#'+id).value.trim(),err=$('#herr');err.textContent='';
  const name=v('hn'),price=+v('hp'),seats=+v('hs');
  if(name.length<3){err.textContent='Add the vehicle name.';return}
  if(!(price>=300)){err.textContent='Enter a price per day, at least ₱300.';return}
  if(!(seats>=1)){err.textContent='Enter the number of seats.';return}
  const l={id:'u-'+Date.now().toString(36),name,type:v('ht'),seats,service:v('hv'),area:v('ha'),price,color:v('hc'),active:true,description:v('hd'),
    specs:{year:+v('hy')||'',transmission:v('hm'),fuel:v('hfu'),bags:+v('hb')||0,aircon:'Yes'},features:v('hft').split(',').map(s=>s.trim()).filter(Boolean),images:HF.photos.slice(),
    ownerId:me.id,ownerName:me.name,status:'pending',createdAt:Date.now()};
  ST.listings.unshift(l);
  if(!ST.save()){ST.listings.shift();err.textContent='This device is out of storage for photos. Remove a photo or two and try again.';return}
  HF.photos=[];toast('Submitted. The Arkila team will review it.');renderHost();
}
$('#v-host').addEventListener('click',e=>{
  const b=e.target.closest('[data-becomehost],[data-hpause],[data-hdel],[data-hrm]');if(!b)return;const me=ST.me();
  if(b.dataset.becomehost!==undefined){if(!has(me,'host'))me.roles.push('host');ST.save();renderNav();renderHost()}
  else if(b.dataset.hpause){const l=ST.listings.find(x=>x.id===b.dataset.hpause&&x.ownerId===me.id);if(l){l.active=l.active===false;ST.save();renderHost();refreshHome()}}
  else if(b.dataset.hdel){if(b.dataset.armed){ST.listings=ST.listings.filter(x=>!(x.id===b.dataset.hdel&&x.ownerId===me.id));ST.save();renderHost();refreshHome()}else{b.dataset.armed='1';b.textContent='Tap again to delete'}}
  else if(b.dataset.hrm!==undefined){HF.photos.splice(+b.dataset.hrm,1);renderHthumbs()}
});
$('#v-host').addEventListener('submit',e=>{if(e.target.id==='hf'){e.preventDefault();addHostListing()}});
$('#v-host').addEventListener('change',async e=>{
  if(e.target.id!=='hph')return;const files=[...e.target.files].slice(0,4-HF.photos.length);
  for(const f of files){try{HF.photos.push(await readImg(f))}catch(x){toast('Could not read that photo.')}}
  e.target.value='';renderHthumbs();
});

/* ---- guest trips ---- */
function renderTrips(){
  const me=ST.me(),mine=ST.requests.filter(r=>r.guestId===me.id);
  $('#v-trips').innerHTML=`<h1>${esc(t('tr.t'))}</h1><p class="lead">${esc(t('tr.lead'))}</p>`+(mine.length?mine.map(r=>`<section class="step"><div class="row2"><h2>${esc(r.carName)}</h2>${pill(r.status)}</div><p class="sub" style="margin:0">${fmt(r.from)} → ${fmt(r.to)} · ${esc(t('q.line',{p:'',d:r.days}).replace(/^\s*×\s*/,'× '))} · ${esc(r.id)}</p>
    <div class="q"><div><span>${esc(t('tr.total'))}</span><span>${esc(money(r.total))}</span></div><div><span>${esc(t('tr.dep'))}</span><span>${esc(money(r.deposit))}</span></div><div class="t"><span>${esc(t('tr.pay'))}</span><span>${esc(money(r.total-r.deposit))}</span></div></div>
    ${r.status==='new'?`<p class="note">${esc(t('tr.send'))}</p><div class="stack"><button class="btn ghost" data-copyreq="${esc(r.id)}">${esc(t('tr.copy'))}</button></div>`:''}
    ${r.status==='completed'?(ST.reviews.some(x=>x.reqId===r.id)?`<p class="note">${esc(t('rv.thanks'))}</p>`:`<form class="form" data-rvf="${esc(r.id)}"><span class="lab">${esc(t('rv.q'))}</span><select name="rating">${[5,4,3,2,1].map(n=>`<option value="${n}">${esc(t('rv.'+n))}</option>`).join('')}</select><input name="text" maxlength="200" placeholder="${esc(t('rv.ph'))}"><button class="btn" type="submit">${esc(t('rv.post'))}</button></form>`):''}
    ${r.status==='confirmed'?`<div class="ok" style="background:color-mix(in srgb,var(--good) 12%,var(--surface));border:1px solid var(--good);border-radius:12px;padding:10px 14px">${esc(t('tr.ok',{phone:r.guestPhone}))}</div>`:''}</section>`).join(''):'<div class="empty">'+esc(t('tr.empty'))+'</div>');
}
$('#v-trips').addEventListener('submit',e=>{const f=e.target.closest('[data-rvf]');if(!f)return;e.preventDefault();const r=ST.requests.find(x=>x.id===f.dataset.rvf),me=ST.me();if(!r||!me||r.guestId!==me.id||r.status!=='completed')return;const text=f.elements.text.value.trim();if(text.length<3){toast(t('rv.short'));return}
  ST.reviews.push({id:'rv-'+Date.now().toString(36),carId:r.carId,reqId:r.id,guestId:me.id,guestName:me.name,rating:+f.elements.rating.value,text,createdAt:Date.now()});ST.save();toast(t('rv.posted'));renderTrips()});
$('#v-trips').addEventListener('click',e=>{const b=e.target.closest('[data-copyreq]');if(!b)return;const r=ST.requests.find(x=>x.id===b.dataset.copyreq);if(!r)return;
  (navigator.clipboard?navigator.clipboard.writeText(r.msg):Promise.reject()).then(()=>toast(t('copied'))).catch(()=>toast(t('copyfail')))});

/* ---- admin ---- */
function renderAdmin(){
  const pend=ST.listings.filter(l=>l.status==='pending'),rs=ST.requests,booked=rs.filter(r=>r.status==='confirmed'||r.status==='completed');
  const val=booked.reduce((s,r)=>s+r.total,0);
  $('#v-admin').innerHTML=`<h1>Arkila team</h1><p class="lead">Approve vehicles and move requests along. Demo screen: anyone can open it in this version.</p>
  <div class="stats"><div class="stat"><span>Waiting approval</span><b>${pend.length}</b></div><div class="stat"><span>Requests</span><b>${rs.length}</b></div><div class="stat"><span>Deposits received</span><b>${booked.length}</b></div><div class="stat"><span>Commission (${Math.round(SETTINGS.commission*100)}%)</span><b>${php(val*SETTINGS.commission)}</b></div></div>
  <section class="step"><h2>Vehicles waiting for approval</h2>${pend.length?pend.map(l=>`<div class="lrow"><div class="lthumb">${imgsOf(l)[0]}</div><div class="lmain"><b>${esc(l.name)}</b><p class="sub">${esc(l.type)} · ${l.seats} seats · ${esc(l.area)} · ${php(l.price)}/day · host ${esc(l.ownerName)}</p></div><div class="row2" style="gap:6px"><button class="chip" data-open="${esc(l.id)}">View</button><button class="chip on" data-lapp="${esc(l.id)}">Approve</button><button class="chip" data-lrej="${esc(l.id)}">Reject</button></div></div>`).join(''):'<div class="empty">Nothing waiting.</div>'}</section>
  <section class="step"><h2>All requests</h2>${rs.length?rs.map(r=>`<div class="lrow"><div class="lmain"><b>${esc(r.carName)}</b> ${pill(r.status)}<p class="sub">${esc(r.id)} · ${fmt(r.from)} to ${fmt(r.to)} · ${php(r.total)} · deposit ${php(r.deposit)}</p><p class="sub">Guest ${esc(r.guestName)} ${esc(r.guestPhone)} · host ${esc(r.hostName)}${r.spot&&r.spot!=='not set'?' · pickup '+esc(r.spot.split(',')[0]):''}</p></div><div class="row2" style="gap:6px">${r.status==='new'?`<button class="chip on" data-rset="${esc(r.id)}|confirmed">Deposit received</button>`:''}${r.status==='confirmed'?`<button class="chip on" data-rset="${esc(r.id)}|completed">Mark completed</button>`:''}${(r.status==='new'||r.status==='confirmed')?`<button class="chip" data-rset="${esc(r.id)}|cancelled">Cancel</button>`:''}</div></div>`).join(''):'<div class="empty">No requests yet.</div>'}</section>`;
}
$('#v-admin').addEventListener('click',e=>{
  const a=e.target.closest('[data-lapp],[data-lrej],[data-rset]');if(!a)return;
  if(a.dataset.lapp||a.dataset.lrej){const l=ST.listings.find(x=>x.id===(a.dataset.lapp||a.dataset.lrej));if(l){l.status=a.dataset.lapp?'approved':'rejected';ST.save();toast(a.dataset.lapp?'Approved. It is now live.':'Rejected.')}}
  else{const [id,st]=a.dataset.rset.split('|');setReq(id,st)}
  renderAdmin();refreshHome();
});

/* ---- saved ---- */
function renderSaved(){
  const list=allCars().filter(c=>ST.favs.includes(c.id)&&c.status==='approved'&&c.active!==false);
  $('#v-saved').innerHTML=`<h1>${esc(t('sv.t'))}</h1><p class="lead">${esc(t('sv.lead'))}</p>`+(list.length?`<div class="grid">${list.map(cardHtml).join('')}</div>`:'<div class="empty">'+esc(t('sv.empty'))+'</div>');
}
function toggleFav(id){const i=ST.favs.indexOf(id);if(i>=0)ST.favs.splice(i,1);else ST.favs.push(id);ST.save();renderNav();const h=location.hash.slice(1);if(h==='saved')renderSaved();else refreshHome();if(dlg.open&&S.gid===id)openDetail(id)}

/* ---- shared ---- */
document.addEventListener('click',e=>{
  const fv=e.target.closest('[data-fav]');
  if(fv){toggleFav(fv.dataset.fav);return}
  if(e.target.closest('[data-login]'))openLogin();
  else if(e.target.closest('[data-logout]')){ST.sid=null;ST.save();$('#name').value='';$('#phone').value='';renderNav();toast(t('l.out'));if(location.hash.slice(1)!=='home')location.hash='home';else route()}
});
function route(){
  const h=location.hash.slice(1),v=ROUTES.includes(h)?h:'home',me=ST.me();
  if(v!=='home'&&v!=='saved'&&!me){history.replaceState(null,'','#home');openLogin(t('l.need'));return route()}
  if(v==='admin'&&!has(me,'admin')){location.hash='home';return}
  ROUTES.forEach(r=>{$('#v-'+r).hidden=r!==v});
  if(v==='home')refreshHome();else if(v==='saved')renderSaved();else if(v==='host')renderHost();else if(v==='trips')renderTrips();else renderAdmin();
  renderNav();window.scrollTo(0,0);
}
addEventListener('hashchange',route);

/* ---- theme: auto follows the device, light and dark override it ---- */
const THEMES=['auto','light','dark'];
let THEME=lsg('theme','auto');if(!THEMES.includes(THEME))THEME='auto';
function applyTheme(){
  const r=document.documentElement;if(THEME==='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',THEME);
  const b=$('#thbtn');if(!b)return;
  const dark=THEME==='dark'||(THEME==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);
  b.innerHTML=(dark?'<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 14.5A8 8 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>')+' <span class="thl">'+esc(t('theme.'+THEME))+'</span>';
  b.setAttribute('aria-label',t('theme')+': '+t('theme.'+THEME));
}
function setTheme(x){THEME=x;lss('theme',x);applyTheme()}
document.addEventListener('click',e=>{if(e.target.closest('#thbtn'))setTheme(THEMES[(THEMES.indexOf(THEME)+1)%3])});
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(THEME==='auto')applyTheme()})}catch(x){}

/* ---- language, currency, footer ---- */
const sdlg=$('#sdlg');
function openSettings(){
  $('#sbody').innerHTML=`<h2 id="stitle">${esc(t('set.t'))}</h2>
  <h3 class="h3">${esc(t('set.lang'))}</h3><div class="chips" role="radiogroup">${LANGS.map(l=>`<button type="button" class="chip" data-lang="${l[0]}" aria-pressed="${PREF.lang===l[0]}">${esc(l[1])}</button>`).join('')}</div>
  <h3 class="h3">${esc(t('set.cur'))}</h3><div class="chips" role="radiogroup">${CURRENCIES.map(c=>`<button type="button" class="chip" data-cur="${c[0]}" aria-pressed="${PREF.cur===c[0]}">${esc(c[0])} <small style="opacity:.7">${esc(c[1])}</small></button>`).join('')}</div>
  <h3 class="h3">${esc(t('theme'))}</h3><div class="chips" role="radiogroup">${THEMES.map(x=>`<button type="button" class="chip" data-theme-set="${x}" aria-pressed="${THEME===x}">${esc(t('theme.'+x))}</button>`).join('')}</div>
  <p class="note">${esc(t('set.note'))} ${esc(t('set.rates',{d:RATEINFO.date}))}</p>`;
  if(!sdlg.open)sdlg.showModal();
}
sdlg.addEventListener('click',e=>{
  if(e.target===sdlg||e.target.closest('[data-sclose]')){sdlg.close();return}
  const l=e.target.closest('[data-lang]'),c=e.target.closest('[data-cur]'),th=e.target.closest('[data-theme-set]');
  if(th){setTheme(th.dataset.themeSet);openSettings()}
  else if(l){PREF.lang=l.dataset.lang;lss('lang',PREF.lang);refreshAll();openSettings()}
  else if(c){PREF.cur=c.dataset.cur;lss('cur',PREF.cur);refreshAll();openSettings()}
});
document.addEventListener('click',e=>{if(e.target.closest('[data-setopen]'))openSettings()});
const ICON={
  fb:'<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-1 .4-1.7 1.8-1.7H17V3.8c-.3 0-1.3-.2-2.5-.2-2.6 0-4.3 1.6-4.3 4.4v2.5H7.3v3.3h2.9V22z"/></svg>',
  ig:'<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>',
  wa:'<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 20l1.2-4A8 8 0 1 1 8.2 19z"/><path fill="currentColor" d="M9 8.5c.2 2.6 3.9 6.3 6.5 6.5l1.1-1.3-2-1-.9.7c-1-.4-2-1.4-2.4-2.4l.7-.9-1-2z"/></svg>',
  mail:'<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
};
function renderBrand(){
  document.title=BRAND.name+' '+BRAND.tagline;
  const mark=$('.hwrap .top i');
  if(BRAND.logo&&mark){mark.style.background='none';mark.innerHTML=`<img src="${esc(BRAND.logo)}" alt="" style="width:30px;height:30px;border-radius:9px;object-fit:cover">`}
  const nm=document.querySelector('.hwrap .top span');if(nm)nm.innerHTML=`${esc(BRAND.name)} <small>${esc(BRAND.tagline)}</small>`;
  $('#fname').textContent=BRAND.name;$('#ftag').textContent=BRAND.tagline;
  const L=[];
  if(BRAND.fb)L.push(['https://facebook.com/'+encodeURIComponent(BRAND.fb),ICON.fb,'Facebook']);
  if(BRAND.ig)L.push(['https://instagram.com/'+encodeURIComponent(BRAND.ig),ICON.ig,'Instagram']);
  if(BRAND.whatsapp)L.push(['https://wa.me/'+String(BRAND.whatsapp).replace(/\D/g,''),ICON.wa,'WhatsApp']);
  if(BRAND.email)L.push(['mailto:'+BRAND.email,ICON.mail,BRAND.email]);
  $('#soc').innerHTML=L.length?L.map(x=>`<a class="soca" href="${esc(x[0])}" target="_blank" rel="noopener" aria-label="${esc(x[2])}">${x[1]}<span>${esc(x[2])}</span></a>`).join(''):'<span class="note">Add your links in config.js</span>';
  const fab=$('#fab');if(BRAND.fb){fab.href='https://m.me/'+encodeURIComponent(BRAND.fb);fab.hidden=false}
}
function refreshAll(){
  applyStatic();applyTheme();fillAreas();renderNav();renderTypes();setPin(S.pin,false);route();
}
/* live exchange rates: refresh at most every 12 hours, keep the built-in rates if the request fails */
(function loadRates(){
  try{const c=lsg('rates',null);if(c&&Date.now()-c.t<432e5&&c.r){Object.assign(RATES,c.r);RATEINFO.date=c.d;return}}catch(e){}
  try{fetch('https://open.er-api.com/v6/latest/PHP').then(r=>r.json()).then(j=>{if(j&&j.result==='success'&&j.rates){const r={};CURRENCIES.forEach(c=>{if(j.rates[c[0]])r[c[0]]=j.rates[c[0]]});Object.assign(RATES,r);RATEINFO.date=String(j.time_last_update_utc||'').slice(5,16)||RATEINFO.date;lss('rates',{t:Date.now(),r,d:RATEINFO.date});renderGrid();quote()}}).catch(()=>{})}catch(e){}
})();
[renderBrand,applyStatic,applyTheme,route].forEach(f=>{try{f()}catch(e){console.error('Arkila init',f.name,e)}});
