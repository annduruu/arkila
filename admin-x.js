/* Admin pages: Calendar, Renters, Settings (with Staff).
   Loaded after admin.html's own script; adds pages to the menu and plugs into renderView(). */
(function(){
const xe=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pesos=n=>'₱'+Math.round(+n||0).toLocaleString('en-PH');
const isoD=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const todayIso=()=>isoD(new Date());
const fmtShort=s=>{const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en',{month:'short',day:'numeric'})};
const LIVE=['confirmed','approved','completed'];

/* ---------------- Calendar: every vehicle x every day ---------------- */
const CM={y:new Date().getFullYear(),m:new Date().getMonth()};
function calendarPage(){
 const y=CM.y,m=CM.m,n=new Date(y,m+1,0).getDate(),td=todayIso(),days=[...Array(n)].map((_,i)=>isoD(new Date(y,m,i+1)));
 const book={};ST.requests.forEach(r=>{if(!r.carId||!r.from||!r.to)return;const k=LIVE.includes(r.status)?'bk':r.status==='new'?'pend':null;if(!k)return;
  dayList(r.from,r.to).forEach(d=>{const b=(book[r.carId]=book[r.carId]||{});if(!b[d]||k==='bk')b[d]={k,r}})});
 const freeToday=V.filter(v=>v.live!==false&&!(book[v.id]&&book[v.id][td]&&book[v.id][td].k==='bk')&&!(ST.blocks[v.id]||[]).includes(td)).length;
 const hd=days.map(d=>{const dt=new Date(y,m,+d.slice(8)),we=dt.getDay()===0||dt.getDay()===6;return `<th class="${d===td?'ctd':''} ${we?'cwe':''}"><small>${'SMTWTFS'[dt.getDay()]}</small>${+d.slice(8)}</th>`}).join('');
 const rows=V.map(v=>{const bl=new Set(ST.blocks[v.id]||[]),bk=book[v.id]||{};
  return `<tr><th class="cvn"><button class="lnk" data-act="editv" data-arg="${xe(v.id)}">${v.name}</button><small>${v.live===false?'Paused · ':''}${v.sub}</small></th>${days.map(d=>{const b=bk[d],past=d<td;
   if(b){const nm=String(b.r.guestName||'?').trim();return `<td class="c${b.k}" data-act="calopen" data-arg="${xe(b.r.id)}" title="${xe(nm)} · ${b.k==='bk'?'booked':'request waiting'}">${xe(nm[0]||'?')}</td>`}
   return `<td class="${bl.has(d)?'cbl':''} ${past?'cpa':''}" ${past?'':`data-act="calx" data-arg="${xe(v.id)}|${d}"`} title="${bl.has(d)?'Blocked · tap to free':'Free · tap to block'}"></td>`}).join('')}</tr>`}).join('');
 return `<div class="ph"><div><h1>Calendar</h1><div class="sub">Every vehicle, every day. Tap a free day to block it, a blocked day to free it, a booking to open it.</div></div></div>
 <div class="cbar"><button class="btn g sm" data-act="calm" data-arg="-1">‹</button><b>${new Date(y,m,1).toLocaleDateString('en',{month:'long',year:'numeric'})}</b><button class="btn g sm" data-act="calm" data-arg="1">›</button><button class="btn g sm" data-act="calm" data-arg="0">Today</button><span class="sub" style="margin-left:auto">Free today: <b>${freeToday}</b> of ${V.length}</span></div>
 <div class="cwrap"><table class="cgrid"><thead><tr><th class="cvn"></th>${hd}</tr></thead><tbody>${rows||'<tr><td class="sub" style="padding:14px">No vehicles yet.</td></tr>'}</tbody></table></div>
 <div class="clg"><span><i class="cbk"></i>Booked</span><span><i class="cpend"></i>Request waiting</span><span><i class="cbl"></i>Blocked by you</span><span><i></i>Free</span></div>`}

/* ---------------- Renters: grouped by phone (or email) ---------------- */
let RQ='',NOTES=Object.assign({},lsg('rnotes',{})),NOTES_PULLED=false;
const rkey=x=>{const ph=String(x.guestPhone||'').replace(/\D/g,'');return ph?'p'+ph.slice(-10):x.guestEmail?'e'+String(x.guestEmail).toLowerCase():'i'+x.id};
function renters(){const g={};ST.requests.forEach(x=>{if(!x.guestName&&!x.guestPhone)return;const k=rkey(x);(g[k]=g[k]||{k,trips:[]}).trips.push(x)});
 return Object.values(g).map(p=>{const t=p.trips.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)),f=t[0];
  return Object.assign(p,{name:f.guestName||'Renter',phone:f.guestPhone||'',email:(t.find(x=>x.guestEmail)||{}).guestEmail||'',value:t.filter(x=>LIVE.includes(x.status)).reduce((a,x)=>a+(+x.total||0),0),
   done:t.filter(x=>x.status==='completed').length,open:t.filter(x=>['new','confirmed','approved'].includes(x.status)).length,cx:t.filter(x=>['cancelled','declined','rejected'].includes(x.status)).length,last:f.createdAt||0})}).sort((a,b)=>b.last-a.last)}
function rentersPage(){const L=renters().filter(p=>!RQ||(p.name+' '+p.phone+' '+p.email).toLowerCase().includes(RQ));
 if(!NOTES_PULLED){NOTES_PULLED=true;DB.pullNotes().then(rows=>{if(!rows)return;rows.forEach(r=>{if(r&&r.key&&r.data)NOTES[r.key]=String(r.data.text||'')});lss('rnotes',NOTES);if(view==='renters')renderView()})}
 return `<div class="ph"><div><h1>Renters</h1><div class="sub">Everyone who sent a request, grouped by mobile number. Tap a renter for trips, contact and notes.</div></div></div>
 <div class="rbar"><input id="rsearch" class="rinp" placeholder="Search name, mobile or email" value="${xe(RQ)}"><span class="sub">${L.length} renter${L.length===1?'':'s'}</span></div>
 ${L.length?`<div class="rlist">${L.map(p=>`<button class="rrow" data-act="renter" data-arg="${xe(p.k)}"><i class="rav">${xe((p.name||'?').trim()[0]||'?')}</i><span class="rnm"><b>${xe(p.name)}</b><small>${xe(p.phone||p.email)}</small></span><span class="rst"><b>${p.trips.length}</b><small>request${p.trips.length===1?'':'s'}</small></span><span class="rst"><b>${pesos(p.value)}</b><small>booked</small></span><span class="rtg">${p.open?`<em class="ron">${p.open} open</em>`:''}${p.done?`<em>${p.done} done</em>`:''}${p.cx?`<em class="rcx">${p.cx} cancelled</em>`:''}${NOTES[p.k]?'<em>Note</em>':''}</span></button>`).join('')}</div>`:`<div class="emp2"><b>No renters yet</b><div class="sub">Renters appear here after their first request.</div></div>`}`}
function renterSheet(k){const p=renters().find(x=>x.k===k);if(!p)return;const ph=String(p.phone).replace(/\D/g,''),wa=ph.startsWith('63')||ph.length>10?ph:'63'+ph.replace(/^0/,'');
 const ST2={new:'New',confirmed:'Confirmed',approved:'Confirmed',completed:'Returned',cancelled:'Cancelled',declined:'Declined',rejected:'Declined'};
 open(`${head(xe(p.name))}<div class="sh-b">
  <div class="racts">${p.phone?`<a class="btn sm" href="tel:${xe(p.phone.replace(/[^\d+]/g,''))}">Call</a><a class="btn g sm" href="https://wa.me/${xe(wa)}" target="_blank" rel="noopener">WhatsApp</a><button class="btn g sm" data-act="rcopy" data-arg="${xe(p.phone)}">Copy mobile</button>`:''}${p.email?`<a class="btn g sm" href="mailto:${xe(p.email)}">Email</a>`:''}</div>
  <div class="rkv"><span>Mobile</span><b>${xe(p.phone||'—')}</b></div><div class="rkv"><span>Email</span><b>${xe(p.email||'—')}</b></div><div class="rkv"><span>Booked value</span><b>${pesos(p.value)}</b></div>
  <h3 class="rh">Trips</h3>${p.trips.map(x=>`<button class="rtrip" data-act="calopen" data-arg="${xe(x.id)}"><span><b>${xe(x.carName)}</b><small>${fmtShort(x.from)} → ${fmtShort(x.to)} · ${xe(x.id)}</small></span><em class="s-${xe(x.status)}">${ST2[x.status]||xe(x.status)}</em></button>`).join('')}
  <h3 class="rh">Private notes <small class="sub">(staff only)</small></h3><textarea id="rnote" rows="4" maxlength="1000" placeholder="e.g. Returned on time, great renter. Prefers the airport pickup.">${xe(NOTES[k]||'')}</textarea>
 </div><div class="sh-f"><button class="btn g" data-act="close">Close</button><button class="btn" data-act="rnote" data-arg="${xe(k)}">Save note</button></div>`)}

/* ---------------- Settings (saved to the database as kv "site") ---------------- */
const curSite=()=>Object.assign({name:BRAND.name,tagline:BRAND.tagline,fb:BRAND.fb,whatsapp:BRAND.whatsapp,phone:BRAND.phone,email:BRAND.email,payInfo:SITE.payInfo,
 h1:SITE.h1,h2:SITE.h2,xr:Math.round(SETTINGS.extraHourRate*100),xmax:SETTINGS.maxExtraHours,minDays:SITE.minDays,maxDays:SITE.maxDays,notice:SITE.notice,
 deposit:BOOKING_INFO.deposit,fuel:BOOKING_INFO.fuel,licenceCar:BOOKING_INFO.licenceCar,licenceMotor:BOOKING_INFO.licenceMotor,cancel:BOOKING_INFO.cancel,pay:BOOKING_INFO.pay,
 isSample:!!SETTINGS.isSample,paused:!!SITE.paused,pauseMsg:SITE.pauseMsg},lsg('site',{})||{});
let STAFF=null,STAFF_ERR='';
const hrs=[...Array(25)].map((_,h)=>[h,h===0?'12 midnight':h===12?'12 noon':h===24?'12 midnight (end)':(h%12)+(h<12?' AM':' PM')]);
function settingsPage(){const s=curSite(),inp=(k,l,ph,t)=>`<label class="sf"><span>${l}</span><input name="${k}" ${t?`type="${t}"`:''} placeholder="${xe(ph||'')}" value="${xe(s[k]==null?'':s[k])}"></label>`,
 ta=(k,l,ph)=>`<label class="sf"><span>${l}</span><textarea name="${k}" rows="2" placeholder="${xe(ph||'')}">${xe(s[k]||'')}</textarea></label>`,
 sw=(k,l,d)=>`<label class="ssw"><input type="checkbox" name="${k}" ${s[k]?'checked':''}><i></i><span><b>${l}</b><small>${d}</small></span></label>`,
 sel=(k,l,opts)=>`<label class="sf"><span>${l}</span><select name="${k}">${opts.map(o=>`<option value="${o[0]}" ${+s[k]===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></label>`;
 if(STAFF===null&&DB.supa()&&DB.staff()){STAFF=[];DB.staffList().then(r=>{STAFF=(r||[]).map(x=>x.email);if(view==='settings')renderView()}).catch(()=>{STAFF_ERR='Could not load staff.';if(view==='settings')renderView()})}
 const me=(DB.sess()||{}).email||'';
 return `<div class="ph"><div><h1>Settings</h1><div class="sub">Saved to your database. The website uses them the next time a visitor opens it.</div></div></div>
 <form id="setf" class="setf" novalidate>
 <section class="scard"><h2>Site switches</h2>${sw('paused','Pause new requests','Renters can still browse, but can’t send requests (typhoon, holidays, fully booked).')}${inp('pauseMsg','Message shown while paused','We’re fully booked until Dec 2. Message us on Messenger.')}${sw('isSample','Sample listings banner','Shows “Sample listings… not yet bookable” on the website. Turn off at launch.')}</section>
 <section class="scard"><h2>Business &amp; contact</h2><div class="s2">${inp('name','Business name','Arkila')}${inp('tagline','Tagline','Puerto Princesa')}</div><div class="s2">${inp('fb','Facebook page username','arkilapuertoprincesa')}${inp('whatsapp','WhatsApp (digits, with country code)','639171234567')}</div><div class="s2">${inp('phone','Phone','0917 123 4567')}${inp('email','Email','hello@arkila.ph','email')}</div><p class="sub">The Facebook page turns on the “Send on Messenger” button. The website footer shows every contact you fill in.</p></section>
 <section class="scard"><h2>Payment details</h2>${ta('payInfo','Shown to renters once a request is confirmed','GCash 0917 123 4567 (Juan D.) · BPI 1234 5678 90 · or cash at pick-up')}</section>
 <section class="scard"><h2>Booking rules</h2><div class="s2">${sel('h1','Earliest pick-up',hrs.slice(0,24))}${sel('h2','Latest pick-up',hrs.slice(1))}</div><div class="s2">${inp('minDays','Shortest rental (days)','1','number')}${inp('maxDays','Longest rental (days)','60','number')}</div><div class="s2">${inp('notice','Notice needed before pick-up (hours)','0 = same day OK','number')}${inp('xr','Extra hour price (% of daily rate)','20','number')}</div><div class="s2">${inp('xmax','Most extra hours','4','number')}<span></span></div></section>
 <section class="scard"><h2>Renter policies <small class="sub">(“Before you book”)</small></h2>${ta('licenceCar','Licence (cars)')}${ta('licenceMotor','Licence (motorbikes)')}${ta('deposit','Deposit','Leave empty: renters see that Arkila confirms any deposit on Messenger.')}${ta('fuel','Fuel')}${ta('cancel','Cancellation')}${ta('pay','Payment')}</section>
 <div class="sbar"><button class="btn g" type="button" data-act="setreset">Undo changes</button><button class="btn" type="submit">Save settings</button></div>
 </form>
 <section class="scard"><h2>Staff</h2><p class="sub">People who can sign in to Admin.${DB.staff()?'':' Sign in to manage staff.'}</p>
 ${STAFF_ERR?`<p class="sub">${STAFF_ERR}</p>`:''}${(STAFF||[]).map(e=>`<div class="srow"><span>${xe(e)}${e.toLowerCase()===me.toLowerCase()?' <small class="sub">(you)</small>':''}</span>${e.toLowerCase()===me.toLowerCase()?'':`<button class="btn g sm" data-act="staffdel" data-arg="${xe(e)}">Remove</button>`}</div>`).join('')}
 ${DB.staff()?`<div class="srow"><input id="staffnew" class="rinp" type="email" placeholder="new.staff@email.com"><button class="btn sm" data-act="staffadd">Add</button></div><p class="sub">They also need a login: Supabase → Authentication → Users → Add user (same email).</p>`:''}</section>`}
function readSet(){const f=document.getElementById('setf'),g=new FormData(f),s={};
 ['name','tagline','fb','whatsapp','phone','email','payInfo','pauseMsg','deposit','fuel','licenceCar','licenceMotor','cancel','pay'].forEach(k=>s[k]=String(g.get(k)||'').trim());
 s.fb=s.fb.replace(/^https?:\/\/(www\.)?(facebook\.com|m\.me)\//i,'').replace(/\/+$/,'');s.whatsapp=s.whatsapp.replace(/\D/g,'');
 ['h1','h2','minDays','maxDays','notice','xr','xmax'].forEach(k=>s[k]=+g.get(k));s.paused=!!g.get('paused');s.isSample=!!g.get('isSample');return s}
function checkSet(s){if(!(s.h2>s.h1))return 'Latest pick-up must be after the earliest.';if(!(s.minDays>=1))return 'Shortest rental must be at least 1 day.';if(!(s.maxDays>=s.minDays))return 'Longest rental must be at least the shortest.';
 if(!(s.notice>=0&&s.notice<=168))return 'Notice must be 0 to 168 hours.';if(!(s.xr>=0&&s.xr<=100))return 'Extra hour price must be 0 to 100%.';if(!(s.xmax>=0&&s.xmax<=12))return 'Most extra hours must be 0 to 12.';
 if(s.email&&!/^\S+@\S+\.\S+$/.test(s.email))return 'Check the email address.';if(s.paused&&!s.pauseMsg)return 'Add a short message to show while requests are paused.';return ''}

/* ---------------- hook into Admin ---------------- */
const _rv=renderView;
renderView=function(){const el=document.getElementById('view');
 if(view==='calendar'){pubBooked();el.innerHTML=calendarPage();nav();return}
 if(view==='renters'){el.innerHTML=rentersPage();nav();const i=document.getElementById('rsearch');if(i){i.oninput=()=>{RQ=i.value.toLowerCase();const p=i.selectionStart;renderView();const n=document.getElementById('rsearch');if(n){n.focus();n.setSelectionRange(p,p)}}}return}
 if(view==='settings'){el.innerHTML=settingsPage();nav();return}
 return _rv()};
Object.assign(A,{
 calm:a=>{if(+a===0){CM.y=new Date().getFullYear();CM.m=new Date().getMonth()}else{CM.m+=+a;if(CM.m<0){CM.m=11;CM.y--}if(CM.m>11){CM.m=0;CM.y++}}renderView()},
 calx:a=>{const [id,d]=a.split('|'),cur=new Set(ST.blocks[id]||[]),was=cur.has(d);was?cur.delete(d):cur.add(d);ST.blocks[id]=[...cur].sort();if(!ST.save()){toast('Could not save on this device');return}try{DB.pushBlocks(id,ST.blocks[id])}catch(e){}renderView();toast(was?'Day freed':'Day blocked')},
 calopen:a=>{const r=R.find(x=>x.id===a||x.id===xe(a));if(r)detail(r.id);else toast('Request not found')},
 renter:a=>renterSheet(a),
 rcopy:a=>{(navigator.clipboard?navigator.clipboard.writeText(a):Promise.reject()).then(()=>toast('Copied')).catch(()=>toast(a))},
 rnote:a=>{const t=(document.getElementById('rnote')||{}).value||'';NOTES[a]=t.trim();lss('rnotes',NOTES);DB.pushNote(a,NOTES[a]).then(ok=>toast(ok?'Note saved':DB.staff()?'Saved on this device only (run the updated database script)':'Saved on this device only'));close();renderView()},
 setreset:()=>{renderView();toast('Changes undone')},
 staffadd:()=>{const i=document.getElementById('staffnew'),e=(i&&i.value||'').trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(e)){toast('Enter a valid email');return}
  DB.staffAdd(e).then(()=>{STAFF=null;renderView();toast('Added. Create their login in Supabase too.')}).catch(()=>toast((STAFF||[]).some(x=>x.toLowerCase()===e)?'Already on the staff list':'Could not add. Check your connection.'))},
 staffdel:a=>{if(!confirm('Remove '+a+' from staff? They will no longer be able to sign in to Admin.'))return;DB.staffDel(a).then(()=>{STAFF=null;renderView();toast('Removed')}).catch(()=>toast('Could not remove'))}});
document.addEventListener('submit',e=>{if(e.target.id!=='setf')return;e.preventDefault();const s=readSet(),err=checkSet(s);if(err){toast(err);return}
 lss('site',s);applySite(s);DB.pushKV('site',s).then(ok=>toast(ok?'Saved. Visitors get it on their next visit.':DB.supa()?(DB.staff()?'Saved on this device. Could not reach the database, try Save again.':'Saved on this device only. Sign in to publish.'):'Saved on this device (test mode).'));renderView()});

/* ---------------- styles ---------------- */
const css=document.createElement('style');css.textContent=`
.cbar{display:flex;gap:8px;align-items:center;margin:0 0 10px;flex-wrap:wrap}.cbar b{min-width:130px;text-align:center}
.cwrap{overflow:auto;border:1px solid var(--line);border-radius:14px;max-height:calc(100vh - 230px)}
.cgrid{border-collapse:separate;border-spacing:0;font-size:12px;min-width:100%}
.cgrid th,.cgrid td{border-bottom:1px solid var(--line);border-right:1px solid var(--line);text-align:center;padding:0;height:40px;min-width:30px}
.cgrid thead th{position:sticky;top:0;background:var(--surface);z-index:2;font-weight:700;padding:4px 0;height:auto}.cgrid thead th small{display:block;font-size:10px;color:var(--muted);font-weight:500}
.cgrid th.cwe{color:var(--accent)}.cgrid th.ctd{background:color-mix(in srgb,var(--accent) 18%,var(--surface))}
.cgrid .cvn{position:sticky;left:0;background:var(--surface);z-index:1;text-align:left;padding:6px 10px;min-width:150px;max-width:180px}.cgrid thead .cvn{z-index:3}
.cvn .lnk{font-weight:700;font-size:13px;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;display:block}.cvn small{display:block;font-size:10px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cgrid td{cursor:pointer}.cgrid td:hover{outline:2px solid var(--accent);outline-offset:-2px}
.cgrid td.cbk{background:var(--accent);color:var(--accent-ink);font-weight:800}.cgrid td.cpend{background:color-mix(in srgb,#F5B35A 30%,transparent);color:#F5B35A;font-weight:800}
.cgrid td.cbl{background:repeating-linear-gradient(135deg,var(--muted) 0 3px,transparent 3px 7px);opacity:.7}.cgrid td.cpa{cursor:default;background:color-mix(in srgb,var(--line) 40%,transparent)}.cgrid td.cpa:hover{outline:0}
.clg{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-size:12px;color:var(--muted)}.clg i{display:inline-block;width:14px;height:14px;border-radius:4px;margin-right:6px;vertical-align:-2px;border:1px solid var(--line)}
.clg i.cbk{background:var(--accent);border:0}.clg i.cpend{background:color-mix(in srgb,#F5B35A 30%,transparent)}.clg i.cbl{background:repeating-linear-gradient(135deg,var(--muted) 0 3px,transparent 3px 7px)}
.rbar{display:flex;gap:10px;align-items:center;margin:0 0 10px}.rinp{flex:1;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:12px;padding:10px 12px;font:inherit}
.rlist{display:grid;gap:6px}.rrow{display:grid;grid-template-columns:36px minmax(0,1.6fr) 80px 110px minmax(0,1.4fr);gap:12px;align-items:center;text-align:left;padding:10px 12px;border:1px solid var(--line);border-radius:14px;background:var(--surface);color:var(--ink);font:inherit;cursor:pointer}
.rrow:hover{border-color:var(--accent)}.rav{width:36px;height:36px;border-radius:50%;background:color-mix(in srgb,var(--accent) 22%,var(--surface));color:var(--accent);display:grid;place-items:center;font-style:normal;font-weight:800}
.rnm b,.rst b{display:block}.rnm small,.rst small{color:var(--muted);font-size:12px}.rnm b,.rnm small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rtg{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}.rtg em{font-style:normal;font-size:11px;font-weight:700;border-radius:999px;padding:2px 8px;background:var(--bg);color:var(--muted)}.rtg .ron{background:color-mix(in srgb,var(--accent) 20%,transparent);color:var(--accent)}.rtg .rcx{color:var(--bad,#C62828)}
@media(max-width:760px){.rrow{grid-template-columns:36px minmax(0,1fr) auto}.rrow .rst:nth-of-type(3),.rrow .rtg{display:none}}
.racts{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}.racts a{text-decoration:none}
.rkv{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);font-size:14px}.rkv span{color:var(--muted)}
.rh{font-size:14px;margin:16px 0 6px}.rtrip{display:flex;justify-content:space-between;align-items:center;gap:10px;width:100%;text-align:left;padding:9px 10px;border:1px solid var(--line);border-radius:12px;margin-bottom:6px;background:var(--surface);color:var(--ink);font:inherit;cursor:pointer}
.rtrip small{display:block;color:var(--muted);font-size:12px}.rtrip em{font-style:normal;font-size:11px;font-weight:700;border-radius:999px;padding:2px 8px;background:var(--bg)}
#rnote,.sf textarea{width:100%;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:12px;padding:10px 12px;font:inherit;resize:vertical}
.setf{display:grid;gap:12px}.scard{border:1px solid var(--line);border-radius:16px;padding:14px 16px;background:var(--surface);margin-bottom:12px}.scard h2{font-size:16px;margin:0 0 10px}
.s2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}@media(max-width:760px){.s2{grid-template-columns:minmax(0,1fr)}}
.sf{display:grid;gap:4px;margin-bottom:10px}.sf span{font-size:12px;font-weight:700;color:var(--muted)}.sf input,.sf select{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:12px;padding:10px 12px;font:inherit;width:100%;box-sizing:border-box}
.ssw{display:flex;gap:12px;align-items:flex-start;padding:8px 0;cursor:pointer}.ssw input{position:absolute;opacity:0}.ssw i{flex:none;width:40px;height:24px;border-radius:12px;background:var(--line);position:relative;transition:.15s;margin-top:2px}
.ssw i:after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.15s}.ssw input:checked+i{background:var(--accent)}.ssw input:checked+i:after{left:19px}.ssw input:focus-visible+i{outline:2px solid var(--accent);outline-offset:2px}
.ssw b{display:block}.ssw small{color:var(--muted);font-size:12px}
.sbar{position:sticky;bottom:0;display:flex;justify-content:flex-end;gap:8px;padding:10px 0;background:linear-gradient(transparent,var(--bg) 30%)}
.srow{display:flex;gap:8px;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)}`;document.head.appendChild(css);
if(view==='calendar'||view==='renters'||view==='settings')renderView();else nav();
})();
