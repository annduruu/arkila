const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
const php=n=>'₱'+Math.round(n).toLocaleString('en-PH');
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const fmt=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-PH',{day:'numeric',month:'short',year:'numeric'})};
const days=(a,b)=>{const [y1,m1,d1]=a.split('-').map(Number),[y2,m2,d2]=b.split('-').map(Number);return Math.round((new Date(y2,m2-1,d2)-new Date(y1,m1-1,d1))/864e5)};
const toast=m=>{const d=document.createElement('div');d.className='toast';d.textContent=m;d.setAttribute('role','status');document.body.appendChild(d);setTimeout(()=>d.remove(),2600)};
function carSVG(c){
  const P={sedan:['M24 118 L44 98 Q62 80 104 78 L186 78 Q222 80 242 100 L288 108 Q298 112 298 126 L298 138 L24 138Z','M72 98 Q84 86 108 85 L140 85 L140 99 L72 99Z M148 85 L186 85 Q206 87 220 99 L148 99Z'],hatch:['M26 122 L42 98 Q56 80 92 78 L206 78 Q230 82 240 102 L284 110 Q296 114 296 126 L296 138 L26 138Z','M64 98 Q74 87 96 86 L136 86 L136 99 L64 99Z M144 86 L202 86 Q216 88 226 99 L144 99Z'],suv:['M22 120 L34 84 Q40 70 66 68 L214 68 Q240 70 252 92 L290 104 Q300 108 300 124 L300 138 L22 138Z','M52 92 L62 78 L120 78 L120 98 L52 98Z M128 78 L212 78 Q228 80 238 98 L128 98Z'],van:['M20 134 L20 70 Q20 58 34 58 L236 58 Q252 58 260 74 L298 108 Q302 114 302 124 L302 138 L20 138Z','M36 72 L100 72 L100 96 L36 96Z M108 72 L172 72 L172 96 L108 96Z M180 72 L236 72 Q244 74 250 90 L250 96 L180 96Z'],pickup:['M22 124 L22 108 L120 108 L132 80 Q138 70 156 70 L224 70 Q244 72 254 94 L292 104 Q300 108 300 124 L300 138 L22 138Z','M142 82 L222 82 Q236 84 242 98 L142 98Z']};
  const k=c.type==='Hatchback'?'hatch':String(c.type).toLowerCase(),p=P[k]||P.sedan;
  return `<svg viewBox="0 0 320 170" role="img" aria-label="${esc(c.name)}"><ellipse cx="160" cy="158" rx="132" ry="8" fill="#000" opacity=".16"/><path d="${p[0]}" fill="${esc(c.color||'#7D8794')}"/><path d="${p[1]}" fill="var(--win)"/><path d="M24 132 L298 132" stroke="#000" stroke-opacity=".18" stroke-width="3"/><circle cx="88" cy="138" r="20" fill="#171C24"/><circle cx="88" cy="138" r="9" fill="#CBD3DD"/><circle cx="236" cy="138" r="20" fill="#171C24"/><circle cx="236" cy="138" r="9" fill="#CBD3DD"/></svg>`;
}

function frontSVG(c){return `<svg viewBox="0 0 320 170" role="img" aria-label="${esc(c.name)} front, illustration"><ellipse cx="160" cy="156" rx="112" ry="8" fill="#000" opacity=".16"/><rect x="52" y="124" width="22" height="26" rx="5" fill="#171C24"/><rect x="246" y="124" width="22" height="26" rx="5" fill="#171C24"/><path d="M58 134 L58 96 Q60 66 100 58 L220 58 Q260 66 262 96 L262 134Z" fill="${esc(c.color||'#7D8794')}"/><path d="M92 66 L228 66 L244 98 L76 98Z" fill="var(--win)"/><circle cx="84" cy="114" r="11" fill="#FFE9A6"/><circle cx="236" cy="114" r="11" fill="#FFE9A6"/><rect x="124" y="108" width="72" height="16" rx="4" fill="#171C24" opacity=".85"/><rect x="136" y="128" width="48" height="8" rx="2" fill="#fff" opacity=".85"/></svg>`}
function interiorSVG(c){return `<svg viewBox="0 0 320 170" role="img" aria-label="${esc(c.name)} interior, illustration"><rect width="320" height="170" fill="var(--win)"/><path d="M0 96 Q160 70 320 96 L320 170 L0 170Z" fill="#2A323D"/><rect x="176" y="100" width="62" height="34" rx="5" fill="#0E141B"/><rect x="182" y="106" width="50" height="22" rx="3" fill="#2F6DB5" opacity=".7"/><circle cx="96" cy="116" r="34" fill="none" stroke="#11161D" stroke-width="9"/><circle cx="96" cy="116" r="8" fill="#11161D"/><rect x="40" y="148" width="240" height="22" rx="6" fill="#1B222B"/></svg>`}
const imgsOf=c=>(c.images&&c.images.length)?c.images.map((u,i)=>`<img src="${esc(u)}" alt="${esc(c.name)} photo ${i+1}" loading="lazy">`):[carSVG(c),frontSVG(c),interiorSVG(c)];
const hasPhotos=c=>c.images&&c.images.length;

