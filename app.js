const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=s=>document.querySelector(s);
const php=n=>'₱'+Math.round(n).toLocaleString('en-PH');
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const fmt=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-PH',{day:'numeric',month:'short',year:'numeric'})};
const days=(a,b)=>{const [y1,m1,d1]=a.split('-').map(Number),[y2,m2,d2]=b.split('-').map(Number);return Math.round((new Date(y2,m2-1,d2)-new Date(y1,m1-1,d1))/864e5)};
function carSVG(c){
  const P={sedan:['M24 118 L44 98 Q62 80 104 78 L186 78 Q222 80 242 100 L288 108 Q298 112 298 126 L298 138 L24 138Z','M72 98 Q84 86 108 85 L140 85 L140 99 L72 99Z M148 85 L186 85 Q206 87 220 99 L148 99Z'],hatch:['M26 122 L42 98 Q56 80 92 78 L206 78 Q230 82 240 102 L284 110 Q296 114 296 126 L296 138 L26 138Z','M64 98 Q74 87 96 86 L136 86 L136 99 L64 99Z M144 86 L202 86 Q216 88 226 99 L144 99Z'],suv:['M22 120 L34 84 Q40 70 66 68 L214 68 Q240 70 252 92 L290 104 Q300 108 300 124 L300 138 L22 138Z','M52 92 L62 78 L120 78 L120 98 L52 98Z M128 78 L212 78 Q228 80 238 98 L128 98Z'],van:['M20 134 L20 70 Q20 58 34 58 L236 58 Q252 58 260 74 L298 108 Q302 114 302 124 L302 138 L20 138Z','M36 72 L100 72 L100 96 L36 96Z M108 72 L172 72 L172 96 L108 96Z M180 72 L236 72 Q244 74 250 90 L250 96 L180 96Z'],pickup:['M22 124 L22 108 L120 108 L132 80 Q138 70 156 70 L224 70 Q244 72 254 94 L292 104 Q300 108 300 124 L300 138 L22 138Z','M142 82 L222 82 Q236 84 242 98 L142 98Z']};
  const k=c.type==='Hatchback'?'hatch':String(c.type).toLowerCase(),p=P[k]||P.sedan;
  return `<svg viewBox="0 0 320 170" role="img" aria-label="${esc(c.name)}"><ellipse cx="160" cy="158" rx="132" ry="8" fill="#000" opacity=".16"/><path d="${p[0]}" fill="${esc(c.color||'#7D8794')}"/><path d="${p[1]}" fill="var(--win)"/><path d="M24 132 L298 132" stroke="#000" stroke-opacity=".18" stroke-width="3"/><circle cx="88" cy="138" r="20" fill="#171C24"/><circle cx="88" cy="138" r="9" fill="#CBD3DD"/><circle cx="236" cy="138" r="20" fill="#171C24"/><circle cx="236" cy="138" r="9" fill="#CBD3DD"/></svg>`;
}

const S={area:'All',sel:null};
const t=new Date();t.setDate(t.getDate()+1);const t2=new Date();t2.setDate(t2.getDate()+3);
$('#from').value=iso(t);$('#to').value=iso(t2);$('#from').min=iso(new Date());
if(SETTINGS.isSample)$('#sampleBanner').hidden=false;

