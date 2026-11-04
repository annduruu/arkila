const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
const php=n=>'₱'+Math.round(n).toLocaleString('en-PH');
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const fmtS=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString(LOCALE[PREF.lang]||'en-PH',{day:'numeric',month:'short'})};
const fmt=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString(LOCALE[PREF.lang]||'en-PH',{day:'numeric',month:'short',year:'numeric'})};
const fmtEn=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-PH',{day:'numeric',month:'short',year:'numeric'})};
const days=(a,b)=>{const [y1,m1,d1]=a.split('-').map(Number),[y2,m2,d2]=b.split('-').map(Number);return Math.round((new Date(y2,m2-1,d2)-new Date(y1,m1-1,d1))/864e5)};
const toast=m=>{const d=document.createElement('div');d.className='toast';d.textContent=m;d.setAttribute('role','status');document.body.appendChild(d);setTimeout(()=>d.remove(),2600)};
const isMotor=c=>c&&c.kind==='motor';
const seatsLabel=c=>t(isMotor(c)?'card.riders':'card.seats',{n:c.seats});
function carSVG(c){
  const P={sedan:['M24 118 L44 98 Q62 80 104 78 L186 78 Q222 80 242 100 L288 108 Q298 112 298 126 L298 138 L24 138Z','M72 98 Q84 86 108 85 L140 85 L140 99 L72 99Z M148 85 L186 85 Q206 87 220 99 L148 99Z'],hatch:['M26 122 L42 98 Q56 80 92 78 L206 78 Q230 82 240 102 L284 110 Q296 114 296 126 L296 138 L26 138Z','M64 98 Q74 87 96 86 L136 86 L136 99 L64 99Z M144 86 L202 86 Q216 88 226 99 L144 99Z'],suv:['M22 120 L34 84 Q40 70 66 68 L214 68 Q240 70 252 92 L290 104 Q300 108 300 124 L300 138 L22 138Z','M52 92 L62 78 L120 78 L120 98 L52 98Z M128 78 L212 78 Q228 80 238 98 L128 98Z'],van:['M20 134 L20 70 Q20 58 34 58 L236 58 Q252 58 260 74 L298 108 Q302 114 302 124 L302 138 L20 138Z','M36 72 L100 72 L100 96 L36 96Z M108 72 L172 72 L172 96 L108 96Z M180 72 L236 72 Q244 74 250 90 L250 96 L180 96Z'],pickup:['M22 124 L22 108 L120 108 L132 80 Q138 70 156 70 L224 70 Q244 72 254 94 L292 104 Q300 108 300 124 L300 138 L22 138Z','M142 82 L222 82 Q236 84 242 98 L142 98Z']};
  const k=c.type==='Hatchback'?'hatch':String(c.type).toLowerCase(),p=P[k]||P.sedan;
  return `<svg viewBox="0 0 320 170" role="img" aria-label="${esc(c.name)}"><ellipse cx="160" cy="158" rx="132" ry="8" fill="#000" opacity=".16"/><path d="${p[0]}" fill="${esc(c.color||'#7D8794')}"/><path d="${p[1]}" fill="var(--win)"/><path d="M24 132 L298 132" stroke="#000" stroke-opacity=".18" stroke-width="3"/><circle cx="88" cy="138" r="20" fill="#171C24"/><circle cx="88" cy="138" r="9" fill="#CBD3DD"/><circle cx="236" cy="138" r="20" fill="#171C24"/><circle cx="236" cy="138" r="9" fill="#CBD3DD"/></svg>`;
}

function frontSVG(c){return `<svg viewBox="0 0 320 170" role="img" aria-label="${esc(c.name)} front, illustration"><ellipse cx="160" cy="156" rx="112" ry="8" fill="#000" opacity=".16"/><rect x="52" y="124" width="22" height="26" rx="5" fill="#171C24"/><rect x="246" y="124" width="22" height="26" rx="5" fill="#171C24"/><path d="M58 134 L58 96 Q60 66 100 58 L220 58 Q260 66 262 96 L262 134Z" fill="${esc(c.color||'#7D8794')}"/><path d="M92 66 L228 66 L244 98 L76 98Z" fill="var(--win)"/><circle cx="84" cy="114" r="11" fill="#FFE9A6"/><circle cx="236" cy="114" r="11" fill="#FFE9A6"/><rect x="124" y="108" width="72" height="16" rx="4" fill="#171C24" opacity=".85"/><rect x="136" y="128" width="48" height="8" rx="2" fill="#fff" opacity=".85"/></svg>`}
function interiorSVG(c){return `<svg viewBox="0 0 320 170" role="img" aria-label="${esc(c.name)} interior, illustration"><rect width="320" height="170" fill="var(--win)"/><path d="M0 96 Q160 70 320 96 L320 170 L0 170Z" fill="#2A323D"/><rect x="176" y="100" width="62" height="34" rx="5" fill="#0E141B"/><rect x="182" y="106" width="50" height="22" rx="3" fill="#2F6DB5" opacity=".7"/><circle cx="96" cy="116" r="34" fill="none" stroke="#11161D" stroke-width="9"/><circle cx="96" cy="116" r="8" fill="#11161D"/><rect x="40" y="148" width="240" height="22" rx="6" fill="#1B222B"/></svg>`}

function motorSVG(c){
  const col=esc(c.color||'#7D8794'),ty=c.type,big=(ty==='Big bike'||ty==='Mid-size'),ub=ty==='Underbone';
  let body;
  const ol=' stroke="#9AA4B2" stroke-opacity=".55" stroke-width="1.5"';
  if(ty==='Scooter'){body=`<path d="M56 112 Q56 86 92 82 L146 84 Q160 86 164 100 L164 124 L88 126 Q56 126 56 112Z" fill="${col}"${ol}/><rect x="148" y="112" width="58" height="9" rx="4" fill="#171C24"/><path d="M196 118 L210 74 Q214 64 226 62 L238 64 L228 120Z" fill="${col}"${ol}/><path d="M60 84 Q90 70 152 80 L152 91 L64 93Z" fill="#171C24"/><path d="M230 50 L244 136" stroke="#9AA4B2" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M216 54 L244 46" stroke="#171C24" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M228 120 Q250 108 262 126" stroke="${col}" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="238" cy="72" r="6" fill="#FFE9A6"/>`}
  else{body=`<path d="M112 84 L184 78 Q196 80 198 94 L190 104 L116 104Z" fill="${col}"/>${big?'<rect x="120" y="102" width="60" height="26" rx="6" fill="#171C24"/><path d="M96 128 L70 134 L58 134" stroke="#9AA4B2" stroke-width="6" fill="none" stroke-linecap="round"/>':'<path d="M120 104 L180 104 L166 126 L130 126Z" fill="#2A323D"/>'}<path d="M62 92 Q70 82 112 84 L116 94 L66 98Z" fill="#171C24"/><path d="M60 96 Q56 106 62 118" stroke="${col}" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M208 108 L222 62 M222 62 L236 56" stroke="#171C24" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M200 40 L230 40" stroke="#171C24" stroke-width="5" stroke-linecap="round"/><path d="M222 62 L214 44" stroke="#171C24" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="234" cy="${big?72:76}" r="${big?9:7}" fill="#FFE9A6"/>${big?'<path d="M196 56 Q214 50 230 58 L226 72 L202 70Z" fill="var(--win)"/>':''}`}
  return `<svg viewBox="0 0 320 170" role="img" aria-label="${esc(c.name)}"><ellipse cx="160" cy="160" rx="132" ry="8" fill="#000" opacity=".16"/>${body}<circle cx="84" cy="136" r="24" fill="#171C24"/><circle cx="84" cy="136" r="10" fill="#CBD3DD"/><circle cx="244" cy="136" r="24" fill="#171C24"/><circle cx="244" cy="136" r="10" fill="#CBD3DD"/>${ty==='Scooter'?'':'<path d="M244 136 L222 62" stroke="#9AA4B2" stroke-width="4" fill="none" stroke-linecap="round"/>'}</svg>`;
}
function motorFront(c){const col=esc(c.color||'#7D8794');return `<svg viewBox="0 0 320 170" role="img" aria-label="${esc(c.name)} front, illustration"><ellipse cx="160" cy="158" rx="70" ry="7" fill="#000" opacity=".16"/><rect x="150" y="112" width="20" height="44" rx="8" fill="#171C24"/><path d="M146 112 L150 66 L170 66 L174 112Z" fill="#9AA4B2"/><path d="M122 46 L198 46" stroke="#171C24" stroke-width="7" stroke-linecap="round"/><path d="M118 46 L112 38 M202 46 L208 38" stroke="#171C24" stroke-width="7" stroke-linecap="round"/><path d="M128 76 Q160 40 192 76 L186 100 L134 100Z" fill="${col}"/><circle cx="160" cy="82" r="13" fill="#FFE9A6"/><circle cx="160" cy="82" r="6" fill="#FFF6D6"/></svg>`}
function helmetSVG(c){const h=(x,col)=>`<g><path d="M${x} 112 Q${x} 56 ${x+42} 56 Q${x+84} 56 ${x+84} 112 L${x+84} 124 L${x} 124Z" fill="${col}"/><path d="M${x+30} 84 L${x+84} 84 L${x+84} 108 L${x+34} 108Z" fill="var(--win)"/></g>`;return `<svg viewBox="0 0 320 170" role="img" aria-label="${esc(c.name)} helmets, illustration"><rect width="320" height="170" fill="var(--win)"/><ellipse cx="160" cy="146" rx="120" ry="8" fill="#000" opacity=".14"/>${h(52,esc(c.color||'#7D8794'))}${h(184,'#171C24')}</svg>`}
const imgsOf=c=>(c.images&&c.images.length)?c.images.map((u,i)=>`<img src="${esc(u)}" alt="${esc(c.name)} photo ${i+1}" loading="lazy" decoding="async">`):(isMotor(c)?[motorSVG(c),motorFront(c),helmetSVG(c)]:[carSVG(c),frontSVG(c),interiorSVG(c)]);
const hasPhotos=c=>c.images&&c.images.length;

