/* Login, host, trips and admin screens. Demo only: no real Facebook or Google yet. */
const ROUTES=['home','saved','host','trips','admin','terms','privacy'];
const STATUS={new:['Requested','w'],confirmed:['Paid and confirmed','b'],completed:['Completed','g'],cancelled:['Cancelled','r'],pending:['Waiting for approval','w'],approved:['Live','g'],rejected:['Not approved','r'],paused:['Paused','']};
const pill=k=>{const s=STATUS[k]||[k,''];return `<span class="pill ${s[1]}">${esc(t('st.'+k)===('st.'+k)?s[0]:t('st.'+k))}</span>`};
const has=(u,r)=>!!(u&&u.roles.includes(r));
const first=n=>String(n||'').split(' ')[0];

/* ---- requests ---- */
function saveRequest(q,name,phone,notes,spot,msg){
  const me=ST.me();let id;do{id='REQ-'+(1000+Math.floor(Math.random()*9000))}while(ST.requests.some(r=>r.id===id));
  const r={id,carId:q.c.id,carName:q.c.name,hostId:q.c.ownerId,hostName:q.c.ownerName,guestId:me.id,guestName:name,guestPhone:phone,from:q.a,to:q.b,days:q.d,total:q.total,deposit:q.dep,spot,notes,msg,status:'new',ack:{renterNotice:Date.now(),v:'2026-11-03'},createdAt:Date.now()};
  ST.requests.unshift(r);ST.save();renderNav();return r;
}
const setReq=(id,status)=>{const r=ST.requests.find(x=>x.id===id);if(r){r.status=status;ST.save()}};

/* ---- nav ---- */
function renderNav(){
  const me=ST.me(),h=location.hash.slice(1)||'home',on=k=>h===k?' class="on" aria-current="page"':'';
  const myTrips=me?ST.requests.filter(r=>r.guestId===me.id&&r.status!=='cancelled').length:0;
  const ic=p=>`<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const I={rent:'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',saved:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',trips:'<path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v4H3z"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>',admin:'<path d="M12 3l8 3v6c0 4.5-3.4 7.7-8 9-4.6-1.3-8-4.5-8-9V6z"/>'};
  const row=(href,k,label,badge)=>`<a href="${href}" role="menuitem"${on(k)}>${ic(I[k])}<span>${esc(label)}</span>${badge?`<b>${badge}</b>`:''}</a>`;
  $('#nav').innerHTML=row('#home','rent',t('nav.rent'))+row('#saved','saved',t('nav.saved'),ST.favs.length)+(me?row('#trips','trips',t('nav.trips'),myTrips):'')+(has(me,'admin')?row('#admin','admin',t('nav.admin')):'');
  $('#mauth').innerHTML=me?`<div class="who">${esc(me.name)}</div><button type="button" class="mi" data-logout role="menuitem">${esc(t('nav.logout'))}</button>`:`<button type="button" class="mi strong" data-login role="menuitem">${esc(t('nav.login'))}</button>`;
  const hb=$('#hostbtn');if(hb){hb.textContent=has(me,'host')?t('nav.host'):t('nav.become');if(me){hb.setAttribute('href','#host');hb.removeAttribute('data-login');hb.classList.toggle('on',h==='host')}else{hb.setAttribute('href','#host');hb.dataset.login='host'}}
  const av=$('#mav');if(av)av.textContent=me?first(me.name).charAt(0).toUpperCase():'';
  const mb=$('#mbtn');if(mb)mb.classList.toggle('in',!!me);
  const sb=$('#setbtn');if(sb)sb.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="vertical-align:-3px"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="2"/></svg> ${PREF.lang.toUpperCase()} · ${PREF.cur}`;
}