function renderAreas(){
  const areas=['All',...new Set(CARS.map(c=>c.area))];
  $('#areas').innerHTML=areas.map(a=>`<button type="button" class="chip" data-area="${esc(a)}" aria-pressed="${a===S.area}">${esc(a)}</button>`).join('');
}
function renderGrid(){
  const list=CARS.filter(c=>c.active!==false&&(S.area==='All'||c.area===S.area));
  $('#grid').innerHTML=list.length?list.map(c=>`<button type="button" class="card${S.sel===c.id?' sel':''}" data-pick="${esc(c.id)}" aria-pressed="${S.sel===c.id}">
    <div class="tile">${carSVG(c)}<span class="area">${esc(c.area)}</span><span class="svc">${esc(c.service)}</span></div>
    <div class="cb"><h3>${esc(c.name)}</h3><p class="sub">${esc(c.type)} · ${c.seats} seats</p><p class="pr"><b>${php(c.price)}</b><span>per day</span></p></div></button>`).join(''):'<div class="empty">No vehicles in this area yet. Try another area.</div>';
}
function quote(){
  const c=CARS.find(x=>x.id===S.sel),a=$('#from').value,b=$('#to').value;
  if(!c||!a||!b||days(a,b)<1){$('#quote').innerHTML=c?'':'<span class="note">Pick a vehicle to see the price.</span>';return null}
  const d=days(a,b),total=c.price*d,dep=Math.round(total*SETTINGS.depositRate);
  $('#quote').innerHTML=`<div><span>${esc(c.name)}</span><span>${php(c.price)} × ${d} day${d>1?'s':''}</span></div><div><span>Deposit to confirm</span><span>${php(dep)}</span></div><div><span>Balance at pickup</span><span>${php(total-dep)}</span></div><div class="t"><span>Total</span><span>${php(total)}</span></div>`;
  return {c,a,b,d,total,dep};
}
document.addEventListener('click',e=>{
  const x=e.target.closest('[data-area],[data-pick]');if(!x)return;
  if(x.dataset.area){S.area=x.dataset.area;renderAreas();renderGrid()}
  else{S.sel=x.dataset.pick;renderGrid();quote()}
});
['from','to'].forEach(id=>$('#'+id).addEventListener('change',()=>{const a=$('#from').value;if(a)$('#to').min=a;quote()}));
let MSG='';
$('#f').addEventListener('submit',e=>{
  e.preventDefault();const err=$('#err');err.textContent='';
  const q=quote(),name=$('#name').value.trim(),phone=$('#phone').value.trim().replace(/[^\d+]/g,''),code=$('#code').value.trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(!q){err.textContent='Pick a vehicle and make sure the return date is after the pickup date.';return}
  if(!name){err.textContent='Add your name.';return}
  if(!/^(\+?63|0)9\d{9}$/.test(phone)){err.textContent='Enter a Philippine mobile number, like 09171234567.';return}
  MSG=`Hi Arkila, I would like to request a vehicle.\n\nVehicle: ${q.c.name} (${q.c.service}, ${q.c.area})\nDates: ${fmt(q.a)} to ${fmt(q.b)} (${q.d} day${q.d>1?'s':''})\nEstimated total: ${php(q.total)}, deposit ${php(q.dep)}\nName: ${name}\nMobile: ${phone}${code?'\nReferral code: '+code:''}\n\nRequest ref: ${q.c.id}|${q.a}|${q.b}|${phone}${code?'|'+code:''}`;
  $('#msg').textContent=MSG;$('#out').hidden=false;$('#out').scrollIntoView({behavior:'smooth',block:'start'});
  const fb=$('#fb');
  if(SETTINGS.fbPage){fb.href='https://m.me/'+encodeURIComponent(SETTINGS.fbPage);fb.setAttribute('aria-disabled','false');$('#fbnote').textContent='Tap Copy message first, then open Messenger and paste it.'}
  else{fb.setAttribute('aria-disabled','true');$('#fbnote').textContent='Copy the message, then send it to the Arkila Facebook page'+(SETTINGS.contact?' or text '+SETTINGS.contact:'')+'.'}
});
function toast(m){const d=document.createElement('div');d.className='toast';d.textContent=m;d.setAttribute('role','status');document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
$('#copy').addEventListener('click',()=>{
  (navigator.clipboard?navigator.clipboard.writeText(MSG):Promise.reject()).then(()=>toast('Message copied')).catch(()=>{const r=document.createRange();r.selectNodeContents($('#msg'));const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Select and copy the message above')});
});
renderAreas();renderGrid();quote();