const S={type:'All',service:'any',seats:0,sel:null,pin:CENTER.slice(),moved:false,gi:0,gid:null};
const rad=x=>x*Math.PI/180;
const km=(a,b)=>{const R=6371,dLa=rad(b[0]-a[0]),dLo=rad(b[1]-a[1]),h=Math.sin(dLa/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
const nearestArea=p=>Object.keys(AREAS).reduce((best,k)=>km(p,AREAS[k])<km(p,AREAS[best])?k:best,'City Proper');
const carPos=c=>{const a=AREAS[c.area]||CENTER,h=[...c.id].reduce((x,ch)=>(x*31+ch.charCodeAt(0))>>>0,7);return [a[0]+((h%100)/100-.5)*0.006,a[1]+(((h>>7)%100)/100-.5)*0.006]};
const distOf=c=>km(S.pin,carPos(c));
const activeCars=()=>allCars().filter(c=>c.status==='approved'&&c.active!==false);

/* dates */
const t1=new Date();t1.setDate(t1.getDate()+1);const t2=new Date();t2.setDate(t2.getDate()+3);
$('#from').value=iso(t1);$('#to').value=iso(t2);$('#from').min=iso(new Date());
if(SETTINGS.isSample)$('#sampleBanner').hidden=false;

/* ---------- map ---------- */
let map=null,pinMk=null,carLayer=null;
function initMap(){
  const sel=$('#areaSel');sel.innerHTML='<option value="">Choose an area</option>'+Object.keys(AREAS).map(a=>`<option>${esc(a)}</option>`).join('');
  if(typeof L==='undefined'){$('#map').innerHTML='<div class="empty" style="margin:12px">The map could not load. Choose your area below instead.</div>';return}
  map=L.map('map',{scrollWheelZoom:false}).setView(CENTER,12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
  pinMk=L.marker(CENTER,{draggable:true,keyboard:true,title:'Drag to your pickup spot',icon:L.divIcon({className:'pin',html:'<span></span>',iconSize:[28,28],iconAnchor:[14,28]})}).addTo(map);
  pinMk.on('dragend',()=>{const p=pinMk.getLatLng();setPin([p.lat,p.lng],true)});
  map.on('click',e=>{pinMk.setLatLng(e.latlng);setPin([e.latlng.lat,e.latlng.lng],true)});
  carLayer=L.layerGroup().addTo(map);
}
function drawMarkers(list){
  if(!map)return;carLayer.clearLayers();
  list.forEach(c=>{const p=carPos(c),short=c.price>=1000?'₱'+(c.price/1000).toFixed(c.price%1000?1:0)+'k':'₱'+c.price;
    L.marker(p,{title:c.name,icon:L.divIcon({className:'cm',html:`<b>${short}</b>`,iconSize:[48,22],iconAnchor:[24,11]})}).on('click',()=>openDetail(c.id)).addTo(carLayer)});
}
function setPin(p,moved){
  S.pin=p;if(moved)S.moved=true;
  const a=nearestArea(p);$('#pininfo').innerHTML=S.moved?`Pickup pin is near <b>${esc(a)}</b> (${p[0].toFixed(4)}, ${p[1].toFixed(4)}). Vehicles are sorted by distance.`:'Drag the pin or tap the map to set your pickup spot.';
  $('#areaSel').value=S.moved?a:'';renderGrid();
}
$('#areaSel').addEventListener('change',e=>{const a=e.target.value;if(!a)return;const p=AREAS[a];if(map){pinMk.setLatLng(p);map.setView(p,13)}setPin(p.slice(),true)});
$('#locate').addEventListener('click',()=>{
  if(!navigator.geolocation){toast('Location is not available here. Drag the pin instead.');return}
  navigator.geolocation.getCurrentPosition(pos=>{const p=[pos.coords.latitude,pos.coords.longitude];if(map){pinMk.setLatLng(p);map.setView(p,14)}setPin(p,true)},()=>toast('Location is off. Drag the pin instead.'),{timeout:8000});
});

/* ---------- vehicles ---------- */
function renderTypes(){
  const types=['All',...new Set(activeCars().map(c=>c.type))];
  $('#types').innerHTML=types.map(t=>`<button type="button" class="chip" data-type="${esc(t)}" aria-pressed="${t===S.type}">${esc(t)}</button>`).join('');
}
function filtered(){
  const l=activeCars().filter(c=>(S.type==='All'||c.type===S.type)&&(S.service==='any'||c.service===S.service)&&c.seats>=S.seats);
  return l.sort((a,b)=>S.moved?distOf(a)-distOf(b):a.price-b.price);
}
function renderGrid(){
  const list=filtered();
  $('#count').textContent=`${list.length} vehicle${list.length===1?'':'s'}${S.moved?' · nearest first':' · lowest price first'}`;
  $('#grid').innerHTML=list.length?list.map(c=>`<button type="button" class="card${S.sel===c.id?' sel':''}" data-open="${esc(c.id)}">
    <div class="tile">${imgsOf(c)[0]}<span class="area">${esc(c.area)}</span><span class="svc">${esc(c.service)}</span>${S.sel===c.id?'<span class="chosen">Chosen</span>':''}</div>
    <div class="cb"><h3>${esc(c.name)}</h3><p class="sub">${esc(c.type)} · ${c.seats} seats${S.moved?' · '+distOf(c).toFixed(1)+' km away':''}</p><p class="pr"><b>${php(c.price)}</b><span>per day</span></p></div></button>`).join(''):'<div class="empty">No vehicles match. Try another type or fewer seats.</div>';
  drawMarkers(list);quote();
}
$('#svc').addEventListener('change',e=>{S.service=e.target.value;renderGrid()});
$('#seats').addEventListener('change',e=>{S.seats=+e.target.value;renderGrid()});

/* ---------- detail dialog ---------- */
const dlg=$('#dlg');
function openDetail(id){
  const c=allCars().find(x=>x.id===id);if(!c)return;S.gid=id;S.gi=0;
  const sp=c.specs||{},rows=[['Year',sp.year],['Transmission',sp.transmission],['Fuel',sp.fuel],['Seats',c.seats],['Luggage',sp.bags!=null?sp.bags+' bags':''],['Air conditioning',sp.aircon],['Service',c.service],['Pickup area',c.area]].filter(r=>r[1]!==''&&r[1]!=null);
  $('#dbody').innerHTML=`<div class="gal"><div class="stage" id="stage"></div><button type="button" class="nav prev" data-g="-1" aria-label="Previous photo">‹</button><button type="button" class="nav next" data-g="1" aria-label="Next photo">›</button></div>
  <div class="thumbs" id="thumbs"></div>
  <p class="note" id="galnote" style="margin-top:6px"></p>
  ${c.ownerName?`<p class="note" style="margin:8px 0 0">Hosted by ${esc(c.ownerName)}</p>`:''}<div class="dhead"><div><h2 id="dtitle">${esc(c.name)}</h2><p class="sub">${esc(c.type)} · ${c.seats} seats · ${esc(c.service)}${S.moved?' · '+distOf(c).toFixed(1)+' km from your pin':''}</p></div><p class="pr big"><b>${php(c.price)}</b><span>per day</span></p></div>
  <p class="desc">${esc(c.description||'')}</p>
  <h3 class="h3">Details</h3><dl class="specs">${rows.map(r=>`<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl>
  ${(c.features&&c.features.length)?`<h3 class="h3">Features</h3><div class="feat">${c.features.map(f=>`<span class="pill">${esc(f)}</span>`).join('')}</div>`:''}
  <h3 class="h3">Good to know</h3><ul class="rules"><li>A ${Math.round(SETTINGS.depositRate*100)}% deposit confirms the booking. You pay the rest to the owner at pickup.</li>${c.service==='Self-drive'?'<li>Bring a valid driver\'s license. The owner checks it at pickup.</li>':'<li>A driver is included. Confirm the route and hours with the owner.</li>'}<li>Return with the same fuel level unless the owner says otherwise.</li></ul>
  ${c.status==='approved'?`<div class="stack"><button type="button" class="btn" data-choose="${esc(c.id)}">Choose this vehicle</button></div>`:'<p class="note">Preview only. This vehicle is not live yet.</p>'}`;
  renderGallery();if(!dlg.open)dlg.showModal();
}
function renderGallery(){
  const c=allCars().find(x=>x.id===S.gid),im=imgsOf(c);S.gi=(S.gi+im.length)%im.length;
  $('#stage').innerHTML=im[S.gi];
  $('#thumbs').innerHTML=im.map((h,i)=>`<button type="button" class="th${i===S.gi?' on':''}" data-gi="${i}" aria-label="Photo ${i+1} of ${im.length}">${h}</button>`).join('');
  $('#galnote').textContent=hasPhotos(c)?`Photo ${S.gi+1} of ${im.length}`:`Sample illustration ${S.gi+1} of ${im.length}. The owner adds real photos.`;
}
dlg.addEventListener('click',e=>{
  if(e.target===dlg){dlg.close();return}
  const g=e.target.closest('[data-g]'),th=e.target.closest('[data-gi]'),ch=e.target.closest('[data-choose]');
  if(e.target.closest('[data-close]')){dlg.close();return}
  if(g){S.gi+=+g.dataset.g;renderGallery()}
  else if(th){S.gi=+th.dataset.gi;renderGallery()}
  else if(ch){S.sel=ch.dataset.choose;dlg.close();renderGrid();$('#s3').scrollIntoView({behavior:'smooth',block:'start'})}
});
dlg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){S.gi--;renderGallery()}else if(e.key==='ArrowRight'){S.gi++;renderGallery()}});

/* ---------- filters, request ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-type]'),o=e.target.closest('[data-open]');
  if(t){S.type=t.dataset.type;renderTypes();renderGrid()}else if(o)openDetail(o.dataset.open);
});
function quote(){
  const c=allCars().find(x=>x.id===S.sel),a=$('#from').value,b=$('#to').value;
  $('#chosen').innerHTML=c?`<span class="lab">Chosen vehicle</span><div class="row2"><b>${esc(c.name)}</b><button type="button" class="chip" data-open="${esc(c.id)}">View details</button></div>`:'<span class="note">Pick a vehicle above to see the price.</span>';
  if(!c||!a||!b||days(a,b)<1){$('#quote').innerHTML=c?'<span class="note">Return date must be after pickup date.</span>':'';return null}
  const d=days(a,b),total=c.price*d,dep=Math.round(total*SETTINGS.depositRate);
  $('#quote').innerHTML=`<div><span>${php(c.price)} × ${d} day${d>1?'s':''}</span><span>${php(total)}</span></div><div><span>Deposit to confirm</span><span>${php(dep)}</span></div><div><span>Balance at pickup</span><span>${php(total-dep)}</span></div><div class="t"><span>Total</span><span>${php(total)}</span></div>`;
  return {c,a,b,d,total,dep};
}
['from','to'].forEach(id=>$('#'+id).addEventListener('change',()=>{const a=$('#from').value;if(a)$('#to').min=a;quote()}));
let MSG='';
$('#f').addEventListener('submit',e=>{
  e.preventDefault();const err=$('#err');err.textContent='';
  if(!ST.me()){openLogin('Log in to send your request.');return}
  const q=quote(),name=$('#name').value.trim(),phone=$('#phone').value.trim().replace(/[^\d+]/g,''),code=$('#code').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,''),notes=$('#notes').value.trim();
  if(!q){err.textContent='Choose a vehicle and make sure the return date is after the pickup date.';return}
  if(!name){err.textContent='Add your name.';return}
  if(!/^(\+?63|0)9\d{9}$/.test(phone)){err.textContent='Enter a Philippine mobile number, like 09171234567.';return}
  const area=nearestArea(S.pin),spot=S.moved?`near ${area}, https://www.google.com/maps?q=${S.pin[0].toFixed(5)},${S.pin[1].toFixed(5)}`:'not set';
  MSG=`Hi Arkila, I would like to request a vehicle.\n\nVehicle: ${q.c.name} (${q.c.service}, ${q.c.area})\nDates: ${fmt(q.a)} to ${fmt(q.b)} (${q.d} day${q.d>1?'s':''})\nPickup spot: ${spot}\nEstimated total: ${php(q.total)}, deposit ${php(q.dep)}\nName: ${name}\nMobile: ${phone}${code?'\nReferral code: '+code:''}${notes?'\nNotes: '+notes:''}\n\nRequest ref: ${q.c.id}|${q.a}|${q.b}|${phone}${code?'|'+code:''}`;
  const rq=saveRequest(q,name,phone,notes,spot,MSG);
  $('#msg').textContent=MSG;$('#out').hidden=false;$('#reqnote').textContent='Saved as '+rq.id+'. Track it under My trips.';$('#out').scrollIntoView({behavior:'smooth',block:'start'});
  const fb=$('#fb');
  if(SETTINGS.fbPage){fb.href='https://m.me/'+encodeURIComponent(SETTINGS.fbPage);fb.setAttribute('aria-disabled','false');$('#fbnote').textContent='Tap Copy message first, then open Messenger and paste it.'}
  else{fb.setAttribute('aria-disabled','true');$('#fbnote').textContent='Copy the message, then send it to the Arkila Facebook page'+(SETTINGS.contact?' or text '+SETTINGS.contact:'')+'.'}
});
$('#copy').addEventListener('click',()=>{
  (navigator.clipboard?navigator.clipboard.writeText(MSG):Promise.reject()).then(()=>toast('Message copied')).catch(()=>{const r=document.createRange();r.selectNodeContents($('#msg'));const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Select and copy the message above')});
});
initMap();renderTypes();setPin(CENTER.slice(),false);
function refreshHome(){renderTypes();renderGrid();const me=ST.me();if(me&&!$('#name').value)$('#name').value=me.name}
