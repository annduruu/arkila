const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
const php=n=>'₱'+Math.round(n).toLocaleString('en-PH');
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
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
const imgsOf=c=>(c.images&&c.images.length)?c.images.map((u,i)=>`<img src="${esc(u)}" alt="${esc(c.name)} photo ${i+1}" loading="lazy">`):(isMotor(c)?[motorSVG(c),motorFront(c),helmetSVG(c)]:[carSVG(c),frontSVG(c),interiorSVG(c)]);
const hasPhotos=c=>c.images&&c.images.length;

const S={kind:'all',type:'All',service:'any',seats:0,sel:null,pin:CENTER.slice(),moved:false,gi:0,gid:null};
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
function fillAreas(){const sel=$('#areaSel'),cur=sel.value;sel.innerHTML='<option value="">'+esc(t('area.choose'))+'</option>'+Object.keys(AREAS).map(a=>`<option>${esc(a)}</option>`).join('');sel.value=cur}
function initMap(){
  fillAreas();
  if(typeof L==='undefined'){$('#map').innerHTML='<div class="empty" style="margin:12px">'+esc(t('map.fail'))+'</div>';return}
  map=L.map('map',{scrollWheelZoom:false}).setView(CENTER,12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
  pinMk=L.marker(CENTER,{draggable:true,keyboard:true,title:t('map.drag'),icon:L.divIcon({className:'pin',html:'<span></span>',iconSize:[28,28],iconAnchor:[14,28]})}).addTo(map);
  pinMk.on('dragend',()=>{const p=pinMk.getLatLng();setPin([p.lat,p.lng],true)});
  map.on('click',e=>{pinMk.setLatLng(e.latlng);setPin([e.latlng.lat,e.latlng.lng],true)});
  carLayer=L.layerGroup().addTo(map);
}
function drawMarkers(list){
  if(!map)return;carLayer.clearLayers();
  list.forEach(c=>{const p=carPos(c),short=PREF.cur==='PHP'?(c.price>=1000?'₱'+(c.price/1000).toFixed(c.price%1000?1:0)+'k':'₱'+c.price):money(c.price);
    L.marker(p,{title:c.name,icon:L.divIcon({className:'cm',html:`<b>${esc(short)}</b>`,iconSize:[60,22],iconAnchor:[30,11]})}).on('click',()=>openDetail(c.id)).addTo(carLayer)});
}
function setPin(p,moved){
  S.pin=p;if(moved)S.moved=true;
  const a=nearestArea(p);$('#pininfo').innerHTML=S.moved?t('pin.set',{area:'<b>'+esc(a)+'</b>',lat:p[0].toFixed(4),lng:p[1].toFixed(4)}):esc(t('pin.hint'));
  $('#areaSel').value=S.moved?a:'';renderGrid();
}
$('#areaSel').addEventListener('change',e=>{const a=e.target.value;if(!a)return;const p=AREAS[a];if(map){pinMk.setLatLng(p);map.setView(p,13)}setPin(p.slice(),true)});
$('#locate').addEventListener('click',()=>{
  if(!navigator.geolocation){toast(t('loc.na'));return}
  navigator.geolocation.getCurrentPosition(pos=>{const p=[pos.coords.latitude,pos.coords.longitude];if(map){pinMk.setLatLng(p);map.setView(p,14)}setPin(p,true)},()=>toast(t('loc.off')),{timeout:8000});
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
}
function filtered(){
  const l=activeCars().filter(c=>(S.kind==='all'||(S.kind==='motor')===isMotor(c))&&(S.type==='All'||c.type===S.type)&&(S.service==='any'||c.service===S.service)&&c.seats>=S.seats);
  const ok=l.filter(c=>!unavailable(c));S.hidden=l.length-ok.length;
  return ok.sort((a,b)=>S.moved?distOf(a)-distOf(b):a.price-b.price);
}
const depositOf=c=>{const d=c&&c.specs&&c.specs.deposit;return (d!=null&&d!=='')?+d:SETTINGS.deposit[isMotor(c)?'motor':'car']};
const dateNow=()=>{const a=$('#from').value,b=$('#to').value;return {a,b,d:(a&&b)?days(a,b):0}};
/* ---------- availability calendar ---------- */
const addD=(s,n)=>{const [y,m,d]=s.split('-').map(Number);return iso(new Date(y,m-1,d+n))};
const todayIso=()=>iso(new Date());
const busyRanges=id=>{const o=[];ST.requests.forEach(r=>{if(r.carId===id&&(r.status==='confirmed'||r.status==='completed'))o.push({from:r.from,to:r.to,k:'booked'})});((typeof BLOCKED!=='undefined'&&BLOCKED&&BLOCKED[id])||[]).forEach(x=>{if(x&&x[0]&&x[1])o.push({from:x[0],to:addD(x[1],1),k:'arkila'})});return o};
const dayInfo=(id,s)=>{for(const r of busyRanges(id))if(s>=r.from&&s<r.to)return r.k;return (ST.blocks[id]||[]).includes(s)?'host':''};
const rangeFree=(id,a,b)=>{for(let d=a,n=0;d<b&&n<400;d=addD(d,1),n++)if(dayInfo(id,d))return false;return true};
const unavailable=c=>{const {a,b}=dateNow();if(!a||!b||days(a,b)<1)return false;return !rangeFree(c.id,a,b)};
const CAL={};
function calInner(key,id,mode){
  const pick=mode==='pick',a=pick?$('#from').value:'',b=pick?$('#to').value:'',loc=LOCALE[PREF.lang]||'en-PH',tdy=todayIso();
  if(!CAL[key]){const base=a?new Date(a+'T00:00:00'):new Date();CAL[key]={y:base.getFullYear(),m:base.getMonth()}}
  const st=CAL[key];
  let lim='';if(pick&&a&&!b){for(let d=a,n=0;n<400;d=addD(d,1),n++)if(dayInfo(id,d)){lim=d;break}}
  const first=new Date(st.y,st.m,1),dim=new Date(st.y,st.m+1,0).getDate();
  let cells='';for(let i=0;i<first.getDay();i++)cells+='<i></i>';
  for(let d=1;d<=dim;d++){
    const s=st.y+'-'+String(st.m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'),k=dayInfo(id,s);
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
  const wk=[0,1,2,3,4,5,6].map(i=>`<span>${esc(new Date(2023,0,1+i).toLocaleDateString(loc,{weekday:'short'}))}</span>`).join('');
  const leg=pick?`<span><i class="lf"></i>${esc(t('cal.free'))}</span><span><i class="lo"></i>${esc(t('cal.off'))}</span><span><i class="ls"></i>${esc(t('cal.sel'))}</span>`:`<span><i class="lf"></i>${esc(t('cal.free'))}</span><span><i class="lb"></i>${esc(t('cal.booked'))}</span><span><i class="lh"></i>${esc(t('cal.hostblock'))}</span><span><i class="la"></i>${esc(t('cal.arkblock'))}</span>`;
  return `<div class="calh"><button type="button" data-cal-nav="-1" aria-label="${esc(t('cal.prev'))}">‹</button><b>${esc(first.toLocaleDateString(loc,{month:'long',year:'numeric'}))}</b><button type="button" data-cal-nav="1" aria-label="${esc(t('cal.next'))}">›</button></div><div class="calw">${wk}</div><div class="calg">${cells}</div><div class="calleg">${leg}${pick?`<button type="button" class="chip" data-cal-clear style="margin-left:auto;padding:2px 10px;font-size:12px">${esc(t('cal.clear'))}</button>`:''}</div>`;
}
function setDates(a,b){const f=$('#from'),r=$('#to');f.value=a;r.value=b;[f,r].forEach(x=>x.dispatchEvent(new Event('change',{bubbles:true})))}
function calSum(){const el=$('#calsum');if(!el)return;const a=$('#from').value,b=$('#to').value;el.textContent=(a&&b&&days(a,b)>=1)?fmt(a)+' → '+fmt(b)+' · '+t(days(a,b)===1?'cal.d1':'cal.dn',{d:days(a,b)}):a?t('cal.pickret'):t('cal.pickstart')}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-cal-day],[data-cal-nav],[data-cal-clear]');if(!b)return;
  const el=b.closest('.cal');if(!el)return;const key=el.dataset.key,id=el.dataset.car,mode=el.dataset.mode;
  if(b.dataset.calNav){const d=new Date(CAL[key].y,CAL[key].m+ +b.dataset.calNav,1);CAL[key]={y:d.getFullYear(),m:d.getMonth()}}
  else if(b.dataset.calClear!==undefined){setDates('','')}
  else if(mode==='pick'){const s=b.dataset.calDay,a=$('#from').value,r=$('#to').value;if(!a||r||s<=a)setDates(s,'');else setDates(a,s)}
  else if(typeof hostDay==='function')hostDay(id,b.dataset.calDay);
  el.innerHTML=calInner(key,id,mode);if(mode==='pick')calSum();
});
function cardHtml(c){
  const {d}=dateNow(),rt=ratingOf(c),un=unavailable(c),fav=ST.favs.includes(c.id);
  return `<article class="card${S.sel===c.id?' sel':''}${un?' off':''}"><button type="button" class="cardbtn" data-open="${esc(c.id)}">
    <div class="tile">${imgsOf(c)[0]}<span class="area">${esc(c.area)}</span><span class="svc">${esc(svcT(c.service))}</span>${S.sel===c.id?'<span class="chosen">'+esc(t('card.chosen'))+'</span>':''}${un?'<span class="chosen" style="background:var(--ink);color:var(--bg)">'+esc(t('card.booked'))+'</span>':''}</div>
    <div class="cb"><div class="row2" style="align-items:baseline"><h3>${esc(c.name)}</h3><span class="rt">${rt?'★ '+rt.avg.toFixed(1)+' <small>('+rt.n+')</small>':'<small>'+esc(t('card.new'))+'</small>'}</span></div>
    <p class="sub">${esc(c.type)} · ${esc(seatsLabel(c))}${S.moved?' · '+esc(t('card.km',{k:distOf(c).toFixed(1)})):''}</p>
    <p class="pr">${d>=1?`<b>${esc(money(c.price*d))}</b><span>${esc(t(d===1?'card.for1':'card.forN',{d,p:money(c.price)}))}</span>`:`<b>${esc(money(c.price))}</b><span>${esc(t('card.perday'))}</span>`}</p></div></button>
    <button type="button" class="heart${fav?' on':''}" data-fav="${esc(c.id)}" aria-pressed="${fav}" aria-label="${esc(t(fav?'card.unsave':'card.save'))} ${esc(c.name)}">${fav?'♥':'♡'}</button></article>`;
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
  $('#dbody').innerHTML=`<div class="dgal"><div class="gal"><div class="stage" id="stage"></div><button type="button" class="nav prev" data-g="-1" aria-label="${esc(t('g.prev'))}">‹</button><button type="button" class="nav next" data-g="1" aria-label="${esc(t('g.next'))}">›</button></div>
  <div class="thumbs" id="thumbs"></div>
  <p class="note" id="galnote" style="margin-top:6px"></p></div>
  <div class="dinfo">${c.ownerName?`<p class="note" style="margin:8px 0 0">${esc(t('d.hosted',{name:c.ownerName}))}</p>`:''}<div class="dhead"><div><h2 id="dtitle">${esc(c.name)}</h2><p class="sub">${esc(c.type)} · ${esc(seatsLabel(c))} · ${esc(svcT(c.service))}${S.moved?' · '+esc(t('kmpin',{k:distOf(c).toFixed(1)})):''}</p></div><div><p class="pr big"><b>${esc(money(c.price))}</b><span>${esc(t('card.perday'))}</span></p><button type="button" class="chip" data-fav="${esc(c.id)}" style="margin-top:6px">${esc(t(ST.favs.includes(c.id)?'d.saved':'d.save'))}</button></div></div>
  <p class="desc">${esc(c.description||'')}</p>
  <h3 class="h3">${esc(t('d.details'))}</h3><dl class="specs">${rows.map(r=>`<div><dt>${esc(t(r[0]))}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl>
  ${(c.features&&c.features.length)?`<h3 class="h3">${esc(t('d.features'))}</h3><div class="feat">${c.features.map(f=>`<span class="pill">${esc(f)}</span>`).join('')}</div>`:''}
  <h3 class="h3">${esc(t('d.reviews'))}</h3>${reviewBlock(c)}
  <h3 class="h3">${esc(t('d.good'))}</h3><ul class="rules"><li>${esc(t('r.deposit'))}</li><li>${esc(t('r.secdep',{amt:money(depositOf(c))}))}</li>${mo?`<li>${esc(t('r.mlicense'))}</li><li>${esc(t('r.helmet'))}</li>`:`<li>${esc(t(c.service==='Self-drive'?'r.license':'r.driver'))}</li>`}<li>${esc(t('r.fuel'))}</li><li>${esc(SETTINGS.cancellation)}</li></ul>
  ${c.status==='approved'?`<h3 class="h3">${esc(t('cal.title'))}</h3><div class="cal" id="cal-d" data-key="d" data-car="${esc(c.id)}" data-mode="pick">${calInner('d',c.id,'pick')}</div><p class="note" id="calsum"></p>`:''}${c.status!=='approved'?'<p class="note">'+esc(t('d.preview'))+'</p>':unavailable(c)?'<p class="err">'+esc(t('d.booked'))+'</p>':`<div class="stack"><button type="button" class="btn" data-choose="${esc(c.id)}">${esc(t('d.choose'))}</button></div>`}</div>`;
  renderGallery();calSum();if(!dlg.open)dlg.showModal();
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
  if(e.target.closest('[data-close]')){dlg.close();return}
  if(g){S.gi+=+g.dataset.g;renderGallery()}
  else if(th){S.gi=+th.dataset.gi;renderGallery()}
  else if(ch){S.sel=ch.dataset.choose;dlg.close();renderGrid();$('#s3').scrollIntoView({behavior:'smooth',block:'start'})}
});
dlg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){S.gi--;renderGallery()}else if(e.key==='ArrowRight'){S.gi++;renderGallery()}});

/* ---------- filters, request ---------- */
document.addEventListener('click',e=>{
  const x=e.target.closest('[data-type]'),o=e.target.closest('[data-open]');
  const kd=e.target.closest('[data-kind]');
  if(kd){S.kind=kd.dataset.kind;S.type='All';renderTypes();renderGrid();return}
  if(x){S.type=x.dataset.type;renderTypes();renderGrid()}else if(o)openDetail(o.dataset.open);
});
function quote(){
  const c=allCars().find(x=>x.id===S.sel),a=$('#from').value,b=$('#to').value;
  $('#datesum').textContent=(a&&b&&days(a,b)>=1)?t('datesum',{a:fmt(a),b:fmt(b),d:days(a,b)}):t('datesum.none');
  $('#chosen').innerHTML=c?`<span class="lab">${esc(t('chosenlab'))}</span><div class="row2"><b>${esc(c.name)}</b><button type="button" class="chip" data-open="${esc(c.id)}">${esc(t('viewd'))}</button></div>`:'<span class="note">'+esc(t('pickfirst'))+'</span>';
  if(!c||!a||!b||days(a,b)<1){$('#quote').innerHTML=c?'<span class="note">'+esc(t('retbefore'))+'</span>':'';return null}
  const d=days(a,b),total=c.price*d,dep=depositOf(c);
  $('#quote').innerHTML=`<div><span>${esc(t('q.line',{p:money(c.price),d}))}</span><span>${esc(money(total))}</span></div><div><span>${esc(t('q.dep'))}</span><span>${esc(money(dep))}</span></div><div class="t"><span>${esc(t('q.tot'))}</span><span>${esc(money(total+dep))}</span></div><p class="note" style="margin:6px 0 0">${esc(t('q.note'))}</p>`;
  return {c,a,b,d,total,dep};
}
['from','to'].forEach(id=>$('#'+id).addEventListener('change',()=>{const a=$('#from').value;if(a)$('#to').min=a;renderGrid()}));
let MSG='';
$('#f').addEventListener('submit',e=>{
  e.preventDefault();const err=$('#err');err.textContent='';
  if(!ST.me()){openLogin(t('l.needreq'));return}
  const q=quote(),name=$('#name').value.trim(),phone=$('#phone').value.trim().replace(/[^\d+]/g,''),code=$('#code').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,''),notes=$('#notes').value.trim();
  if(!q){err.textContent=t('e.pick');return}
  if(unavailable(q.c)){err.textContent=t('e.unavail');return}
  if(!name){err.textContent=t('e.name');return}
  if(!/^\+?\d{8,15}$/.test(phone)){err.textContent=t('e.phone');return}
  if(!$('#ack').checked){err.textContent=t('e.ack');return}
  const area=nearestArea(S.pin),spot=S.moved?`near ${area}, https://www.google.com/maps?q=${S.pin[0].toFixed(5)},${S.pin[1].toFixed(5)}`:'not set';
  MSG=`Hi ${BRAND.name}, I would like to request a vehicle.\n\nVehicle: ${q.c.name} (${q.c.service}, ${q.c.area})\nDates: ${fmtEn(q.a)} to ${fmtEn(q.b)} (${q.d} day${q.d>1?'s':''})\nPickup spot: ${spot}\nRental fee: ${php(q.total)}\nRefundable security deposit: ${php(q.dep)}\nTotal to pay online after the owner confirms: ${php(q.total+q.dep)}\nName: ${name}\nMobile: ${phone}${code?'\nReferral code: '+code:''}${notes?'\nNotes: '+notes:''}\nI have read and agree to the renter notice.\n\nRequest ref: ${q.c.id}|${q.a}|${q.b}|${phone}${code?'|'+code:''}`;
  const rq=saveRequest(q,name,phone,notes,spot,MSG);
  $('#msg').textContent=MSG;$('#out').hidden=false;$('#reqnote').textContent=t('reqnote',{id:rq.id});$('#out').scrollIntoView({behavior:'smooth',block:'start'});
  const fb=$('#fb');
  if(BRAND.fb){fb.href='https://m.me/'+encodeURIComponent(BRAND.fb);fb.setAttribute('aria-disabled','false');$('#fbnote').textContent=t('fb.on')}
  else{fb.setAttribute('aria-disabled','true');$('#fbnote').textContent=BRAND.phone?t('fb.offc',{c:BRAND.phone}):t('fb.off')}
});
$('#copy').addEventListener('click',()=>{
  (navigator.clipboard?navigator.clipboard.writeText(MSG):Promise.reject()).then(()=>toast(t('copied'))).catch(()=>{const r=document.createRange();r.selectNodeContents($('#msg'));const s=getSelection();s.removeAllRanges();s.addRange(r);toast(t('copyfail'))});
});
initMap();renderTypes();setPin(CENTER.slice(),false);
function refreshHome(){renderTypes();renderGrid();const me=ST.me();if(me&&!$('#name').value)$('#name').value=me.name}

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