/* ---- login ---- */
const ldlg=$('#ldlg');
function openLogin(msg,role){
  $('#lbody').innerHTML=`<h2 id="ltitle">${esc(t('l.title'))}</h2><p class="note" style="margin:6px 0 0">${esc(msg||t('l.sub'))}</p>
  <div class="banner" style="margin:12px 0">${esc(t('l.demo'))}</div>
  <div class="form"><label><span class="lab">${esc(t('l.name'))}</span><input id="lname" autocomplete="name" placeholder="Juan Dela Cruz"></label>
  <div class="rolepick" role="radiogroup"><label class="rp"><input type="radio" name="lrole" value="guest"${role==="host"?"":" checked"}><span><b>${esc(t('l.rent'))}</b><small>${esc(t('l.rents'))}</small></span></label><label class="rp"><input type="radio" name="lrole" value="host"${role==="host"?" checked":""}><span><b>${esc(t('l.list'))}</b><small>${esc(t('l.lists'))}</small></span></label></div>
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
const HCAL=new Set();
function hostDay(id,s){const me=ST.me(),l=me&&ST.listings.find(x=>x.id===id&&x.ownerId===me.id);if(!l)return;const k=dayInfo(id,s);if(k==='booked'||k==='arkila')return;const arr=ST.blocks[id]||(ST.blocks[id]=[]),i=arr.indexOf(s);if(i>=0)arr.splice(i,1);else arr.push(s);if(!arr.length)delete ST.blocks[id];ST.save();refreshHome()}
const COLORS=[['#A9B3C0','Silver'],['#1F2933','Black'],['#D6DBE2','White'],['#2E86DE','Blue'],['#C0392B','Red'],['#3E6B4E','Green'],['#7D8794','Grey']];
function readImg(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const sc=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.72))};im.onerror=rej;im.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}
function hostSteps(){return `<section class="step"><h2>How a booking works for you</h2><ol class="rules"><li>Arkila checks the renter's licence and ID.</li><li>Arkila asks you to confirm the vehicle is free for the dates. Reply within [2 hours] or the request lapses.</li><li>The renter agrees to the renter notice and pays Arkila online. Arkila confirms the booking and blocks the dates on your calendar.</li><li>You and the renter complete Arkila's handover checklist at pickup, with dated photos.</li><li>Arkila pays you the rental fee, less its fee, 24 hours after pickup if the renter reports no problem.</li><li>The renter's deposit stays with Arkila. If you report damage within [24 hours] of return, the claimed amount stays held until it is settled.</li></ol></section>`}
function renderHost(){
  const me=ST.me(),el=$('#v-host');
  if(!has(me,'host')){el.innerHTML=`<h1>Earn from your vehicle</h1><p class="lead">List a car, van or motorbike. Arkila handles the renter checks, the paperwork and the payment. The renter pays Arkila online up front, and Arkila pays you after the handover, less its fee.</p>${hostSteps()}<button class="btn" data-becomehost>Become a host</button>`;return}
  const mine=ST.listings.filter(l=>l.ownerId===me.id),reqs=ST.requests.filter(r=>r.hostId===me.id);
  el.innerHTML=`<h1>Host dashboard</h1><p class="lead">New vehicles are checked by the Arkila team before guests can see them.</p>${hostSteps()}
  <section class="step"><h2>Your vehicles</h2>${mine.length?mine.map(l=>{const k=l.status==='approved'&&l.active===false?'paused':l.status;return `<div class="lrow"><div class="lthumb">${imgsOf(l)[0]}</div><div class="lmain"><b>${esc(l.name)}</b> ${pill(k)}<p class="sub">${esc(l.type)} · ${l.seats} ${l.kind==='motor'?'riders':'seats'} · ${esc(l.service)} · ${esc(l.area)} · ${php(l.price)}/day</p></div><div class="row2" style="gap:6px"><button class="chip" data-open="${esc(l.id)}">View</button>${l.status==='approved'?`<button class="chip" data-hcal="${esc(l.id)}">${HCAL.has(l.id)?'Hide calendar':'Calendar'}</button><button class="chip" data-hpause="${esc(l.id)}">${l.active===false?'Resume':'Pause'}</button>`:''}<button class="chip" data-hdel="${esc(l.id)}">Delete</button></div></div>${l.status==='approved'?`<div class="calwrap">${HCAL.has(l.id)?`<div class="cal" id="cal-h-${esc(l.id)}" data-key="h-${esc(l.id)}" data-car="${esc(l.id)}" data-mode="host">${calInner('h-'+l.id,l.id,'host')}</div><p class="note">Tap a free day to block it, tap again to unblock. Booked days update by themselves when Arkila confirms a booking.</p>`:''}</div>`:''}`}).join(''):'<div class="empty">No vehicles yet. Add your first one below.</div>'}</section>
  <section class="step"><h2>Add a vehicle</h2><form class="form" id="hf" novalidate>
    <label><span class="lab">Category</span><select id="hk"><option value="car">Car, van or pickup</option><option value="motor">Motorbike or scooter</option></select></label>
    <label><span class="lab">Vehicle name</span><input id="hn" placeholder="Toyota Vios 2021"></label>
    <div class="f2"><label><span class="lab">Type</span><select id="ht">${['Sedan','Hatchback','SUV','Van','Pickup'].map(t=>`<option>${t}</option>`).join('')}</select></label>
    <label><span class="lab" id="hsl">Seats</span><input id="hs" type="number" min="1" max="20" value="5"></label></div>
    <div class="f2"><label><span class="lab">Service</span><select id="hv"><option>Self-drive</option><option>With driver</option></select></label>
    <label><span class="lab">Pickup area</span><select id="ha">${Object.keys(AREAS).map(a=>`<option>${esc(a)}</option>`).join('')}</select></label></div>
    <div class="f2"><label><span class="lab">Price per day (PHP)</span><input id="hp" type="number" min="300" step="50" placeholder="1800"></label>
    <label><span class="lab">Color</span><select id="hc">${COLORS.map(c=>`<option value="${c[0]}">${c[1]}</option>`).join('')}</select></label></div>
    <label><span class="lab">Short description</span><input id="hd" maxlength="200" placeholder="One or two sentences guests will read"></label>
    <div class="f2"><label><span class="lab">Year</span><input id="hy" type="number" min="1995" max="2030" value="2021"></label>
    <label class="ca"><span class="lab">Luggage (bags)</span><input id="hb" type="number" min="0" max="20" value="3"></label>
    <label class="mo" hidden><span class="lab">Engine size (cc)</span><input id="hcc" type="number" min="50" max="2000" value="125"></label></div>
    <div class="f2"><label><span class="lab">Transmission</span><select id="hm"><option>Automatic</option><option>Manual</option></select></label>
    <label><span class="lab">Fuel</span><select id="hfu"><option>Gasoline</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></label></div>
    <div class="f2 mo" hidden><label><span class="lab">Helmets included</span><input id="hhel" type="number" min="0" max="2" value="2"></label>
</div>
    <label><span class="lab">Security deposit (PHP), paid to Arkila and refunded to the renter</span><input id="hsd" type="number" min="0" step="500" value="5000"></label>
    <label class="mo" hidden><span class="lab">Daily distance limit</span><input id="hmi" placeholder="150 km/day, or Unlimited"></label>
    <label><span class="lab">Features (separate with commas)</span><input id="hft" placeholder="Air conditioning, Bluetooth audio, USB charging"></label>
    <label><span class="lab">Photos (up to 4)</span><input id="hph" type="file" accept="image/*" multiple></label>
    <p class="muted" style="margin:4px 0 0;font-size:12px">Only upload photos you took or have permission to use.</p>
    <div class="thumbs" id="hthumbs"></div>
    <label class="ck"><input type="checkbox" id="hack"><span>I have read and agree to the <button type="button" class="lnk" data-notice="host">host declaration</button> and the <a href="#terms" target="_blank" rel="noopener">Terms of Service</a>, and I understand Arkila holds the booking money and pays me after the handover.</span></label>
    <p class="err" id="herr" role="alert"></p><button class="btn" type="submit">Submit for approval</button></form></section>
  <section class="step"><h2>Requests for your vehicles</h2>${reqs.length?reqs.map(r=>`<div class="lrow"><div class="lmain"><b>${esc(r.carName)}</b> ${pill(r.status)}<p class="sub">${fmt(r.from)} to ${fmt(r.to)} · ${r.days} day${r.days>1?'s':''} · ${php(r.total)} · ${esc(r.id)}</p><p class="sub">Guest: ${esc(first(r.guestName))}${(r.status==='confirmed'||r.status==='completed')?` · ${esc(r.guestPhone)}`:' · contact shared once the deposit is received'}</p></div></div>`).join(''):'<div class="empty">No requests yet.</div>'}</section>`;
  renderHthumbs();
}
function renderHthumbs(){const t=$('#hthumbs');if(t)t.innerHTML=HF.photos.map((p,i)=>`<div class="th on" style="position:relative"><img src="${p}" alt="Photo ${i+1}"><button type="button" class="chip" data-hrm="${i}" style="position:absolute;right:2px;top:2px;padding:0 7px">×</button></div>`).join('')}
const KIND_OPTS={car:{types:['Sedan','Hatchback','SUV','Van','Pickup'],trans:['Automatic','Manual'],seats:[5,20,'Seats'],ph:'Toyota Vios 2021'},motor:{types:['Scooter','Underbone','Mid-size','Big bike'],trans:['Automatic','Semi-automatic','Manual'],seats:[2,2,'Riders'],ph:'Honda Click 125i'}};
function hostKind(){
  const k=$('#hk').value,o=KIND_OPTS[k];const dp=$('#hsd');if(dp&&!dp.dataset.t)dp.value=SETTINGS.deposit[k==='motor'?'motor':'car'];
  $('#ht').innerHTML=o.types.map(t=>`<option>${t}</option>`).join('');$('#hm').innerHTML=o.trans.map(t=>`<option>${t}</option>`).join('');
  $('#hs').max=o.seats[1];$('#hs').value=o.seats[0];$('#hsl').textContent=o.seats[2];$('#hn').placeholder=o.ph;
  document.querySelectorAll('#hf .mo').forEach(e=>e.hidden=k!=='motor');document.querySelectorAll('#hf .ca').forEach(e=>e.hidden=k==='motor');
  $('#hp').placeholder=k==='motor'?'600':'1800';
}
async function addHostListing(){
  const me=ST.me(),v=id=>$('#'+id).value.trim(),err=$('#herr');err.textContent='';
  const name=v('hn'),price=+v('hp'),seats=+v('hs');
  if(name.length<3){err.textContent='Add the vehicle name.';return}
  if(!$('#hack').checked){err.textContent='Tick the host declaration to submit.';return}
  if(!(price>=300)){err.textContent='Enter a price per day, at least ₱300.';return}
  const mo=v('hk')==='motor';
  if(!(seats>=1)||(mo&&seats>2)){err.textContent=mo?'Riders must be 1 or 2.':'Enter the number of seats.';return}
  const l={id:'u-'+Date.now().toString(36),kind:mo?'motor':'car',name,type:v('ht'),seats,service:v('hv'),area:v('ha'),price,color:v('hc'),active:true,description:v('hd'),
    specs:mo?{year:+v('hy')||'',transmission:v('hm'),cc:+v('hcc')||'',fuel:v('hfu'),helmets:Math.max(0,Math.min(2,+v('hhel')||0)),mileage:v('hmi')||'',deposit:Math.max(0,+v('hsd')||0)}:{year:+v('hy')||'',transmission:v('hm'),fuel:v('hfu'),bags:+v('hb')||0,aircon:'Yes',deposit:Math.max(0,+v('hsd')||0)},features:v('hft').split(',').map(s=>s.trim()).filter(Boolean),images:HF.photos.slice(),
    ownerId:me.id,ownerName:me.name,status:'pending',ack:{hostDeclaration:Date.now(),v:'2026-11-03'},createdAt:Date.now()};
  ST.listings.unshift(l);
  if(!ST.save()){ST.listings.shift();err.textContent='This device is out of storage for photos. Remove a photo or two and try again.';return}
  HF.photos=[];toast('Submitted. The Arkila team will review it.');renderHost();
}
$('#v-host').addEventListener('click',e=>{
  const b=e.target.closest('[data-becomehost],[data-hpause],[data-hdel],[data-hrm],[data-hcal]');if(!b)return;const me=ST.me();
  if(b.dataset.becomehost!==undefined){if(!has(me,'host'))me.roles.push('host');ST.save();renderNav();renderHost()}
  else if(b.dataset.hpause){const l=ST.listings.find(x=>x.id===b.dataset.hpause&&x.ownerId===me.id);if(l){l.active=l.active===false;ST.save();renderHost();refreshHome()}}
  else if(b.dataset.hdel){if(b.dataset.armed){ST.listings=ST.listings.filter(x=>!(x.id===b.dataset.hdel&&x.ownerId===me.id));ST.save();renderHost();refreshHome()}else{b.dataset.armed='1';b.textContent='Tap again to delete'}}
  else if(b.dataset.hcal){const k=b.dataset.hcal;if(HCAL.has(k))HCAL.delete(k);else HCAL.add(k);renderHost()}
  else if(b.dataset.hrm!==undefined){HF.photos.splice(+b.dataset.hrm,1);renderHthumbs()}
});
$('#v-host').addEventListener('submit',e=>{if(e.target.id==='hf'){e.preventDefault();addHostListing()}});
$('#v-host').addEventListener('change',async e=>{
  if(e.target.id==='hk'){hostKind();return}
  if(e.target.id!=='hph')return;const files=[...e.target.files].slice(0,4-HF.photos.length);
  for(const f of files){try{HF.photos.push(await readImg(f))}catch(x){toast('Could not read that photo.')}}
  e.target.value='';renderHthumbs();
});

/* ---- guest trips ---- */
function renderTrips(){
  const me=ST.me(),mine=ST.requests.filter(r=>r.guestId===me.id);
  $('#v-trips').innerHTML=`<h1>${esc(t('tr.t'))}</h1><p class="lead">${esc(t('tr.lead'))}</p>`+(mine.length?mine.map(r=>`<section class="step"><div class="row2"><h2>${esc(r.carName)}</h2>${pill(r.status)}</div><p class="sub" style="margin:0">${fmt(r.from)} → ${fmt(r.to)} · ${esc(t('tr.days',{d:r.days}))} · ${esc(r.id)}</p>
    <div class="q"><div><span>${esc(t('tr.total'))}</span><span>${esc(money(r.total))}</span></div><div><span>${esc(t('tr.dep'))}</span><span>${esc(money(r.deposit))}</span></div><div class="t"><span>${esc(t('tr.pay'))}</span><span>${esc(money(r.total+r.deposit))}</span></div></div>
    ${r.status==='new'||r.status==='confirmed'?`<div class="stack"><button class="btn ghost danger" data-cancelreq="${esc(r.id)}">${esc(t('tr.cancel'))}</button></div>`:''}${r.status==='cancelled'?`<div class="stack"><button class="btn ghost danger" data-delreq="${esc(r.id)}">${esc(t('tr.del'))}</button></div>`:''}
    ${r.status==='new'?`<p class="note">${esc(t('tr.send'))}</p><div class="stack"><button class="btn ghost" data-copyreq="${esc(r.id)}">${esc(t('tr.copy'))}</button></div>`:''}
    ${r.status==='completed'?(ST.reviews.some(x=>x.reqId===r.id)?`<p class="note">${esc(t('rv.thanks'))}</p>`:`<form class="form" data-rvf="${esc(r.id)}"><span class="lab">${esc(t('rv.q'))}</span><select name="rating">${[5,4,3,2,1].map(n=>`<option value="${n}">${esc(t('rv.'+n))}</option>`).join('')}</select><input name="text" maxlength="200" placeholder="${esc(t('rv.ph'))}"><button class="btn" type="submit">${esc(t('rv.post'))}</button></form>`):''}
    ${r.status==='confirmed'?`<div class="ok" style="background:color-mix(in srgb,var(--good) 12%,var(--surface));border:1px solid var(--good);border-radius:12px;padding:10px 14px">${esc(t('tr.ok',{phone:r.guestPhone}))}</div>`:''}</section>`).join(''):'<div class="empty">'+esc(t('tr.empty'))+'</div>');
}
$('#v-trips').addEventListener('submit',e=>{const f=e.target.closest('[data-rvf]');if(!f)return;e.preventDefault();const r=ST.requests.find(x=>x.id===f.dataset.rvf),me=ST.me();if(!r||!me||r.guestId!==me.id||r.status!=='completed')return;const text=f.elements.text.value.trim();if(text.length<3){toast(t('rv.short'));return}
  ST.reviews.push({id:'rv-'+Date.now().toString(36),carId:r.carId,reqId:r.id,guestId:me.id,guestName:me.name,rating:+f.elements.rating.value,text,createdAt:Date.now()});ST.save();toast(t('rv.posted'));renderTrips()});
/* ---- mini confirm window ---- */
const cdlg=$('#cdlg');let cOK=null;
function confirmBox(o){cOK=o.ok;$('#cbody').innerHTML=`<h2 id="ctitle">${esc(o.title)}</h2><p>${esc(o.text)}</p><div class="crow"><button type="button" class="lnk cbk" data-cclose>${esc(o.back||t('c.keep'))}</button><button type="button" class="btn dark" data-cgo>${esc(o.go)}</button></div>`;cdlg.showModal()}
cdlg.addEventListener('click',e=>{if(e.target===cdlg||e.target.closest('[data-cclose]')){cOK=null;cdlg.close()}else if(e.target.closest('[data-cgo]')){const f=cOK;cOK=null;cdlg.close();if(f)f()}});
$('#v-trips').addEventListener('click',e=>{
  const cb=e.target.closest('[data-cancelreq]'),db=e.target.closest('[data-delreq]'),me0=ST.me();
  if(cb||db){const id=(cb||db).dataset.cancelreq||(cb||db).dataset.delreq,r=ST.requests.find(x=>x.id===id);if(!r||!me0||r.guestId!==me0.id)return;
    if(cb)confirmBox({title:t('c.cancel.t'),text:t(r.status==='confirmed'?'c.cancel.paid':'c.cancel.new',{n:r.carName,c:SETTINGS.cancellation||''}),go:t('tr.cancel'),ok:()=>{r.status='cancelled';r.cancelledAt=Date.now();ST.save();toast(t('c.cancelled'));renderTrips();renderNav()}});
    else confirmBox({title:t('c.del.t'),text:t('c.del.x',{n:r.carName}),go:t('tr.del'),ok:()=>{ST.requests=ST.requests.filter(x=>x.id!==id);ST.save();toast(t('c.deleted'));renderTrips();renderNav()}});
    return}
const b=e.target.closest('[data-copyreq]');if(!b)return;const r=ST.requests.find(x=>x.id===b.dataset.copyreq);if(!r)return;
  (navigator.clipboard?navigator.clipboard.writeText(r.msg):Promise.reject()).then(()=>toast(t('copied'))).catch(()=>toast(t('copyfail')))});

/* ---- admin ---- */
function renderAdmin(){
  const pend=ST.listings.filter(l=>l.status==='pending'),rs=ST.requests,booked=rs.filter(r=>r.status==='confirmed'||r.status==='completed');
  const val=booked.reduce((s,r)=>s+r.total,0);
  $('#v-admin').innerHTML=`<h1>Arkila team</h1><p class="lead">Approve vehicles and move requests along. Demo screen: anyone can open it in this version.</p>
  <div class="stats"><div class="stat"><span>Waiting approval</span><b>${pend.length}</b></div><div class="stat"><span>Requests</span><b>${rs.length}</b></div><div class="stat"><span>Paid bookings</span><b>${booked.length}</b></div><div class="stat"><span>Commission (${Math.round(SETTINGS.commission*100)}%)</span><b>${php(val*SETTINGS.commission)}</b></div></div>
  <section class="step"><h2>Vehicles waiting for approval</h2>${pend.length?pend.map(l=>`<div class="lrow"><div class="lthumb">${imgsOf(l)[0]}</div><div class="lmain"><b>${esc(l.name)}</b><p class="sub">${esc(l.type)} · ${l.seats} ${l.kind==='motor'?'riders':'seats'} · ${esc(l.area)} · ${php(l.price)}/day · host ${esc(l.ownerName)}</p></div><div class="row2" style="gap:6px"><button class="chip" data-open="${esc(l.id)}">View</button><button class="chip on" data-lapp="${esc(l.id)}">Approve</button><button class="chip" data-lrej="${esc(l.id)}">Reject</button></div></div>`).join(''):'<div class="empty">Nothing waiting.</div>'}</section>
  <section class="step"><h2>All requests</h2>${rs.length?rs.map(r=>`<div class="lrow"><div class="lmain"><b>${esc(r.carName)}</b> ${pill(r.status)}<p class="sub">${esc(r.id)} · ${fmt(r.from)} to ${fmt(r.to)} · ${php(r.total)} · deposit ${php(r.deposit)} · to pay ${php(r.total+r.deposit)}</p><p class="sub">Guest ${esc(r.guestName)} ${esc(r.guestPhone)} · host ${esc(r.hostName)}${r.spot&&r.spot!=='not set'?' · pickup '+esc(r.spot.split(',')[0]):''}</p></div><div class="row2" style="gap:6px">${r.status==='new'?`<button class="chip on" data-rset="${esc(r.id)}|confirmed">Payment received</button>`:''}${r.status==='confirmed'?`<button class="chip on" data-rset="${esc(r.id)}|completed">Mark completed</button>`:''}${(r.status==='new'||r.status==='confirmed')?`<button class="chip" data-rset="${esc(r.id)}|cancelled">Cancel</button>`:''}</div></div>`).join(''):'<div class="empty">No requests yet.</div>'}</section>`;
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

/* ---- account menu ---- */
function closeMenu(){const m=$('#menu');if(m&&!m.hidden){m.hidden=true;$('#mbtn').setAttribute('aria-expanded','false')}}
document.addEventListener('click',e=>{const mb=e.target.closest('#mbtn'),m=$('#menu');
  if(mb){m.hidden=!m.hidden;mb.setAttribute('aria-expanded',String(!m.hidden));return}
  if(!e.target.closest('#menu')||e.target.closest('#menu a,#menu [data-setopen],#menu [data-login],#menu [data-logout]'))closeMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
/* ---- shared ---- */
document.addEventListener('click',e=>{
  const fv=e.target.closest('[data-fav]');
  if(fv){toggleFav(fv.dataset.fav);return}
  const lg=e.target.closest('[data-login]');if(lg){if(lg.tagName==='A')e.preventDefault();closeMenu();openLogin(lg.dataset.login==='host'?t('l.hostneed'):undefined,lg.dataset.login==='host'?'host':undefined)}
  else if(e.target.closest('[data-logout]')){closeMenu();ST.sid=null;ST.save();$('#name').value='';$('#phone').value='';renderNav();toast(t('l.out'));if(location.hash.slice(1)!=='home')location.hash='home';else route()}
});
function route(){
  const h=location.hash.slice(1),v=ROUTES.includes(h)?h:'home',me=ST.me();
  if(v!=='home'&&v!=='saved'&&v!=='terms'&&v!=='privacy'&&!me){history.replaceState(null,'','#home');openLogin(t('l.need'));return route()}
  if(v==='admin'&&!has(me,'admin')){location.hash='home';return}
  ROUTES.forEach(r=>{$('#v-'+r).hidden=r!==v});
  if(v==='home')refreshHome();else if(v==='saved')renderSaved();else if(v==='host')renderHost();else if(v==='trips')renderTrips();else if(v==='terms'||v==='privacy')renderLegal(v);else renderAdmin();
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
  L.push([BRAND.fb?'https://facebook.com/'+encodeURIComponent(BRAND.fb):'',ICON.fb,'Facebook']);
  L.push([BRAND.ig?'https://instagram.com/'+encodeURIComponent(BRAND.ig):'',ICON.ig,'Instagram']);
  if(BRAND.whatsapp)L.push(['https://wa.me/'+String(BRAND.whatsapp).replace(/\D/g,''),ICON.wa,'WhatsApp']);
  if(BRAND.email)L.push(['mailto:'+BRAND.email,ICON.mail,BRAND.email]);
  $('#soc').innerHTML=L.map(x=>x[0]?`<a class="soca" href="${esc(x[0])}" target="_blank" rel="noopener" aria-label="${esc(x[2])}">${x[1]}</a>`:`<span class="soca off" role="img" aria-label="${esc(x[2])} (link not set yet)" title="${esc(x[2])} – add the link in config.js">${x[1]}</span>`).join('');
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

$('#v-host').addEventListener('input',e=>{if(e.target.id==='hsd')e.target.dataset.t='1'});