var PARTY={a:0,c:0,i:0,p:0},PMAX={a:12,c:12,i:5,p:5};
const BMOFF='<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>',BMON='<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>';
const S={place:null,kind:'all',type:'All',service:'any',seats:0,sel:null,pin:CENTER.slice(),moved:false,gi:0,gid:null};
const rad=x=>x*Math.PI/180;
const km=(a,b)=>{const R=6371,dLa=rad(b[0]-a[0]),dLo=rad(b[1]-a[1]),h=Math.sin(dLa/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dLo/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
const nearestArea=p=>Object.keys(AREAS).reduce((best,k)=>km(p,AREAS[k])<km(p,AREAS[best])?k:best,'City Proper');
const carPos=c=>{const a=(c.pos&&c.pos.length===2?c.pos:null)||AREAS[c.area]||CENTER,h=[...c.id].reduce((x,ch)=>(x*31+ch.charCodeAt(0))>>>0,7);return [a[0]+((h%100)/100-.5)*0.006,a[1]+(((h>>7)%100)/100-.5)*0.006]};
const distOf=c=>km(S.pin,carPos(c));
const activeCars=()=>allCars().filter(c=>c.status==='approved'&&c.active!==false);


/* dates */
const t1=new Date();t1.setDate(t1.getDate()+1);const t2=new Date();t2.setDate(t2.getDate()+3);
$('#from').value=iso(t1);$('#to').value=iso(t2);$('#from').min=iso(new Date());
if(SETTINGS.isSample)$('#sampleBanner').hidden=false;

/* ---------- map ---------- */
let map=null,pinMk=null,carLayer=null;
function fillAreas(){const sel=$('#areaSel'),cur=sel.value;sel.innerHTML='<option value="">'+esc(t('area.choose'))+'</option>'+Object.keys(AREAS).map(a=>`<option>${esc(a)}</option>`).join('');sel.value=cur}
function initMap(){
  fillAreas();
  if(typeof L==='undefined'){$('#map').innerHTML='<div class="empty" style="margin:12px">'+esc(t('map.fail'))+'</div>';return}
  map=L.map('map',{scrollWheelZoom:false}).setView(S.moved?S.pin:CENTER,S.moved?13:12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
  pinMk=L.marker(S.moved?S.pin:CENTER,{draggable:true,keyboard:true,title:t('map.drag'),icon:L.divIcon({className:'pin',html:'<span></span>',iconSize:[28,28],iconAnchor:[14,28]})}).addTo(map);
  pinMk.on('dragend',()=>{const p=pinMk.getLatLng();setPin([p.lat,p.lng],true)});
  map.on('click',e=>{pinMk.setLatLng(e.latlng);setPin([e.latlng.lat,e.latlng.lng],true)});
  carLayer=L.layerGroup().addTo(map);
}
function drawMarkers(list){
  if(!map)return;carLayer.clearLayers();
  list.forEach(c=>{const p=carPos(c),short=PREF.cur==='PHP'?(c.price>=1000?'₱'+(c.price/1000).toFixed(c.price%1000?1:0)+'k':'₱'+c.price):money(c.price);
    L.marker(p,{title:c.name,icon:L.divIcon({className:'cm',html:`<b>${esc(short)}</b>`,iconSize:[60,22],iconAnchor:[30,11]})}).on('click',()=>openDetail(c.id)).addTo(carLayer)});
}
function placeName(){return S.place?S.place.name:nearestArea(S.pin)}
function setPin(p,moved,place){
  S.pin=p;if(moved)S.moved=true;if(place!==undefined)S.place=place;else if(moved)S.place=null;
  const a=placeName();$('#pininfo').innerHTML=S.moved?t('pin.set',{area:'<b>'+esc(a)+'</b>',lat:p[0].toFixed(4),lng:p[1].toFixed(4)}):esc(t('pin.hint'));
  $('#areaSel').value=S.moved?nearestArea(p):'';renderGrid();
  const fn=$('#farnote');if(fn){const cars=activeCars();const m=cars.length?Math.min(...cars.map(distOf)):0;fn.hidden=!(S.moved&&m>25);if(!fn.hidden)fn.textContent=t('pin.far',{p:a,k:Math.round(m)})}
  if(typeof syncBar==='function')syncBar();
}
$('#areaSel').addEventListener('change',e=>{const a=e.target.value;if(!a)return;const p=AREAS[a];if(map){pinMk.setLatLng(p);map.setView(p,13)}setPin(p.slice(),true)});
$('#locate').addEventListener('click',()=>{
  if(!navigator.geolocation){toast(t('loc.na'));return}
  navigator.geolocation.getCurrentPosition(pos=>{const p=[pos.coords.latitude,pos.coords.longitude];if(map){pinMk.setLatLng(p);map.setView(p,14)}setPin(p,true,{name:t('where.cur')})},()=>toast(t('loc.off')),{timeout:8000});
});

/* ---------- vehicles ---------- */
function renderTypes(){
  const all=activeCars(),hasM=all.some(isMotor),hasC=all.some(c=>!isMotor(c));
  const kb=$('#kinds');
  if(kb){kb.hidden=!(hasM&&hasC);kb.innerHTML=[['all','k.all'],['car','k.car'],['motor','k.motor']].map(k=>`<button type="button" class="chip" data-kind="${k[0]}" aria-pressed="${k[0]===S.kind}">${esc(t(k[1]))}</button>`).join('')}
  const pool=all.filter(c=>S.kind==='all'||(S.kind==='motor')===isMotor(c));
  const types=['All',...new Set(pool.map(c=>c.type))];
  if(!types.includes(S.type))S.type='All';
  $('#types').innerHTML=types.map(x=>`<button type="button" class="chip" data-type="${esc(x)}" aria-pressed="${x===S.type}">${esc(x==='All'?t('all'):x)}</button>`).join('');
  const sf=$('#subf');if(sf){const kb2=$('#kinds'),on=kb2&&!kb2.hidden&&kb2.querySelector('[aria-pressed="true"]');sf.classList.toggle('nonotch',!on);if(on){const r=on.getBoundingClientRect(),w=kb2.getBoundingClientRect();sf.style.setProperty('--nx',Math.round(r.left-w.left+r.width/2)+'px')}}
}
function filtered(){
  const l=activeCars().filter(c=>(S.kind==='all'||(S.kind==='motor')===isMotor(c))&&(S.type==='All'||c.type===S.type)&&(S.service==='any'||c.service===S.service)&&c.seats>=S.seats);
  const ok=l.filter(c=>!unavailable(c));S.hidden=l.length-ok.length;
  return ok.sort((a,b)=>S.moved?distOf(a)-distOf(b):a.price-b.price);
}
const depositOf=c=>{const d=c&&c.specs&&c.specs.deposit;return (d!=null&&d!=='')?+d:SETTINGS.deposit[isMotor(c)?'motor':'car']};
let TIME='',PTL='';
const splitName=n=>{n=String(n||'').trim();const k=n.indexOf(' ');return k<0?[n,'']:[n.slice(0,k),n.slice(k+1).trim()]};
const userFL=u=>u?((u.first||u.last)?[u.first||'',u.last||'']:splitName(u.name)):['',''];
const mark=el=>{if(!el)return;el.classList.add('bad');el.addEventListener('input',()=>el.classList.remove('bad'),{once:true});try{el.focus()}catch(x){}};
const tl=v=>{if(!v)return '';const [h,m]=v.split(':').map(Number);return ((h%12)||12)+':'+String(m).padStart(2,'0')+' '+(h<12?'AM':'PM')};
const TSLOTS=(()=>{const o=[];for(let h=0;h<24;h++)for(const m of [0,30])o.push(String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'));return o})();
const GAP=(SETTINGS.turnaroundHours||3)*60,mins=v=>{const [h,m]=v.split(':').map(Number);return h*60+m};
const XRATE=SETTINGS.extraHourRate||0.2,XMAX=SETTINGS.maxExtraHours||4;
let EXTRA=0;
const fromMin=n=>String(Math.floor(n/60)%24).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
const hourlyOf=c=>c?(+c.hourly>0?Math.round(+c.hourly):Math.round(c.price*XRATE)):0;
const extraFee=(c,h)=>c&&h?Math.min(c.price,hourlyOf(c)*h):0;
const durTxt=d=>t(d===1?'cal.d1':'cal.dn',{d})+(EXTRA?' + '+EXTRA+' h · '+t('time.total',{h:d*24+EXTRA}):'');
const endTime=(time,h)=>time?fromMin(mins(time)+(h||0)*60):'';
const tlx=()=>tl(TIME)+(EXTRA?' +'+EXTRA+' h':'');
/* a vehicle needs a break between two rentals: pickup at least GAP after the last return (including its extra hours), return at least GAP before the next pickup */
function gapIssue(id,a,b,time,extra){
  extra=extra||0;if(!id||!a||!b||!time)return null;const m=mins(time);
  if(m+extra*60>=1440)return {k:'mid'};
  for(const r of ST.requests){if(r.carId!==id||!r.time||!(r.status==='confirmed'||r.status==='completed'))continue;
    if(r.to===a){const e=mins(r.time)+(r.extraH||0)*60+GAP;if(m<e)return e>=1440?{k:'none'}:{k:'early',t:tl(fromMin(e))}}
    if(r.from===b){const l=mins(r.time)-GAP;if(m+extra*60>l)return l<0?{k:'none'}:{k:'late',t:tl(fromMin(l))}}}
  return null}
const gapMsg=g=>g?t('gap.'+g.k,{t:g.t||'',h:SETTINGS.turnaroundHours||3}):'';
/* ---------- shared pickup time + extra hours boxes: type, or pick from a small dropdown ---------- */
function parseTime(s){s=String(s||'').trim().toLowerCase().replace(/\./g,'');if(!s)return '';
  const m=s.match(/^(\d{1,2}):?(\d{2})?\s*(a|p|am|pm)?$/);if(!m)return null;
  let h=+m[1],mi=m[2]?+m[2]:0;const ap=m[3];
  if(mi!==0&&mi!==30)return null;
  if(ap){if(h<1||h>12)return null;h=h%12+(ap[0]==='p'?12:0)}else if(h>23)return null;
  return String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0')}
function parseExtra(s){s=String(s||'').trim().toLowerCase().replace(/\s*h(rs?|ours?)?$/,'');if(!s||s==='none'||s==='wala')return 0;if(!/^\d+$/.test(s))return null;const n=+s;return n>XMAX?null:n}
const teId=sc=>sc==='d'?S.gid:S.sel;
const teInner=()=>`<div class="terow"><label class="tefld"><span class="lab">${esc(t('f.time'))}</span><input class="tin" data-tin="time" type="text" inputmode="text" autocomplete="off" spellcheck="false" placeholder="${esc(t('tin.time.ph'))}"><div class="tdd" hidden role="listbox"></div></label><label class="tefld"><span class="lab">${esc(t('f.extra'))}</span><input class="tin" data-tin="extra" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="${esc(t('extra.none'))}"><div class="tdd" hidden role="listbox"></div></label></div><p class="note terr" role="status" hidden></p><p class="note tenote"></p><p class="note tetot"></p>`;
const teBox=sc=>`<div class="tebox" data-te="${sc}" data-lang="${PREF.lang}">${teInner()}</div>`;
function teSync(){
  const a=$('#from').value,b=$('#to').value,d=(a&&b)?days(a,b):0;
  document.querySelectorAll('.tebox').forEach(bx=>{
    if(bx.dataset.lang!==PREF.lang){bx.innerHTML=teInner();bx.dataset.lang=PREF.lang}
    const id=teId(bx.dataset.te),c=allCars().find(x=>x.id===id),ti=bx.querySelector('[data-tin=time]'),xi=bx.querySelector('[data-tin=extra]');
    if(document.activeElement!==ti){ti.value=TIME?tl(TIME):'';ti.classList.remove('bad')}
    if(document.activeElement!==xi){xi.value=EXTRA?EXTRA+' h':'';xi.classList.remove('bad')}
    const gm=(TIME&&mins(TIME)+EXTRA*60>=1440)?gapMsg({k:'mid'}):(id&&d>=1&&TIME)?gapMsg(gapIssue(id,a,b,TIME,EXTRA)):'',er=bx.querySelector('.terr'),msg=bx.dataset.bad||gm;
    er.hidden=!msg;er.textContent=msg;
    bx.querySelector('.tenote').textContent=c?t('time.xnote2',{p:money(hourlyOf(c))}):t('time.xnote',{p:Math.round(XRATE*100),n:Math.round(1/XRATE)});
    bx.querySelector('.tetot').textContent=(d>=1&&TIME)?t('time.ex',{a:fmtS(a),b:fmtS(b),t:tl(TIME),r:tl(endTime(TIME,EXTRA))})+(EXTRA?' · '+durTxt(d):''):t('time.rule')})}
function teDD(inp){
  const bx=inp.closest('.tebox'),dd=inp.nextElementSibling,id=teId(bx.dataset.te),a=$('#from').value,b=$('#to').value,dated=id&&a&&b&&days(a,b)>=1,q=inp.value.trim().toLowerCase().replace(/[\s:.]/g,'');
  let opts=[];
  if(inp.dataset.tin==='time'){
    opts=TSLOTS.filter(v=>!q||tl(v).toLowerCase().replace(/[\s:]/g,'').startsWith(q)||v.replace(':','').startsWith(q)).map(v=>({v,l:tl(v),on:v===TIME,off:dated&&!!gapIssue(id,a,b,v,EXTRA)}));
  }else{for(let x=0;x<=XMAX;x++)opts.push({v:String(x),l:x?x+' h':t('extra.none'),on:x===EXTRA,off:!!(x&&dated&&TIME&&gapIssue(id,a,b,TIME,x))})}
  dd.innerHTML=opts.length?opts.map(o=>`<button type="button" class="tdo${o.on?' on':''}" role="option" data-tpick="${inp.dataset.tin}" data-v="${o.v}"${o.off?' disabled':''}>${esc(o.l)}</button>`).join(''):`<p class="note" style="margin:6px 10px">${esc(t('tin.time.bad'))}</p>`;
  dd.hidden=false;const on=dd.querySelector('.tdo.on');if(on&&!q)dd.scrollTop=Math.max(0,on.offsetTop-60)}
function teHide(inp){const dd=inp.nextElementSibling;if(dd)dd.hidden=true}
function teCommit(inp){
  const bx=inp.closest('.tebox'),k=inp.dataset.tin;let ok=true;delete bx.dataset.bad;inp.classList.remove('bad');
  if(k==='time'){const v=parseTime(inp.value);if(v===null){ok=false;bx.dataset.bad=t('tin.time.bad');setTime('')}else setTime(v)}
  else{const h=parseExtra(inp.value);if(h===null){ok=false;bx.dataset.bad=t('tin.extra.over',{n:XMAX})}else setExtra(h)}
  if(!ok)inp.classList.add('bad');teSync();return ok}
document.addEventListener('focusin',e=>{const i=e.target.closest&&e.target.closest('.tin');if(i){i.select&&i.select();teDD(i)}});
document.addEventListener('input',e=>{const i=e.target.closest&&e.target.closest('.tin');if(i)teDD(i)});
document.addEventListener('focusout',e=>{const i=e.target.closest&&e.target.closest('.tin');if(i){teHide(i);teCommit(i)}});
document.addEventListener('keydown',e=>{const i=e.target.closest&&e.target.closest('.tin');if(!i)return;
  if(e.key==='Enter'){e.preventDefault();const first=i.nextElementSibling.querySelector('.tdo:not(:disabled)');if(i.value.trim()&&parseTime(i.value)===null&&i.dataset.tin==='time'&&first)i.value=first.textContent;teHide(i);teCommit(i);if(i.dataset.tin==='time'){const x=i.closest('.tebox').querySelector('[data-tin=extra]');if(x)x.focus()}else i.blur()}
  else if(e.key==='Escape')teHide(i)});
document.addEventListener('mousedown',e=>{if(e.target.closest&&e.target.closest('.tdd'))e.preventDefault()});
document.addEventListener('click',e=>{const p=e.target.closest&&e.target.closest('[data-tpick]');if(!p||p.disabled)return;
  const bx=p.closest('.tebox');delete bx.dataset.bad;if(p.dataset.tpick==='time')setTime(TSLOTS.includes(p.dataset.v)?p.dataset.v:'');else setExtra(+p.dataset.v);
  const i=p.closest('.tefld').querySelector('.tin');i.value=p.textContent;i.classList.remove('bad');p.parentElement.hidden=true;i.blur();teSync()});
function setExtra(h){EXTRA=Math.max(0,Math.min(XMAX,+h||0));syncBar();calSum();renderGrid()}
function setTime(v){TIME=v||'';syncBar();calSum();renderGrid()}
const dateNow=()=>{const a=$('#from').value,b=$('#to').value;return {a,b,d:(a&&b)?days(a,b):0}};
/* ---------- availability calendar ---------- */
const addD=(s,n)=>{const [y,m,d]=s.split('-').map(Number);return iso(new Date(y,m-1,d+n))};
const todayIso=()=>iso(new Date());
const busyRanges=id=>{const o=[];ST.requests.forEach(r=>{if(r.carId===id&&(r.status==='confirmed'||r.status==='completed'))o.push({from:r.from,to:r.to,k:'booked'})});((typeof BLOCKED!=='undefined'&&BLOCKED&&BLOCKED[id])||[]).forEach(x=>{if(x&&x[0]&&x[1])o.push({from:x[0],to:addD(x[1],1),k:'arkila'})});return o};
const dayInfo=(id,s)=>{for(const r of busyRanges(id))if(s>=r.from&&s<r.to)return r.k;return (ST.blocks[id]||[]).includes(s)?'host':''};
const rangeFree=(id,a,b)=>{for(let d=a,n=0;d<b&&n<400;d=addD(d,1),n++)if(dayInfo(id,d))return false;return true};
const unavailable=c=>{const {a,b}=dateNow();if(!a||!b||days(a,b)<1)return false;return !rangeFree(c.id,a,b)||!!gapIssue(c.id,a,b,TIME)};
const CAL={};
function calInner(key,id,mode,nm){
  const pick=mode==='pick',a=pick?$('#from').value:'',b=pick?$('#to').value:'',loc=LOCALE[PREF.lang]||'en-PH',tdy=todayIso();
  if(!CAL[key]){const base=a?new Date(a+'T00:00:00'):new Date();CAL[key]={y:base.getFullYear(),m:base.getMonth()}}
  const st=CAL[key];
  let lim='';if(pick&&a&&!b){for(let d=a,n=0;n<400;d=addD(d,1),n++)if(dayInfo(id,d)){lim=d;break}}
  const month=(yy,mm)=>{const first=new Date(yy,mm,1),dim=new Date(yy,mm+1,0).getDate();
  let cells='';for(let i=0;i<first.getDay();i++)cells+='<i></i>';
  for(let d=1;d<=dim;d++){
    const s=yy+'-'+String(mm+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),k=dayInfo(id,s);
    let cls='cd',dis=false,lab=fmt(s);
    if(s<tdy){cls+=' past';dis=true}
    else if(pick){
      if(k){cls+=' off';dis=true;lab+=', '+t('cal.off');if(a&&!b&&s===lim&&s>a){dis=false;lab+=', '+t('cal.ret')}}
      else if(a&&!b&&s>a&&lim&&s>lim){cls+=' far';dis=true}
    }else{
      if(k==='booked'){cls+=' booked';dis=true;lab+=', '+t('cal.booked')}
      else if(k==='arkila'){cls+=' arkila';dis=true;lab+=', '+t('cal.arkblock')}
      else if(k==='host'){cls+=' host';lab+=', '+t('cal.hostblock')}
    }
    if(pick&&!dis||pick&&cls.includes('off')){if(s===a||s===b)cls+=' sel';else if(a&&b&&s>a&&s<b)cls+=' in'}
    cells+=`<button type="button" class="${cls}" data-cal-day="${s}"${dis?' disabled':''} aria-label="${esc(lab)}">${d}</button>`;
  }
  return {first,cells}};
  const N=nm||1,blocks=[];for(let i=0;i<N;i++){const d=new Date(st.y,st.m+i,1);blocks.push(month(d.getFullYear(),d.getMonth()))}
  const first=blocks[0].first,cells=blocks[0].cells;
  const wk=[0,1,2,3,4,5,6].map(i=>`<span>${esc(new Date(2023,0,1+i).toLocaleDateString(loc,{weekday:'short'}))}</span>`).join('');
  const leg=pick?`<span><i class="lf"></i>${esc(t('cal.free'))}</span><span><i class="lo"></i>${esc(t('cal.off'))}</span><span><i class="ls"></i>${esc(t('cal.sel'))}</span>`:`<span><i class="lf"></i>${esc(t('cal.free'))}</span><span><i class="lb"></i>${esc(t('cal.booked'))}</span><span><i class="lh"></i>${esc(t('cal.hostblock'))}</span><span><i class="la"></i>${esc(t('cal.arkblock'))}</span>`;
  if(N>1){const now=new Date(),atNow=pick&&st.y===now.getFullYear()&&st.m===now.getMonth();
    return `<div class="calx"><button type="button" class="cnav prev" data-cal-nav="-1" aria-label="${esc(t('cal.prev'))}"${atNow?' disabled':''}>‹</button><button type="button" class="cnav next" data-cal-nav="1" aria-label="${esc(t('cal.next'))}">›</button><div class="calmm">${blocks.map(bk=>`<div class="calmo"><b class="cmt">${esc(bk.first.toLocaleDateString(loc,{month:'long',year:'numeric'}))}</b><div class="calw">${wk}</div><div class="calg">${bk.cells}</div></div>`).join('')}</div></div><div class="calleg">${leg}${pick?`<button type="button" class="chip" data-cal-clear style="margin-left:auto;padding:2px 10px;font-size:12px">${esc(t('cal.clear'))}</button>`:''}</div>`}
  return `<div class="calh"><button type="button" data-cal-nav="-1" aria-label="${esc(t('cal.prev'))}">‹</button><b>${esc(first.toLocaleDateString(loc,{month:'long',year:'numeric'}))}</b><button type="button" data-cal-nav="1" aria-label="${esc(t('cal.next'))}">›</button></div><div class="calw">${wk}</div><div class="calg">${cells}</div><div class="calleg">${leg}${pick?`<button type="button" class="chip" data-cal-clear style="margin-left:auto;padding:2px 10px;font-size:12px">${esc(t('cal.clear'))}</button>`:''}</div>`;
}
function setDates(a,b){const f=$('#from'),r=$('#to');f.value=a;r.value=b;[f,r].forEach(x=>x.dispatchEvent(new Event('change',{bubbles:true})))}
function calSum(){teSync();const dt=$('#dtot');if(dt){const a0=$('#from').value,b0=$('#to').value,d0=(a0&&b0)?days(a0,b0):0;dt.textContent=d0>=1?durTxt(d0)+(EXTRA?' · '+money(extraFee(allCars().find(x=>x.id===S.gid),EXTRA))+' '+t('time.forx'):''):''}const el=$('#calsum');if(!el)return;const a=$('#from').value,b=$('#to').value;el.textContent=(a&&b&&days(a,b)>=1)?fmt(a)+' → '+fmt(b)+' · '+t(days(a,b)===1?'cal.d1':'cal.dn',{d:days(a,b)})+(EXTRA?' + '+EXTRA+' h':''):a?t('cal.pickret'):t('cal.pickstart')}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-cal-day],[data-cal-nav],[data-cal-clear]');if(!b)return;
  const el=b.closest('.cal');if(!el)return;const key=el.dataset.key,id=el.dataset.car,mode=el.dataset.mode;
  if(b.dataset.calNav){const d=new Date(CAL[key].y,CAL[key].m+ +b.dataset.calNav,1);CAL[key]={y:d.getFullYear(),m:d.getMonth()}}
  else if(b.dataset.calClear!==undefined){setDates('','')}
  else if(mode==='pick'){const s=b.dataset.calDay,a=$('#from').value,r=$('#to').value;if(!a||r||s<=a)setDates(s,'');else setDates(a,s)}
  else if(typeof hostDay==='function')hostDay(id,b.dataset.calDay);
  el.innerHTML=calInner(key,id,mode,+el.dataset.n||1);if(mode==='pick')calSum();
});
function cardHtml(c){
  const {d}=dateNow(),rt=ratingOf(c),un=unavailable(c),fav=ST.favs.includes(c.id);
  return `<article class="card${S.sel===c.id?' sel':''}${un?' off':''}"><button type="button" class="cardbtn" data-open="${esc(c.id)}">
    <div class="tile">${imgsOf(c)[0]}<span class="area">${esc(c.area)}</span><span class="svc">${esc(svcT(c.service))}</span>${S.sel===c.id?'<span class="chosen">'+esc(t('card.chosen'))+'</span>':''}${un?'<span class="chosen" style="background:var(--ink);color:var(--bg)">'+esc(t('card.booked'))+'</span>':''}</div>
    <div class="cb"><div class="row2" style="align-items:baseline"><h3>${esc(c.name)}</h3><span class="rt">${rt?'★ '+rt.avg.toFixed(1)+' <small>('+rt.n+')</small>':'<small>'+esc(t('card.new'))+'</small>'}</span></div>
    <p class="sub">${esc(c.type)} · ${esc(seatsLabel(c))}${S.moved?' · '+esc(t('card.km',{k:distOf(c).toFixed(1)})):''}</p>
    <p class="pr">${d>=1?`<b>${esc(money(c.price))}</b><span>${esc(t(d===1?'card.pd1':'card.pdN',{d,tot:money(c.price*d+extraFee(c,EXTRA))}))}</span>`:`<b>${esc(money(c.price))}</b><span>${esc(t('card.perday'))}</span>`}</p><p class="xh">${esc(t('card.xhr',{p:money(hourlyOf(c))}))}</p></div></button>
    <button type="button" class="heart${fav?' on':''}" data-fav="${esc(c.id)}" aria-pressed="${fav}" aria-label="${esc(t(fav?'card.unsave':'card.save'))} ${esc(c.name)}">${fav?BMON:BMOFF}</button></article>`;
}
function renderGrid(){
  const list=filtered();
  $('#count').textContent=t(list.length===1?'count.1':'count.n',{n:list.length})+t(S.moved?'nearest':'cheapest')+(S.hidden?t('count.hid',{n:S.hidden}):'');
  $('#grid').innerHTML=list.length?list.map(cardHtml).join(''):'<div class="empty">'+esc(t(S.hidden?'empty.booked':'empty'))+'</div>';
  drawMarkers(list);quote();
}
$('#svc').addEventListener('change',e=>{S.service=e.target.value;renderGrid()});
$('#seats').addEventListener('change',e=>{S.seats=+e.target.value;renderGrid()});

/* ---------- detail dialog ---------- */
const dlg=$('#dlg');
function openDetail(id){
  const c=allCars().find(x=>x.id===id);if(!c)return;S.gid=id;S.gi=0;
  delete CAL.d;const sp=c.specs||{},mo=isMotor(c),rows=(mo?[['sp.year',sp.year],['sp.trans',sp.transmission],['sp.cc',sp.cc?sp.cc+' cc':''],['sp.fuel',sp.fuel],['sp.riders',c.seats],['sp.helmets',sp.helmets],['sp.mileage',sp.mileage],['sp.secdep',sp.deposit?money(sp.deposit):''],['sp.service',svcT(c.service)],['sp.area',c.area]]:[['sp.year',sp.year],['sp.trans',sp.transmission],['sp.fuel',sp.fuel],['sp.seats',c.seats],['sp.lug',sp.bags!=null?t('bags',{n:sp.bags}):''],['sp.aircon',sp.aircon],['sp.service',svcT(c.service)],['sp.area',c.area]]).filter(r=>r[1]!==''&&r[1]!=null);
  const good=`<details class="more gtk"${innerWidth>=900?' open':''}><summary><span>${esc(t('d.good'))}</span></summary><ul class="rules"><li>${esc(t('r.hours'))}</li><li>${esc(t('r.gap',{h:SETTINGS.turnaroundHours||3}))}</li><li>${esc(t('r.extra',{n:XMAX,p:Math.round(XRATE*100)}))}</li><li>${esc(t('r.deposit'))}</li><li>${esc(t('r.secdep',{amt:money(depositOf(c))}))}</li>${mo?`<li>${esc(t('r.mlicense'))}</li><li>${esc(t('r.helmet'))}</li>`:`<li>${esc(t(c.service==='Self-drive'?'r.license':'r.driver'))}</li>`}<li>${esc(t('r.fuel'))}</li><li>${esc(SETTINGS.cancellation)}</li></ul></details>`;
  const avail=c.status==='approved'?`<div class="avd2"><button type="button" class="avbtn" data-avopen aria-haspopup="dialog"><span class="avt">${esc(t('cal.title'))}</span><small id="calsum"></small><span class="chev" aria-hidden="true">▾</span></button><div class="avpop" id="avpop" hidden role="dialog" aria-label="${esc(t('cal.title'))}"><button type="button" class="x" data-avx aria-label="Close">×</button><h3 class="h3" style="margin-top:0">${esc(t('cal.title'))}</h3><div class="cal" id="cal-d" data-key="d" data-car="${esc(c.id)}" data-mode="pick">${calInner('d',c.id,'pick')}</div>${teBox('d')}<p class="note" id="dtot" style="margin:8px 0 0"></p><button type="button" class="btn" data-avx style="width:100%;margin-top:10px">${esc(t('time.done'))}</button></div></div>`:'';
  const cta=c.status!=='approved'?'<p class="note">'+esc(t('d.preview'))+'</p>':unavailable(c)?'<p class="err">'+esc(gapMsg(gapIssue(c.id,$('#from').value,$('#to').value,TIME))||t('d.booked'))+'</p>':`<div class="stack"><button type="button" class="btn" data-choose="${esc(c.id)}">${esc(t('d.choose'))}</button></div>`;
  $('#dbody').innerHTML=`<div class="dhero"><div class="gal"><div class="stage" id="stage"></div><button type="button" class="nav prev" data-g="-1" aria-label="${esc(t('g.prev'))}">‹</button><button type="button" class="nav next" data-g="1" aria-label="${esc(t('g.next'))}">›</button></div>
  <div class="thumbs" id="thumbs"></div><p class="gnote" id="galnote"></p></div>
  <div class="dmain">${c.ownerName?`<p class="note" style="margin:0">${esc(t('d.hosted',{name:c.ownerName}))}</p>`:''}<div class="dhead"><div><h2 id="dtitle">${esc(c.name)}</h2><p class="sub">${esc(c.type)} · ${esc(seatsLabel(c))} · ${esc(svcT(c.service))}${S.moved?' · '+esc(t('kmpin',{k:distOf(c).toFixed(1)})):''}</p></div><div><p class="pr big"><b>${esc(money(c.price))}</b><span>${esc(t('card.perday'))}</span></p><p class="xh">${esc(t('card.xhr',{p:money(hourlyOf(c))}))}</p><button type="button" class="chip" data-fav="${esc(c.id)}" style="margin-top:6px">${esc(t(ST.favs.includes(c.id)?'d.saved':'d.save'))}</button></div></div>
  <div class="dcols"><div class="dleft">
  ${c.description?`<h3 class="h3">${esc(t('d.desc'))}</h3><div class="descw"><p class="desc clamp" id="dtxt">${esc(c.description)}</p><button type="button" class="lnk" data-descmore id="dmore" hidden>${esc(t('d.more'))}</button><div class="dpop" id="dpop" hidden role="dialog" aria-label="${esc(t('d.desc'))}"><button type="button" class="x" data-descx aria-label="Close">×</button><h3 class="h3" style="margin-top:0">${esc(c.name)}</h3><p class="desc">${esc(c.description)}</p></div></div>`:''}
  <h3 class="h3">${esc(t('d.details'))}</h3><dl class="specs">${rows.map(r=>`<div><dt>${esc(t(r[0]))}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl>
  ${(c.features&&c.features.length)?`<h3 class="h3">${esc(t('d.features'))}</h3><div class="feat">${c.features.map(f=>`<span class="pill">${esc(f)}</span>`).join('')}</div>`:''}
  <h3 class="h3">${esc(t('d.reviews'))}</h3>${reviewBlock(c)}</div>
  <div class="dright">${avail}${good}${cta}</div></div></div>`;
  renderGallery();calSum();if(!dlg.open)dlg.showModal();{const tx=$('#dtxt'),mb=$('#dmore');if(tx&&mb)mb.hidden=!(tx.scrollHeight>tx.clientHeight+1)}
}
function renderGallery(){
  const c=allCars().find(x=>x.id===S.gid),im=imgsOf(c);S.gi=(S.gi+im.length)%im.length;
  $('#stage').innerHTML=im[S.gi];
  $('#thumbs').innerHTML=im.map((h,i)=>`<button type="button" class="th${i===S.gi?' on':''}" data-gi="${i}" aria-label="${esc(t('g.photo',{i:i+1,n:im.length}))}">${h}</button>`).join('');
  $('#galnote').textContent=hasPhotos(c)?t('g.photo',{i:S.gi+1,n:im.length}):t('g.sample',{i:S.gi+1,n:im.length});
}
dlg.addEventListener('click',e=>{
  if(e.target===dlg){dlg.close();return}
  const g=e.target.closest('[data-g]'),th=e.target.closest('[data-gi]'),ch=e.target.closest('[data-choose]');
  if(e.target.closest('[data-avopen]')){const p=$('#avpop');p.hidden=!p.hidden;if(!p.hidden)teSync();return}
  if(e.target.closest('[data-avx]')){$('#avpop').hidden=true;return}
  {const p=$('#avpop');if(p&&!p.hidden&&!e.target.closest('#avpop'))p.hidden=true}
  if(e.target.closest('[data-descmore]')){const p=$('#dpop');p.hidden=!p.hidden;return}
  if(e.target.closest('[data-descx]')){$('#dpop').hidden=true;return}
  {const p=$('#dpop');if(p&&!p.hidden&&!e.target.closest('#dpop'))p.hidden=true}
  if(e.target.closest('[data-close]')){dlg.close();return}
  if(g){S.gi+=+g.dataset.g;renderGallery()}
  else if(th){S.gi=+th.dataset.gi;renderGallery()}
  else if(ch){S.sel=ch.dataset.choose;dlg.close();renderGrid();$('#s3').scrollIntoView({behavior:'smooth',block:'start'})}
});
dlg.addEventListener('cancel',e=>{for(const id of ['#avpop','#dpop']){const p=$(id);if(p&&!p.hidden){e.preventDefault();p.hidden=true;return}}});
dlg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){S.gi--;renderGallery()}else if(e.key==='ArrowRight'){S.gi++;renderGallery()}});

/* ---------- filters, request ---------- */
document.addEventListener('click',e=>{
  const x=e.target.closest('[data-type]'),o=e.target.closest('[data-open]');
  const kd=e.target.closest('[data-kind]');
  if(kd){S.kind=kd.dataset.kind;S.type='All';renderTypes();renderGrid();return}
  if(x){S.type=x.dataset.type;renderTypes();renderGrid()}else if(o)openDetail(o.dataset.open);
});
let LASTQ=null;
let GAPMSG='';
function quote(){
  GAPMSG='';
  const c=allCars().find(x=>x.id===S.sel),a=$('#from').value,b=$('#to').value;
  $('#datesum').textContent=(a&&b&&days(a,b)>=1)?t('datesum',{a:fmt(a),b:fmt(b),d:days(a,b)}):t('datesum.none');
  $('#chosen').innerHTML=c?`<span class="lab">${esc(t('chosenlab'))}</span><div class="row2"><b>${esc(c.name)}</b><button type="button" class="chip" data-open="${esc(c.id)}">${esc(t('viewd'))}</button></div>`:'<span class="note">'+esc(t('pickfirst'))+'</span>';
  if(!c||!a||!b||days(a,b)<1||a<iso(new Date())){$('#quote').innerHTML=c?'<span class="note">'+esc(t(a&&a<iso(new Date())?'retpast':'retbefore'))+'</span>':'';LASTQ=null;setTimeout(updateBar,0);return null}
  const gi=gapIssue(c.id,a,b,TIME,EXTRA);if(gi){GAPMSG=gapMsg(gi);$('#quote').innerHTML='<span class="note">'+esc(GAPMSG)+'</span>';LASTQ=null;setTimeout(updateBar,0);return null}
  const d=days(a,b),xf=extraFee(c,EXTRA),total=c.price*d+xf,dep=depositOf(c);
  $('#quote').innerHTML=`<div><span>${esc(t('q.line',{p:money(c.price),d}))}</span><span>${esc(money(c.price*d))}</span></div>${xf?`<div><span>${esc(t('q.extra',{h:EXTRA}))}</span><span>${esc(money(xf))}</span></div>`:''}${TIME?`<div><span>${esc(t('q.time'))}</span><span>${esc(tl(TIME))}${EXTRA?' / '+esc(tl(endTime(TIME,EXTRA))):''}</span></div>`:''}<div><span>${esc(t('q.dep'))}</span><span>${esc(money(dep))}</span></div><div class="t"><span>${esc(t('q.tot'))}</span><span>${esc(money(total+dep))}</span></div><p class="note" style="margin:6px 0 0">${esc(t('q.note'))}</p>`;
  LASTQ={c,a,b,d,total,dep,time:TIME,extra:EXTRA,xfee:xf};setTimeout(updateBar,0);return LASTQ;
}
['from','to'].forEach(id=>$('#'+id).addEventListener('change',()=>{const a=$('#from').value;if(a)$('#to').min=a;renderGrid()}));
let MSG='';
$('#f').addEventListener('submit',e=>{
  e.preventDefault();const err=$('#err');err.textContent='';
  if(!ST.me()){openLogin(t('l.needreq'));return}
  const q=quote(),fnv=$('#fn').value.trim(),lnv=$('#ln').value.trim(),name=(fnv+' '+lnv).trim(),phone=fullPhone(),email=$('#email').value.trim(),code=$('#code').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,''),notes=$('#notes').value.trim();
  if(!q){err.textContent=GAPMSG||t('e.pick');return}
  if(!TIME){err.textContent=t('e.time');mark($('#tebox-f [data-tin=time]'));return}
  if(unavailable(q.c)){err.textContent=t('e.unavail');return}
  if(fnv.length<2){err.textContent=t('e.fname');mark($('#fn'));return}
  if(lnv.length<2){err.textContent=t('e.lname');mark($('#ln'));return}
  if(ST.requests.some(r=>r.guestId===ST.me().id&&r.carId===q.c.id&&r.from===q.a&&r.to===q.b&&(r.status==='new'||r.status==='confirmed'))){err.textContent=t('e.dup');return}
  if(!/^\+?\d{8,15}$/.test(phone)){err.textContent=t('e.phone');mark($('#phone'));return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){err.textContent=t('e.email');mark($('#email'));return}
  if(!$('#ack').checked){err.textContent=t('e.ack');mark($('#ack'));return}
  const area=placeName(),spot=S.moved?`near ${area}, https://www.google.com/maps?q=${S.pin[0].toFixed(5)},${S.pin[1].toFixed(5)}`:'to be agreed on chat';
  MSG=`Hi ${BRAND.name}, I would like to request a vehicle.\n\nVehicle: ${q.c.name} (${q.c.service}, ${q.c.area})\nPickup: ${fmtEn(q.a)}, ${tl(TIME)}\nReturn: ${fmtEn(q.b)}, ${tl(endTime(TIME,q.extra))} (${q.d} day${q.d>1?'s':''} of 24 hours${q.extra?' + '+q.extra+' extra hour'+(q.extra>1?'s':''):''})\nPickup spot: ${spot}\nRental fee: ${php(q.total)}${q.xfee?' (includes '+php(q.xfee)+' for extra hours)':''}\nRefundable security deposit: ${php(q.dep)}\nTotal to pay online after the owner confirms: ${php(q.total+q.dep)}${partyText()?'\nGuests: '+partyText():''}\nName: ${name}\nMobile: ${phone}\nEmail (for the invoice and booking confirmation): ${email}${code?'\nReferral code: '+code:''}${notes?'\nNotes: '+notes:''}\nI have read and agree to the renter notice.\n\nRequest ref: ${q.c.id}|${q.a}|${q.b}|${phone}${code?'|'+code:''}`;
  const rq=saveRequest(q,name,phone,notes,spot,MSG,email);
  lss('contact',{name,first:fnv,last:lnv,phone,email});
  $('#msg').textContent=MSG;$('#out').hidden=false;$('#reqnote').textContent=t('reqnote',{id:rq.id});$('#out').scrollIntoView({behavior:'smooth',block:'start'});
  const fb=$('#fb');let copied=false;
  try{if(navigator.clipboard)navigator.clipboard.writeText(MSG).catch(()=>{});copied=!!navigator.clipboard}catch(x){}
  if(BRAND.fb){const u='https://m.me/'+encodeURIComponent(BRAND.fb);fb.href=u;fb.setAttribute('aria-disabled','false');$('#fbnote').textContent=copied?t('fb.auto'):t('fb.on');try{window.open(u,'_blank','noopener')}catch(x){}}
  else{fb.setAttribute('aria-disabled','true');fb.removeAttribute('href');$('#fbnote').textContent=BRAND.phone?t('fb.offc',{c:BRAND.phone}):t('fb.off')}
  updateBar()
});
$('#copy').addEventListener('click',()=>{
  (navigator.clipboard?navigator.clipboard.writeText(MSG):Promise.reject()).then(()=>toast(t('copied'))).catch(()=>{const r=document.createRange();r.selectNodeContents($('#msg'));const s=getSelection();s.removeAllRanges();s.addRange(r);toast(t('copyfail'))});
});
/* the map library loads after the page is showing, so first paint is fast */
function loadLeaflet(cb){if(window.L)return cb();let n=2;const done=()=>{if(--n===0)cb()};
  const l=document.createElement('link');l.rel='stylesheet';l.href='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';l.onload=l.onerror=done;document.head.appendChild(l);
  const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';s.onload=done;s.onerror=()=>{const m=$('#map');if(m)m.innerHTML='<div class="empty" style="margin:12px">'+esc(t('map.fail'))+'</div>'};document.head.appendChild(s)}
let MAPREQ=false;
function ensureMap(){if(map||MAPREQ)return;MAPREQ=true;loadLeaflet(()=>{initMap();if(map){setPin(S.pin.slice(),S.moved,S.place?{name:S.place.name}:undefined);drawMarkers(filtered())}})}
fillAreas();renderTypes();setPin(CENTER.slice(),false);
(window.requestIdleCallback||(f=>setTimeout(f,400)))(()=>{if(innerWidth>=1000||window.L)ensureMap()},{timeout:1500});
function refreshHome(){renderTypes();renderGrid();prefill();setSubmitLabel();updateBar()}
function fullPhone(){const d=$('#phone').value.trim().replace(/[^\d+]/g,'');if(d.startsWith('+'))return d;return ($('#cc').value||'+')+d.replace(/^0+/,'')}
function splitPhone(p){const cc=[...$('#cc').options].map(o=>o.value).filter(Boolean).sort((a,b)=>b.length-a.length).find(c=>p.startsWith(c));return cc?[cc,p.slice(cc.length)]:['',p]}
/* country code select: short label when closed, full names when open */
(function(){const sel=$('#cc');[...sel.options].forEach(o=>{o.dataset.long=o.textContent;o.dataset.short=o.value?o.textContent.split(' ').slice(0,2).join(' '):'+ …'});
  const short=()=>[...sel.options].forEach(o=>o.textContent=o.dataset.short),long=()=>[...sel.options].forEach(o=>o.textContent=o.dataset.long);
  short();sel.addEventListener('mousedown',long);sel.addEventListener('focus',long);sel.addEventListener('change',()=>{short();$('#phone').focus()});sel.addEventListener('blur',short);})();
function prefill(){const me=ST.me(),c=lsg('contact',{});if(c&&typeof c==='object'&&!Array.isArray(c)){if(!$('#fn').value&&!$('#ln').value){const fl=(c.first||c.last)?[c.first||'',c.last||'']:splitName(c.name);$('#fn').value=fl[0];$('#ln').value=fl[1]}if(!$('#phone').value&&c.phone){const [cc,n]=splitPhone(c.phone);$('#cc').value=cc;$('#phone').value=n}if(!$('#email').value)$('#email').value=c.email||''}if(me&&!$('#fn').value&&!$('#ln').value){const fl=userFL(me);$('#fn').value=fl[0];$('#ln').value=fl[1]}if(me&&me.email&&!$('#email').value)$('#email').value=me.email;if(me&&me.phone&&!$('#phone').value){const [cc,n]=splitPhone(me.phone);$('#cc').value=cc;$('#phone').value=n}}
function setSubmitLabel(){const b=$('#subbtn');if(b)b.textContent=t(BRAND.fb?'f.submit.fb':'f.submit')}
/* sticky bottom bar on small screens: total and a jump to the form */
let formSeen=false;
function updateBar(){const bar=$('#sbarb');if(!bar)return;const q=LASTQ;
  const show=!!q&&!formSeen&&$('#out').hidden&&location.hash.slice(1)==='';
  bar.hidden=!show;document.body.classList.toggle('hasbar',show);
  if(q){$('#sbt').textContent=money(q.total+q.dep);$('#sbs').textContent=t('bar.sub',{d:q.d})}}
try{new IntersectionObserver(es=>{formSeen=es[0].isIntersecting;updateBar()}).observe($('#f'))}catch(x){}
$('#sbgo').addEventListener('click',()=>$('#f').scrollIntoView({behavior:'smooth',block:'start'}));
['fn','ln','phone','email'].forEach(i=>$('#'+i).addEventListener('input',()=>{}));
document.addEventListener('toggle',e=>{if(e.target&&e.target.id==='spotd'&&e.target.open){if(map)setTimeout(()=>map.invalidateSize(),50);else ensureMap()}},true);
window.addEventListener('hashchange',updateBar);

function reviewBlock(c){
  const rs=reviewsOf(c).slice().reverse(),rt=ratingOf(c);
  if(!rs.length)return '<p class="note" style="margin:0">'+esc(t('rv.none'))+'</p>';
  return `<p style="margin:0 0 8px"><b>★ ${rt.avg.toFixed(1)}</b> · ${esc(t(rt.n===1?'rv.sum1':'rv.sum',{n:rt.n}))}</p>`+rs.slice(0,5).map(r=>`<div class="rv"><div class="row2"><b>${esc(first(r.guestName))}</b><span class="rt">${stars(r.rating)}</span></div><p style="margin:2px 0 0">${esc(r.text)}</p></div>`).join('');
}

/* ---------- notices (renter notice, host declaration) ---------- */
const ndlg=$('#ndlg');
function openNotice(kind,ctx){
  $('#nbody').innerHTML=noticeHtml(kind,ctx);
  if(!ndlg.open)ndlg.showModal();
  ndlg.scrollTop=0;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-notice]');if(b){e.preventDefault();let ctx=null;if(b.dataset.notice==='renter'&&b.closest('#f')){const q=quote();if(q)ctx={c:q.c,total:q.total,dep:q.dep}}openNotice(b.dataset.notice,ctx)}});
ndlg.addEventListener('click',e=>{if(e.target===ndlg||e.target.closest('[data-nclose]'))ndlg.close()});


/* ---------- Airbnb-style search bar: Where / When / Who, each opens a panel ---------- */
const PINSVG='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>';
const asb=$('#asb');
function openSeg(k){
  asb.querySelectorAll('.seg').forEach(sg=>{const on=sg.dataset.seg===k;sg.classList.toggle('on',on);const p=sg.querySelector('.pop');if(p)p.hidden=!on});
  asb.classList.toggle('open',!!k);$('#whereIn').setAttribute('aria-expanded',String(k==='where'));
  if(k==='where')renderWherePop();
  if(k==='when')renderWhenCal()
  if(k==='who')renderWhoPop();
}
function closeSeg(){openSeg('')}
function renderWhenCal(){const two=innerWidth>=900,el=$('#cal-s');if(!$('#tebox-s').firstChild)$('#tebox-s').innerHTML=teBox('s');el.dataset.n=two?2:1;$('#pop-when').classList.toggle('two',two);el.innerHTML=calInner('s','','pick',two?2:1);whenSum()}
function whenSum(){teSync();const a=$('#from').value,b=$('#to').value;$('#whenSum').textContent=(a&&b&&days(a,b)>=1)?(TIME?'':t('time.sel')):a?t('cal.pickret'):t('cal.pickstart')}
let PL=[],PH_TIMER=0,PH_ABORT=null,PH_STATE='',PH_CACHE={};
const norm=x=>String(x||'').toLowerCase();
function localPlaces(){const extra=Object.keys(AREAS).filter(k=>k!=='Airport').map(k=>({n:k,s:'Puerto Princesa, Palawan',p:AREAS[k]}));const seen=new Set(),out=[];[...PLACES,...extra].forEach(x=>{const k=norm(x.n);if(!seen.has(k)){seen.add(k);out.push(x)}});return out}
function renderWherePop(){
  const raw=$('#whereIn').value.trim(),q=norm(raw),cur=S.moved?norm(placeName()):'';
  const shown=(q&&q!==cur)?q:'';
  const loc=localPlaces();let list;
  if(!shown)list=loc.slice(0,8);else list=loc.filter(x=>norm(x.n).includes(shown)).sort((a,b)=>(norm(b.n).startsWith(shown))-(norm(a.n).startsWith(shown)));
  const have=new Set(list.map(x=>norm(x.n)));
  const web=shown?(PH_CACHE[shown]||[]).filter(x=>!have.has(norm(x.n))):[];
  PL=[...list,...web];
  const hl=n=>{if(!shown)return esc(n);const i=norm(n).indexOf(shown);if(i<0)return esc(n);return esc(n.slice(0,i))+'<b>'+esc(n.slice(i,i+shown.length))+'</b>'+esc(n.slice(i+shown.length))};
  const row=(x,i)=>`<button type="button" class="opt" role="option" data-pl="${i}"><span class="ic">${PINSVG}</span><span class="tx"><span class="nm">${hl(x.n)}</span>${x.s?`<small>${esc(x.s)}</small>`:''}</span></button>`;
  let h='';
  if(!shown)h+=`<button type="button" class="opt" data-loc><span class="ic">${LOCSVG}</span><span class="tx"><span class="nm">${esc(t('where.here'))}</span></span></button><p class="phd">${esc(t('where.pop'))}</p>`;
  h+=PL.map(row).join('');
  if(shown&&PH_STATE==='loading'&&!web.length)h+=`<p class="note" style="margin:10px 14px">${esc(t('where.searching'))}</p>`;
  else if(shown&&!PL.length)h+=`<p class="note" style="margin:10px 14px">${esc(t('where.none'))}</p>`;
  if(shown)h+=`<p class="phd ft">${esc(t('where.credit'))}</p>`;
  $('#pop-where').innerHTML=h;
}
const LOCSVG='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="7.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
function searchWeb(raw){
  const q=norm(raw);clearTimeout(PH_TIMER);if(PH_ABORT){try{PH_ABORT.abort()}catch(x){}}
  if(q.length<3||PH_CACHE[q]){PH_STATE='';return}
  PH_STATE='loading';
  PH_TIMER=setTimeout(()=>{
    let ctl=null;try{ctl=new AbortController()}catch(x){}PH_ABORT=ctl;
    fetch('https://photon.komoot.io/api/?limit=7&lang=en&lat=9.74&lon=118.73&bbox=116.9,8.2,120.6,12.6&q='+encodeURIComponent(raw),ctl?{signal:ctl.signal}:{})
      .then(r=>r.ok?r.json():Promise.reject()).then(j=>{
        PH_CACHE[q]=(j.features||[]).filter(f=>f.properties&&f.properties.countrycode==='PH'&&f.geometry).map(f=>{const p=f.properties;return {n:p.name||p.street||'',s:[p.district||p.city||p.county,p.state].filter(x=>x&&x!==p.name).join(', '),p:[f.geometry.coordinates[1],f.geometry.coordinates[0]]}}).filter(x=>x.n);
        PH_STATE='';if(norm($('#whereIn').value.trim())===q&&!$('#pop-where').hidden)renderWherePop()})
      .catch(()=>{if(PH_ABORT===ctl){PH_CACHE[q]=[];PH_STATE='';if(!$('#pop-where').hidden&&norm($('#whereIn').value.trim())===q)renderWherePop()}});
  },350);
}
function pickPlace(x){
  const p=x.p.slice();if(map){pinMk.setLatLng(p);map.setView(p,13)}
  setPin(p,true,{name:x.n});$('#whereIn').value=x.n;syncBar();openSeg('when');
}
function partySeats(){return PARTY.a+PARTY.c}
function partyLabel(){const g=partySeats(),parts=[];if(g)parts.push(t(g===1?'who.g1':'who.gn',{n:g}));if(PARTY.i)parts.push(t(PARTY.i===1?'who.i1':'who.in',{n:PARTY.i}));if(PARTY.p)parts.push(t(PARTY.p===1?'who.p1':'who.pn',{n:PARTY.p}));return parts.join(' · ')}
function partyText(){const o=[];if(PARTY.a)o.push(PARTY.a+' adult'+(PARTY.a>1?'s':''));if(PARTY.c)o.push(PARTY.c+' child'+(PARTY.c>1?'ren':''));if(PARTY.i)o.push(PARTY.i+' baby'+(PARTY.i>1?'ies':''));if(PARTY.p)o.push(PARTY.p+' pet'+(PARTY.p>1?'s':''));return o.join(', ')}
function renderWhoPop(){
  const rows=[['a','who.adults','who.adults.s'],['c','who.kids','who.kids.s'],['i','who.babies','who.babies.s'],['p','who.pets','who.pets.s']];
  $('#pop-who').innerHTML=rows.map(r=>{const k=r[0],v=PARTY[k],minA=(k==='a'&&(PARTY.c||PARTY.i))?1:0;return `<div class="stp"><div><b>${esc(t(r[1]))}</b><small>${esc(t(r[2]))}</small></div><div class="ctl"><button type="button" class="rb" data-step="${k}" data-d="-1" aria-label="${esc(t(r[1]))} −"${v<=minA?' disabled':''}>−</button><span aria-live="polite">${v}</span><button type="button" class="rb" data-step="${k}" data-d="1" aria-label="${esc(t(r[1]))} +"${v>=PMAX[k]?' disabled':''}>+</button></div></div>`}).join('')+`<p class="note" style="margin:10px 4px 2px">${esc(t('who.note'))}</p>`+(partyLabel()?`<button type="button" class="chip" data-party-clear style="margin:8px 4px 0">${esc(t('cal.clear'))}</button>`:'');
}
function stepParty(k,d){
  const n=PARTY[k]+d;if(n<0||n>PMAX[k])return;PARTY[k]=n;
  if((k==='c'||k==='i')&&d>0&&PARTY.a===0)PARTY.a=1;
  if(k==='a'&&PARTY.a===0&&(PARTY.c||PARTY.i))PARTY.a=1;
  S.seats=partySeats();renderGrid();syncBar();renderWhoPop();
}
function syncBar(){
  const wi=$('#whereIn');if(document.activeElement!==wi)wi.value=S.moved?placeName():'';
  $('#whereClr').hidden=!wi.value;
  const a=$('#from').value,b=$('#to').value,d=(a&&b)?days(a,b):0;
  $('#whenV').textContent=((a&&b&&d>=1)?fmtS(a)+' → '+fmtS(b):a?fmtS(a)+' → …':t('when.any'))+(TIME?' · '+tlx():'');
  const pl=partyLabel();$('#whoV').textContent=pl||t('who.add');
  $('#whoV').classList.toggle('set',!!pl);$('#whenV').classList.toggle('set',!!(a&&b));
  const mt=$('#asminiT');if(mt)mt.textContent=[S.moved?placeName():t('mini.any'),(a&&b&&d>=1)?fmtS(a)+' → '+fmtS(b):t('when.any'),...(TIME?[tlx()]:[]),pl||t('who.add')].join(' · ');
  const sv=$('#spotv');if(sv)sv.textContent=S.moved?placeName():t('spot.drop');
}
let MVR=0;function miniVis(){if(MVR)return;MVR=requestAnimationFrame(()=>{MVR=0;miniVisNow()})}
function miniVisNow(){const m=$('#asmini'),w=$('#asw'),h=document.querySelector('.hdr');if(!m||!w)return;const home=!$('#v-home').hidden&&innerWidth<900;m.hidden=!(home&&w.getBoundingClientRect().bottom<(h?h.offsetHeight:56))}
addEventListener('scroll',miniVis,{passive:true});addEventListener('resize',miniVis);addEventListener('hashchange',()=>setTimeout(miniVis,0));
document.addEventListener('click',e=>{if(e.target.closest('#asmini')){const w=$('#asw'),h=document.querySelector('.hdr');window.scrollTo({top:Math.max(0,w.getBoundingClientRect().top+scrollY-(h?h.offsetHeight:56)-8),behavior:'smooth'});setTimeout(()=>{try{openSeg('where')}catch(x){}},380)}});
asb.addEventListener('click',e=>{
  const pl=e.target.closest('[data-pl]');if(pl){pickPlace(PL[+pl.dataset.pl]);return}
  if(e.target.closest('[data-loc]')){closeSeg();$('#locate').click();return}
  if(e.target.closest('[data-whendone]')){openSeg('who');return}
  const st=e.target.closest('[data-step]');
  if(st){stepParty(st.dataset.step,+st.dataset.d);return}
  if(e.target.closest('[data-party-clear]')){PARTY.a=PARTY.c=PARTY.i=PARTY.p=0;S.seats=0;renderGrid();syncBar();renderWhoPop();return}
  if(e.target.closest('#whereClr')){$('#whereIn').value='';S.moved=false;S.place=null;$('#areaSel').value='';setPin(CENTER.slice(),false);syncBar();openSeg('where');$('#whereIn').focus();return}
  if(e.target.closest('#asGo')){closeSeg();const g=$('#s2');if(g)g.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(e.target.closest('.pop'))return;
  const sg=e.target.closest('.seg');if(sg){const k=sg.dataset.seg;if(sg.classList.contains('on')&&k!=='where')closeSeg();else{openSeg(k);if(k==='where')$('#whereIn').focus()}}
});
asb.addEventListener('keydown',e=>{const sg=e.target.closest('.seg');if((e.key==='Enter'||e.key===' ')&&sg&&sg.dataset.seg!=='where'&&e.target===sg){e.preventDefault();openSeg(sg.dataset.seg)}
  if(e.key==='Enter'&&e.target.id==='whereIn'){e.preventDefault();if(PL.length)pickPlace(PL[0])}});
$('#whereIn').addEventListener('input',()=>{$('#whereClr').hidden=!$('#whereIn').value;searchWeb($('#whereIn').value.trim());renderWherePop();if($('#pop-where').hidden)openSeg('where')});
$('#whereIn').addEventListener('focus',()=>{if($('#pop-where').hidden)openSeg('where')});
document.addEventListener('click',e=>{if(asb.classList.contains('open')&&!e.composedPath().includes(asb))closeSeg()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSeg()});
['from','to'].forEach(id=>$('#'+id).addEventListener('change',()=>{syncBar();if(!$('#pop-when').hidden)renderWhenCal()}));
$('#tebox-f').innerHTML=teBox('f');
syncBar();teSync();

/* measure header and search bar heights for the pinned layout */
function measureBars(){const h=document.querySelector('.hdr'),b=$('#asw'),r=document.documentElement.style;if(h)r.setProperty('--hh',h.offsetHeight+'px');if(b)r.setProperty('--asbh',b.offsetHeight+'px')}
measureBars();window.addEventListener('resize',measureBars);window.addEventListener('load',measureBars);
