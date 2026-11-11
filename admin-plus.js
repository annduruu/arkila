/* Admin extras: message templates, payments, pick-up/return checklist, vehicle papers & service.
   Saved to the database (staff-only rows in "notes") and cached on this device. Loaded after admin-x.js. */
(function(){
const e2=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const peso=n=>'₱'+Math.round(+n||0).toLocaleString('en-PH');
const isoNow=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const dShort=s=>{if(!s)return '';const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en',{month:'short',day:'numeric',year:y!==new Date().getFullYear()?'numeric':undefined})};
const daysTo=s=>{if(!s)return null;const [y,m,d]=s.split('-').map(Number);return Math.round((new Date(y,m-1,d)-new Date(new Date().setHours(0,0,0,0)))/864e5)};
const DX=Object.assign({pay:{},chk:{},pap:{},tpl:null},lsg('dx',{}));
/* ---- sync with the database (staff-only "notes" rows, keys start with "x.") ----
   payments x.pay.<request>, checklist x.chk.<request>, checklist photos x.ph.<request> (loaded when a request is opened),
   papers x.pap.<vehicle>, message templates x.tpl. A change made here wins until it has been sent. */
let SYNC=lsg('dxsync',{}),_st=0,_warned=false;
/* photos: PHR = requests whose photos are known on this device (loaded from the database, or added here);
   only those are ever sent, so a device that hasn't loaded them can't wipe them */
const PHR=new Set(),PHL=new Set();
const live=()=>DB.supa()&&DB.staff();
const hsh=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return s.length+':'+h};
const phOf=c=>({out:c.out.ph||[],in:c.in.ph||[]});
/* photos still on this device from before (not yet sent) count as known */
Object.keys(DX.chk||{}).forEach(id=>{const c=DX.chk[id];if(c&&((c.out&&c.out.ph||[]).length||(c.in&&c.in.ph||[]).length))PHR.add(id)});
function KEYS(){const o={},has=x=>Object.values(x).some(v=>Array.isArray(v)?v.length:v&&typeof v==='object'?Object.values(v).some(Boolean):!!v);
 Object.keys(DX.pay).forEach(id=>{const k='x.pay.'+id;if(has(DX.pay[id])||SYNC[k]!==undefined)o[k]=DX.pay[id]});
 Object.keys(DX.chk).forEach(id=>{const c=DX.chk[id],st=s=>({km:s.km,fuel:s.fuel,notes:s.notes,at:s.at}),f=s=>s.km||s.fuel||s.notes;if(f(c.out)||f(c.in)||SYNC['x.chk.'+id]!==undefined)o['x.chk.'+id]={out:st(c.out),in:st(c.in)};
  const ph=phOf(c);if(PHR.has(id)&&(ph.out.length||ph.in.length||SYNC['x.ph.'+id]!==undefined))o['x.ph.'+id]=ph});
 Object.keys(DX.pap).forEach(id=>{const k='x.pap.'+id;if(has(DX.pap[id])||SYNC[k]!==undefined)o[k]=DX.pap[id]});if(DX.tpl)o['x.tpl']=DX.tpl;return o}
const sig=(k,v)=>k.startsWith('x.ph.')?hsh(JSON.stringify(v)):JSON.stringify(v);
const unsent=()=>{const o=KEYS();return Object.keys(o).filter(k=>SYNC[k]!==sig(k,o[k]))};
function saveLocal(){/* photos are kept on this device only until the database has them */
 if(!DB.supa())return lss('dx',DX);const c={};Object.keys(DX.chk).forEach(id=>{const k=DX.chk[id],ph=phOf(k),keep=PHR.has(id)&&SYNC['x.ph.'+id]!==hsh(JSON.stringify(ph));c[id]={out:Object.assign({},k.out,{ph:keep?ph.out:[]}),in:Object.assign({},k.in,{ph:keep?ph.in:[]})}});return lss('dx',Object.assign({},DX,{chk:c}))}
const save=()=>{const ok=saveLocal();clearTimeout(_st);_st=setTimeout(pushAll,600);return ok!==false};
let _pushing=false;
async function pushAll(){if(!live()||_pushing)return;_pushing=true;try{const o=KEYS();let fail=false,sent=false;for(const k in o){const s=sig(k,o[k]);if(SYNC[k]===s)continue;if(await DB.pushPriv(k,o[k])){SYNC[k]=s;sent=true}else fail=true}lss('dxsync',SYNC);if(sent)saveLocal();
 if(fail&&!_warned){_warned=true;toast('Saved on this device. Could not reach the database, will retry.')}if(!fail)_warned=false}finally{_pushing=false}}
async function pullX(){if(!live())return;const rows=await DB.pullPriv();if(!rows)return;const local=KEYS();let ch=false;
 rows.forEach(r=>{const k=r.key,s=JSON.stringify(r.data);if(SYNC[k]===s)return;
  if(local[k]!==undefined&&JSON.stringify(local[k])!==SYNC[k])return;/* changed here and not sent yet: keep it, it is sent next */
  const m=k.match(/^x\.(pay|chk|pap)\.(.+)$/),d=r.data||{};
  if(m&&m[1]==='pay')DX.pay[m[2]]=Object.assign({list:[],dep:{a:'',st:''},refunded:false},d);
  else if(m&&m[1]==='pap')DX.pap[m[2]]=Object.assign({orcr:'',ctpl:'',svc:'',svcKm:'',log:[]},d);
  else if(m&&m[1]==='chk'){const o=DX.chk[m[2]],e={km:'',fuel:'',notes:'',at:''};DX.chk[m[2]]={out:Object.assign({},e,d.out,{ph:o?o.out.ph:[]}),in:Object.assign({},e,d.in,{ph:o?o.in.ph:[]})}}
  else if(k==='x.tpl')DX.tpl=d;else return;SYNC[k]=s;ch=true});
 lss('dxsync',SYNC);if(ch){saveLocal();renderView()}pushAll()}
function pullPhotos(id){if(!live()||PHL.has(id))return;PHL.add(id);DB.pullPh('x.ph.'+id).then(d=>{const c=chkOf(id),k='x.ph.'+id;
 if(d===undefined){PHL.delete(id);return}/* offline: try again next time; until then these photos are never sent */
 if(d&&!(PHR.has(id)&&SYNC[k]!==hsh(JSON.stringify(phOf(c))))){c.out.ph=d.out||[];c.in.ph=d.in||[];SYNC[k]=hsh(JSON.stringify(phOf(c)));lss('dxsync',SYNC)}
 PHR.add(id);saveLocal();
 const sh=document.getElementById('sh');if(sh&&sh.dataset.dx===id&&document.querySelector('#ov.on')&&sh.querySelector('[data-dxsec="chk"]'))detail(id)})}


/* ---------- 1. Message templates ---------- */
const TPL0=[
 ['confirm','Confirm','Hi {first}! Your request {id} for the {vehicle} ({dates}, pick-up {time} at {area}) is confirmed. Total: {total}.\n{payinfo}'],
 ['decline','Not available','Hi {first}, sorry, the {vehicle} is not available for {dates}. Happy to suggest another vehicle for the same dates.'],
 ['pay','Payment reminder','Hi {first}, a friendly reminder that {balance} is still due for {id} ({vehicle}, {dates}).\n{payinfo}'],
 ['pickup','Pick-up details','Hi {first}! See you on {pickup} at {time}, {area}. Please bring your driver\'s licence and one valid ID. The {vehicle} will be ready.'],
 ['return','Return reminder','Hi {first}, reminder that the {vehicle} is due back on {return}. Please return it with the same fuel level. Thank you!'],
 ['thanks','Thank you','Thanks for riding with Arkila, {first}! We hope you enjoyed Palawan. See you next time.']];
const TOK=[['{first}','First name'],['{name}','Full name'],['{id}','Request ID'],['{vehicle}','Vehicle'],['{dates}','Dates'],['{pickup}','Pick-up date'],['{return}','Return date'],['{time}','Pick-up time'],['{area}','Pick-up area'],['{total}','Total'],['{balance}','Balance due'],['{payinfo}','Payment details']];
const tpls=()=>TPL0.map(t=>[t[0],t[1],(DX.tpl&&typeof DX.tpl[t[0]]==='string')?DX.tpl[t[0]]:t[2]]);
const fill=(txt,r)=>{const x=r._r||{},nm=String(x.guestName||'there').trim(),p=payInfo(r);const m={first:nm.split(/\s+/)[0],name:nm,id:x.id||'',vehicle:x.carName||'',dates:dShort(x.from)+' to '+dShort(x.to),pickup:dShort(x.from),return:dShort(x.to),time:x.time||'',area:x.spot||'',total:peso(r.total),balance:peso(p.bal),payinfo:(window.SITE&&SITE.payInfo)||''};
 return txt.replace(/\{(\w+)\}/g,(a,k)=>k in m?m[k]:a).replace(/\n\s*$/,'')};
const suggest=r=>{const p=payInfo(r);return r.status==='new'?'confirm':r.status==='declined'?'decline':r.status==='completed'?'thanks':r.status==='confirmed'?(p.bal>0?'pay':'pickup'):'confirm'};
let TPLSEL={};

/* ---------- 2. Payments ---------- */
const payOf=id=>DX.pay[id]||(DX.pay[id]={list:[],dep:{a:'',st:''},refunded:false});
function payInfo(r){const p=DX.pay[r.id]||{list:[],dep:{}},got=p.list.reduce((a,x)=>a+(+x.a||0),0),bal=Math.max(0,(+r.total||0)-got),refund=(r.status==='cancelled'||r.status==='declined')&&got>0&&!p.refunded;return {p,got,bal,refund}}
const METH=['GCash','Bank','Cash','Maya'];

/* ---------- 3. Pick-up / return checklist ---------- */
const FUEL=['E','¼','½','¾','F'];
const chkOf=id=>DX.chk[id]||(DX.chk[id]={out:{km:'',fuel:'',notes:'',ph:[],at:''},in:{km:'',fuel:'',notes:'',ph:[],at:''}});

/* ---------- 4. Papers & service ---------- */
const PAP=[['orcr','OR/CR registration'],['ctpl','CTPL insurance'],['svc','Next service']];
const papOf=id=>DX.pap[id]||(DX.pap[id]={orcr:'',ctpl:'',svc:'',svcKm:'',log:[]});
function dueList(){const o=[];V.forEach(v=>{const p=DX.pap[v.id];if(!p)return;PAP.forEach(([k,l])=>{const n=daysTo(p[k]);if(n!==null&&n<=30)o.push({v,k,l,n,d:p[k]})})});return o.sort((a,b)=>a.n-b.n)}
const dueTxt=n=>n<0?`${-n} day${n===-1?'':'s'} overdue`:n===0?'due today':`in ${n} day${n===1?'':'s'}`;


/* ---------- request sheet: replace the reply box, add Payments + Checklist ---------- */
const OPEN=new Set(['msg']);
const _detail=detail;
detail=function(id){const sh=document.getElementById('sh'),keep=sh&&document.querySelector('#ov.on')&&sh.dataset.dx===id?sh.scrollTop:0;_detail(id);const r=R.find(x=>x.id===id);if(!r)return;
 sh.dataset.dx=id;pullPhotos(id);const msg=sh.querySelector('.msg');if(msg){const b=msg.previousElementSibling,btn=msg.nextElementSibling;if(b&&b.tagName==='B')b.remove();if(btn&&btn.tagName==='BUTTON')btn.remove();msg.insertAdjacentHTML('beforebegin',sheetX(r));msg.remove()}
 sh.scrollTop=keep};
function sec(k,title,meta,body){return `<details class="dxs" data-dxsec="${k}" ${OPEN.has(k)?'open':''}><summary><b>${title}</b><span>${meta}</span></summary><div class="dxb">${body}</div></details>`}
function sheetX(r){const T=tpls(),sel=TPLSEL[r.id]||suggest(r),t=T.find(x=>x[0]===sel)||T[0],{p,got,bal,refund}=payInfo(r),k=DX.chk[r.id],kOut=k&&(k.out.km||k.out.fuel),kIn=k&&(k.in.km||k.in.fuel);
 const msgB=`<div class="dxchips">${T.map(x=>`<button type="button" class="dxc ${x[0]===t[0]?'on':''}" data-act="dxtpl" data-arg="${r.id}|${x[0]}">${x[1]}</button>`).join('')}</div><div class="msg dxmsg" id="dxmsg">${e2(fill(t[2],r))}</div><div class="dxrow"><button class="btn sm" data-act="dxcopy">${ic('copy')}Copy message</button><button class="lnkb" data-act="tab" data-arg="settings" title="Change the wording of every template">Edit templates</button></div>`;
 const payB=`<div class="dxsum"><div><span>Total</span><b>${peso(r.total)}</b></div><div><span>Received</span><b class="dxgood">${peso(got)}</b></div><div><span>${refund?'Refund due':'Balance'}</span><b class="${refund?'dxbad':bal>0?'dxwarn':'dxgood'}">${refund?peso(got):bal>0?peso(bal):'Paid in full'}</b></div></div>
  ${p.list.length?`<div class="dxlist">${p.list.map((x,i)=>`<div class="dxli"><span><b>${peso(x.a)}</b> · ${e2(x.m)}<small>${dShort(x.d)}${x.note?' · '+e2(x.note):''}</small></span><button class="dxx" data-act="dxpdel" data-arg="${r.id}|${i}" title="Remove this payment" aria-label="Remove payment">${ic('x')}</button></div>`).join('')}</div>`:'<p class="sub" style="margin:4px 0 8px">No payments recorded yet.</p>'}
  ${bal>0?`<div class="dxchips" style="margin:2px 0 4px"><span class="sub" style="font-size:12px;align-self:center">Quick fill:</span>${[[bal,'Full balance'],[Math.round(bal/2),'Half'],[Math.round((+r.total||0)*.3/100)*100,'30% down']].filter(x=>x[0]>0&&x[0]<=bal).map(x=>`<button type="button" class="dxc" data-act="dxfill" data-arg="${x[0]}" title="${peso(x[0])}">${x[1]}</button>`).join('')}</div>`:''}
  <div class="dxadd"><input id="dxpa" type="number" inputmode="numeric" placeholder="Amount" value="${bal>0?bal:''}"><select id="dxpm">${METH.map(m=>`<option>${m}</option>`).join('')}</select><input id="dxpd" type="date" value="${isoNow()}"><input id="dxpn" placeholder="Note (optional)"><button class="btn sm" data-act="dxpadd" data-arg="${r.id}">Add payment</button></div>
  <div class="dxdep"><span>Deposit</span><input type="number" placeholder="₱ amount" value="${e2(p.dep.a)}" data-dxdep="${r.id}|a">${['Held','Returned','Kept'].map(s=>`<button type="button" class="dxc ${p.dep.st===s?'on':''}" data-act="dxdep" data-arg="${r.id}|${s}">${s}</button>`).join('')}</div>
  ${refund?`<button class="btn g sm" data-act="dxrefund" data-arg="${r.id}">Mark refunded</button>`:''}`;
 const side=(w,l)=>{const s=(k||chkOf(r.id))[w];return `<div class="dxck"><h4>${l}${s.at?` <small>${dShort(s.at)}</small>`:''}</h4><label class="fl"><span>Odometer (km)</span><input type="number" inputmode="numeric" value="${e2(s.km)}" data-dxk="${r.id}|${w}|km" placeholder="e.g. 12450"></label><div class="fl"><span>Fuel</span><div class="dxchips">${FUEL.map(f=>`<button type="button" class="dxc ${s.fuel===f?'on':''}" data-act="dxfuel" data-arg="${r.id}|${w}|${f}">${f}</button>`).join('')}</div></div><label class="fl"><span>Damage / notes</span><textarea rows="2" data-dxk="${r.id}|${w}|notes" placeholder="Scratches, dents, missing items">${e2(s.notes)}</textarea></label><div class="dxph">${(s.ph||[]).map((u,i)=>`<span><img src="${e2(u)}" alt=""><button data-act="dxphdel" data-arg="${r.id}|${w}|${i}" aria-label="Remove photo">${ic('x')}</button></span>`).join('')}<label class="dxphadd" title="Add photos (front, back, sides, dashboard)">+<input type="file" accept="image/*" multiple data-dxph="${r.id}|${w}"></label></div></div>`};
 const kk=k||chkOf(r.id),km=(+kk.in.km&&+kk.out.km)?(+kk.in.km-+kk.out.km):null;
 const chkB=`<div class="dx2">${side('out','Pick-up')}${side('in','Return')}</div>${km!==null?`<div class="dxsum one"><div><span>Driven</span><b>${km.toLocaleString()} km</b></div><div><span>Fuel</span><b>${kk.out.fuel||'?'} → ${kk.in.fuel||'?'}</b></div></div>`:''}`;
 return sec('msg','Message','Messenger',msgB)+sec('pay','Payments',refund?'<em class="dxt bad">Refund due</em>':bal>0&&got>0?`<em class="dxt warn">${peso(bal)} due</em>`:got>0?'<em class="dxt good">Paid</em>':r.status==='confirmed'?'<em class="dxt warn">Unpaid</em>':'',payB)+sec('chk','Pick-up & return',kIn?'<em class="dxt good">Returned</em>':kOut?'<em class="dxt">Out</em>':'Not started',chkB)}

/* ---------- vehicle sheet: papers & service ---------- */
const _vPrev=vPrev;
vPrev=function(i){_vPrev(i);const v=vAt(i);if(!v)return;const b=document.querySelector('#sh .sh-b');if(!b)return;const p=papOf(v.id);
 b.insertAdjacentHTML('beforeend',`<div class="dxpap"><h4>Papers &amp; service</h4>${PAP.map(([k,l])=>{const n=daysTo(p[k]);return `<label class="dxpr"><span>${l}${n!==null&&n<=30?` <em class="dxt ${n<0?'bad':'warn'}">${dueTxt(n)}</em>`:''}</span><input type="date" value="${e2(p[k])}" data-dxpap="${v.id}|${k}"></label>`}).join('')}
 <label class="dxpr"><span>Next service at (km)</span><input type="number" inputmode="numeric" placeholder="e.g. 15000" value="${e2(p.svcKm)}" data-dxpap="${v.id}|svcKm"></label>
 <h4 style="margin-top:12px">Service log</h4>${p.log.length?p.log.map((x,j)=>`<div class="dxli"><span><b>${e2(x.w)}</b><small>${dShort(x.d)}${x.c?' · '+peso(x.c):''}</small></span><button class="dxx" data-act="dxldel" data-arg="${v.id}|${j}" aria-label="Remove">${ic('x')}</button></div>`).join(''):'<p class="sub" style="margin:2px 0 6px">Nothing logged yet.</p>'}
 <div class="dxadd"><input id="dxlw" placeholder="What was done (e.g. change oil)"><input id="dxld" type="date" value="${isoNow()}"><input id="dxlc" type="number" placeholder="Cost ₱"><button class="btn sm" data-act="dxladd" data-arg="${v.id}">Add</button></div></div>`);
 $('#sh').classList.remove('half')};

/* ---------- page additions: Overview cards, Vehicles badges, Settings templates ---------- */
const _rv=renderView;
renderView=function(){_rv();
 if(view==='overview'){const col=document.querySelector('#view .two > div');if(col){const due=dueList(),money=R.map(r=>({r,...payInfo(r)})).filter(o=>o.refund||(o.r.status==='confirmed'&&o.bal>0));
  col.insertAdjacentHTML('beforeend',`<div class="card"><h2>Money to collect <span class="dxh">${peso(money.filter(o=>!o.refund).reduce((a,o)=>a+o.bal,0))}</span></h2>${money.length?money.slice(0,5).map(o=>`<div class="rq" data-act="open" data-arg="${o.r.id}" title="Open ${o.r.id}">${th(o.r.v)}<div class="m"><b>${o.r.name}</b><small>${o.r.v} · pick-up ${fd(o.r.start)}</small></div>${o.refund?`<em class="dxt bad">Refund ${peso(o.got)}</em>`:`<em class="dxt warn">${peso(o.bal)} due</em>`}</div>`).join(''):'<div class="sub">Nothing to collect. Everyone has paid.</div>'}</div>
  <div class="card"><h2>Papers &amp; service due</h2>${due.length?due.map(o=>`<div class="rq" data-act="vpv" data-arg="${e2(o.v.id)}" title="${o.l}: ${dShort(o.d)}"><div class="m"><b>${o.v.name}</b><small>${o.l} · ${dShort(o.d)}</small></div><em class="dxt ${o.n<0?'bad':'warn'}">${dueTxt(o.n)}</em></div>`).join(''):'<div class="sub">Nothing due in the next 30 days.</div>'}</div>`)}}
 if(view==='vehicles'){const due=dueList();document.querySelectorAll('#view .vr[data-arg]').forEach(el=>{const d=due.filter(o=>String(o.v.id)===el.dataset.arg);if(!d.length)return;const w=d[0];const s=el.querySelector('.vm > span');if(s)s.insertAdjacentHTML('beforeend',` <em class="dxt ${w.n<0?'bad':'warn'}" title="${d.map(o=>o.l+' '+dueTxt(o.n)).join(' · ')}">${w.n<0?'Papers overdue':'Papers due'}</em>`)})}
 if(view==='settings'){const f=document.getElementById('setf');if(f){const T=tpls();f.insertAdjacentHTML('afterend',`<section class="scard" id="dxtplc"><h2>Message templates</h2><p class="sub" style="margin:-4px 0 10px">Used in every request's Message box. Tap a tag to add it where the cursor is.</p><div class="dxchips" style="margin-bottom:10px">${TOK.map(t=>`<button type="button" class="dxc" data-act="dxtok" data-arg="${t[0]}" title="${t[1]}">${t[0]}</button>`).join('')}</div>${T.map(t=>`<label class="sf"><span>${t[1]}</span><textarea rows="3" data-dxtpl="${t[0]}">${e2(t[2])}</textarea></label>`).join('')}<div class="dxrow" style="justify-content:flex-end"><button class="btn g" data-act="dxtplreset">Reset to default</button><button class="btn" data-act="dxtplsave">Save templates</button></div></section>`)}}};

/* ---------- actions ---------- */
const reopen=id=>detail(id);
let LASTTA=null;document.addEventListener('focusin',e=>{if(e.target.matches&&e.target.matches('[data-dxtpl]'))LASTTA=e.target});
Object.assign(A,{
 dxtpl:a=>{const [id,k]=a.split('|');TPLSEL[id]=k;OPEN.add('msg');reopen(id)},
 dxcopy:()=>{const t=(document.getElementById('dxmsg')||{}).textContent||'';(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Message copied')).catch(()=>toast('Select the text and copy it'))},
 dxpadd:a=>{const amt=+(document.getElementById('dxpa').value||0);if(!(amt>0)){toast('Enter an amount');return}const p=payOf(a);p.list.push({a:amt,m:document.getElementById('dxpm').value,d:document.getElementById('dxpd').value||isoNow(),note:(document.getElementById('dxpn').value||'').trim().slice(0,80)});save();
  const r=R.find(x=>x.id===a);if(r&&payInfo(r).bal===0&&!r.pay&&r.status==='confirmed'){A.pay(a)}OPEN.add('pay');reopen(a);renderView();toast('Payment added')},
 dxpdel:a=>{const [id,i]=a.split('|');if(!confirm('Remove this payment?'))return;payOf(id).list.splice(+i,1);save();{const r=R.find(x=>x.id===id);if(r&&r.pay&&payInfo(r).bal>0)A.pay(id)}OPEN.add('pay');reopen(id);renderView()},
 dxdep:a=>{const [id,s]=a.split('|'),p=payOf(id);p.dep.st=p.dep.st===s?'':s;save();OPEN.add('pay');reopen(id)},
 dxrefund:a=>{payOf(a).refunded=true;save();OPEN.add('pay');reopen(a);renderView();toast('Marked refunded')},
 dxfuel:a=>{const [id,w,f]=a.split('|'),s=chkOf(id)[w];s.fuel=s.fuel===f?'':f;if(!s.at)s.at=isoNow();save();OPEN.add('chk');reopen(id)},
 dxphdel:a=>{const [id,w,i]=a.split('|');PHR.add(id);chkOf(id)[w].ph.splice(+i,1);save();OPEN.add('chk');reopen(id)},
 dxladd:a=>{const w=(document.getElementById('dxlw').value||'').trim();if(!w){toast('Say what was done');return}papOf(a).log.unshift({w:w.slice(0,80),d:document.getElementById('dxld').value||isoNow(),c:document.getElementById('dxlc').value||''});save();vPrev(a);toast('Added to service log')},
 dxldel:a=>{const [id,j]=a.split('|');papOf(id).log.splice(+j,1);save();vPrev(id)},
 dxtok:a=>{const t=LASTTA||document.querySelector('[data-dxtpl]');if(!t)return;const s=t.selectionStart??t.value.length;t.value=t.value.slice(0,s)+a+t.value.slice(t.selectionEnd??s);t.focus();t.setSelectionRange(s+a.length,s+a.length)},
 dxtplsave:()=>{const o={};document.querySelectorAll('[data-dxtpl]').forEach(t=>o[t.dataset.dxtpl]=t.value);DX.tpl=o;save();toast('Templates saved')},
 dxtplreset:()=>{if(!confirm('Put all templates back to the default wording?'))return;DX.tpl={};save();renderView();toast('Templates reset')}});
/* remember which sections are open */
document.addEventListener('toggle',e=>{const d=e.target;if(d.dataset&&d.dataset.dxsec){d.open?OPEN.add(d.dataset.dxsec):OPEN.delete(d.dataset.dxsec)}},true);
/* typed fields save as you go */
document.addEventListener('change',e=>{const t=e.target;
 if(t.dataset.dxk){const [id,w,f]=t.dataset.dxk.split('|'),s=chkOf(id)[w];s[f]=t.value.slice(0,1000);if(!s.at)s.at=isoNow();save();return}
 if(t.dataset.dxdep){const [id]=t.dataset.dxdep.split('|');payOf(id).dep.a=t.value;save();return}
 if(t.dataset.dxpap){const [id,f]=t.dataset.dxpap.split('|');papOf(id)[f]=t.value;save();vPrev(id);toast('Saved');return}
 if(t.dataset.dxph){const [id,w]=t.dataset.dxph.split('|'),s=chkOf(id)[w],fs=[...t.files].slice(0,8-s.ph.length);if(!fs.length){toast('Up to 8 photos each');return}
  Promise.all(fs.map(f=>new Promise(ok=>{const im=new Image(),u=URL.createObjectURL(f);im.onload=()=>{const c=document.createElement('canvas'),k=Math.min(1,480/Math.max(im.width,im.height));c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.7))};im.onerror=()=>ok(null);im.src=u}))).then(a=>{s.ph.push(...a.filter(Boolean));PHR.add(id);if(!s.at)s.at=isoNow();if(!save())toast('Phone storage full');OPEN.add('chk');reopen(id)})}});

/* ---------- styles (admin colours and fonts) ---------- */
const st=document.createElement('style');st.textContent=`
.dxs{border:1px solid var(--line);border-radius:14px;margin:10px 0;background:var(--surface)}.dxs>summary{display:flex;align-items:center;gap:8px;padding:12px 14px;cursor:pointer;list-style:none}.dxs>summary::-webkit-details-marker{display:none}
.dxs>summary:after{content:'▾';color:var(--muted);margin-left:8px;transition:.15s;flex:none}.dxs[open]>summary:after{transform:rotate(180deg)}
.dxs>summary span{margin-left:auto;color:var(--muted);font-size:12px}.dxb{padding:0 14px 14px}
.dxchips{display:flex;flex-wrap:wrap;gap:6px}.dxc{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:999px;padding:6px 11px;font:600 13px var(--f-body);cursor:pointer}.dxc:hover{border-color:var(--accent)}.dxc.on{background:var(--ink);color:var(--surface);border-color:var(--ink)}
.dxmsg{margin:10px 0;white-space:pre-line}.dxrow{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.dxsum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 10px}.dxsum.one{grid-template-columns:repeat(2,1fr);margin-top:10px}.dxsum div{background:var(--bg);border-radius:12px;padding:8px 10px}.dxsum span{display:block;font-size:11px;color:var(--muted);font-weight:700}.dxsum b{font-size:15px}
.dxgood{color:var(--good)}.dxbad{color:var(--bad)}.dxwarn{color:#B26A00}
.dxt{font-style:normal;font-size:11px;font-weight:700;border-radius:999px;padding:2px 8px;background:var(--bg);color:var(--muted);white-space:nowrap}.dxt.good{background:color-mix(in srgb,var(--good) 14%,transparent);color:var(--good)}.dxt.warn{background:color-mix(in srgb,var(--sun) 35%,transparent);color:#8A5200}.dxt.bad{background:color-mix(in srgb,var(--bad) 14%,transparent);color:var(--bad)}
:root[data-theme=dark] .dxt.warn,:root[data-theme=dark] .dxwarn{color:var(--sun)}@media(prefers-color-scheme:dark){:root:not([data-theme=light]) .dxt.warn,:root:not([data-theme=light]) .dxwarn{color:var(--sun)}}
.dxlist{display:grid;gap:6px;margin-bottom:10px}.dxli{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--line);border-radius:12px;font-size:14px}.dxli small{display:block;color:var(--muted);font-size:12px}
.dxx{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:var(--muted);flex:none}.dxx:hover{background:var(--bg);color:var(--bad)}.dxx .i{width:14px;height:14px}
.dxadd{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0}.dxadd .btn{grid-column:1/-1}.dxadd input,.dxadd select,.dxdep input,.dxpr input{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:10px;padding:8px 10px;font:inherit;min-width:0}
.dxdep{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:10px 0}.dxdep span{font-size:12px;font-weight:700;color:var(--muted);margin-right:4px}.dxdep input{width:110px}
.dx2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.dxck .dxchips{gap:4px;flex-wrap:nowrap}.dxck .dxc{padding:5px 0;flex:1;text-align:center}.dxck h4{margin:0 0 8px;font-size:14px}.dxck h4 small{color:var(--muted);font-weight:500}
.dxph{display:flex;gap:6px;flex-wrap:wrap}.dxph span{position:relative}.dxph img{width:56px;height:56px;object-fit:cover;border-radius:10px;border:1px solid var(--line);display:block}.dxph span button{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:var(--ink);color:var(--surface);display:grid;place-items:center}.dxph span button .i{width:11px;height:11px}
.dxphadd{width:56px;height:56px;border:1.5px dashed var(--line);border-radius:10px;display:grid;place-items:center;font-size:22px;color:var(--muted);cursor:pointer}.dxphadd:hover{border-color:var(--accent);color:var(--accent)}.dxphadd input{display:none}
.dxpap{border-top:1px solid var(--line);margin-top:14px;padding-top:12px}.dxpap h4{margin:0 0 8px;font-size:14px}.dxpr{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:6px 0;font-size:14px}.dxpr span{color:var(--muted)}.dxpr input{width:170px}
.dxpap .dxadd #dxlw{grid-column:1/-1}
.dxh{float:right;font:800 15px var(--f-display);color:var(--accent)}
@media(max-width:760px){.dx2{grid-template-columns:1fr}.dxsum{grid-template-columns:1fr 1fr 1fr}}`;document.head.appendChild(st);
/* keep in step with the database: on every Admin refresh, and right away */
const _ap=adminPull;adminPull=async function(f){const r=await _ap(f);pullX();return r};setTimeout(pullX,1500);
addEventListener('online',pushAll);
/* signing out leaves no payments, notes or photos on this device */
const _so=A.signout;A.signout=()=>{const n=unsent().length+(lsg('outbox',[])||[]).length;if(n&&!confirm(n+' change'+(n>1?'s have':' has')+' not reached the database yet (no connection). If you sign out now they are lost. Sign out anyway?'))return;DX.pay={};DX.chk={};DX.pap={};DX.tpl=null;SYNC={};PHL.clear();PHR.clear();lss('dx',{});lss('dxsync',{});lss('rnotes',{});_so()};window.DXAPI={DX,payInfo,dueList,dueTxt,chkOf,papOf,peso,dShort,daysTo,PAP,e2};
renderView();
})();

/* Admin extras, part 2: hover cards, money/hand-over filters, calendar booking bars + drag to block,
   renter sorting/filters, vehicle "Papers due" tab. Uses part 1 above. */
(function(){
const X=window.DXAPI;if(!X)return;const {payInfo,dueList,dueTxt,peso,dShort,daysTo,PAP,e2}=X;
const isoT=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const chk=id=>X.DX.chk[id];const outDone=id=>{const k=chk(id);return !!(k&&(k.out.km||k.out.fuel))},inDone=id=>{const k=chk(id);return !!(k&&(k.in.km||k.in.fuel))};
A.dxfill=a=>{const i=document.getElementById('dxpa');if(i){i.value=a;i.focus()}};

/* ---------------- hover cards ---------------- */
const tip=document.createElement('div');tip.id='dxtip';document.body.appendChild(tip);let tT=0,tEl=null;
const rkey=x=>{const ph=String(x.guestPhone||'').replace(/\D/g,'');return ph?'p'+ph.slice(-10):x.guestEmail?'e'+String(x.guestEmail).toLowerCase():'i'+x.id};
function reqCard(id){const r=R.find(x=>x.id===id);if(!r)return '';const x=r._r||{},{got,bal,refund}=payInfo(r);
 const hand=inDone(r.id)?'Returned · checklist done':outDone(r.id)?'Picked up · return not recorded':r.status==='confirmed'?'Not picked up yet':'';
 return `<b>${r.name}</b><small>${r.id} · ${chip(r).replace(/<[^>]+>/g,'')}</small><div class="tk"><span>Vehicle</span>${r.v}</div><div class="tk"><span>Dates</span>${fd(r.start)} → ${fd(r.end)} · ${r.days} day${r.days>1?'s':''}</div><div class="tk"><span>Pick-up</span>${r.time||'—'} · ${r.area||'—'}</div>
 <div class="tk"><span>Total</span>${peso(r.total)}</div>${r.status==='confirmed'||got?`<div class="tk"><span>Received</span>${peso(got)}</div>`:''}${refund?`<div class="tk bad"><span>Refund due</span>${peso(got)}</div>`:r.status==='confirmed'||got?`<div class="tk ${bal?'warn':'good'}"><span>Balance</span>${bal?peso(bal):'Paid in full'}</div>`:''}${hand?`<div class="tk"><span>Hand-over</span>${hand}</div>`:''}${r.phone?`<div class="tk"><span>Mobile</span>${r.phone}</div>`:''}<em>Click to open</em>`}
function renterCard(k){const T=ST.requests.filter(x=>rkey(x)===k).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));if(!T.length)return '';const f=T[0],owe=T.reduce((a,x)=>{const r=R.find(y=>y.id===e2(x.id)||y.id===x.id);return a+(r&&r.status==='confirmed'?payInfo(r).bal:0)},0),note=(lsg('rnotes',{})||{})[k]||'',days=T.filter(x=>['confirmed','approved','completed'].includes(x.status)).reduce((a,x)=>a+(+x.days||0),0);
 const fav=Object.entries(T.reduce((o,x)=>(o[x.carName]=(o[x.carName]||0)+1,o),{})).sort((a,b)=>b[1]-a[1])[0];
 return `<b>${e2(f.guestName||'Renter')}</b><small>${e2(f.guestPhone||f.guestEmail||'')}</small><div class="tk"><span>Requests</span>${T.length}</div><div class="tk"><span>Days rented</span>${days}</div><div class="tk"><span>Last trip</span>${e2(f.carName)} · ${dShort(f.from)}</div>${fav&&T.length>1?`<div class="tk"><span>Favourite</span>${e2(fav[0])}</div>`:''}${owe?`<div class="tk warn"><span>Owes</span>${peso(owe)}</div>`:''}${note?`<div class="tn">“${e2(note.slice(0,120))}${note.length>120?'…':''}”</div>`:''}<em>Click for trips and notes</em>`}
function vehCard(id){const v=vAt(id);if(!v)return '';const p=X.DX.pap[v.id]||{},t=isoT(),bk=ST.requests.filter(x=>x.carId===v.id&&['confirmed','approved','completed'].includes(x.status));
 const mo=new Date(),mStart=new Date(mo.getFullYear(),mo.getMonth(),1),mEnd=new Date(mo.getFullYear(),mo.getMonth()+1,0),nd=mEnd.getDate();let used=0;bk.forEach(x=>{dayList(x.from,x.to).forEach(d=>{const [y,m]=d.split('-').map(Number);if(y===mo.getFullYear()&&m===mo.getMonth()+1)used++})});
 return `<b>${v.name}</b><small>${v.sub} · ${money(v.p)} / day</small><div class="tk"><span>Next</span>${nextBusy(v)}</div><div class="tk"><span>This month</span>${Math.min(100,Math.round(used/nd*100))}% booked</div>${PAP.map(([k,l])=>{const n=daysTo(p[k]);return p[k]?`<div class="tk ${n!==null&&n<0?'bad':n!==null&&n<=30?'warn':''}"><span>${l}</span>${dShort(p[k])}${n!==null&&n<=30?' · '+dueTxt(n):''}</div>`:''}).join('')||''}${!PAP.some(([k])=>p[k])?'<div class="tk"><span>Papers</span>Not entered yet</div>':''}<em>Click to open</em>`}
function cardFor(el){const o=el.closest('[data-act="open"],[data-act="calopen"]');if(o)return reqCard(o.dataset.arg);const rn=el.closest('[data-act="renter"]');if(rn)return renterCard(rn.dataset.arg);const v=el.closest('[data-act="vpv"],.cvn [data-act="editv"]');if(v)return vehCard(v.dataset.arg);return ''}
const hideTip=()=>{clearTimeout(tT);tip.classList.remove('on');tEl=null};
document.addEventListener('mouseover',e=>{if(matchMedia('(hover:none)').matches)return;const el=e.target.closest&&e.target.closest('#view [data-act="open"],#view [data-act="calopen"],#view [data-act="renter"],#view [data-act="vpv"],#view .cvn [data-act="editv"]');
 if(el===tEl)return;hideTip();if(!el||e.target.closest('button.btn,input,.tg'))return;tEl=el;tT=setTimeout(()=>{const h=cardFor(el);if(!h)return;tip.innerHTML=h;tip.classList.add('on');const b=el.getBoundingClientRect(),w=tip.offsetWidth,ht=tip.offsetHeight;
  let x=el.tagName==='TD'?b.left+b.width/2-w/2:Math.min(b.right-w,e.clientX+12),y=b.bottom+8;if(y+ht>innerHeight-8)y=b.top-ht-8;x=Math.max(8,Math.min(x,innerWidth-w-8));tip.style.left=x+'px';tip.style.top=Math.max(8,y)+'px'},350)});
document.addEventListener('mouseout',e=>{if(tEl&&!tEl.contains(e.relatedTarget))hideTip()});addEventListener('scroll',hideTip,true);document.addEventListener('click',hideTip,true);

/* ---------------- Requests: money + hand-over quick filters ---------------- */
const DQ=new Set();
const DQF={'Balance due':r=>r.status==='confirmed'&&payInfo(r).bal>0&&payInfo(r).got>0,'Refund due':r=>payInfo(r).refund,'To hand over':r=>r.status==='confirmed'&&!outDone(r.id)&&(r.start-TODAY)<=2*864e5,'Not returned':r=>r.status==='confirmed'&&r.end<TODAY&&!inDone(r.id)};
A.dxq=a=>{DQ.has(a)?DQ.delete(a):DQ.add(a);renderView()};
/* select-all and CSV export follow the money / hand-over filters too */
['selall','exreq'].forEach(n=>{const f=A[n];if(f)A[n]=(...a)=>{if(!DQ.size)return f(...a);const all=R;R=R.filter(r=>[...DQ].every(k=>DQF[k](r)));try{return f(...a)}finally{R=all}}});
/* Settings: typing is kept when a background refresh redraws the page */
let SETDIRTY=false;document.addEventListener('input',e=>{if(e.target.closest&&e.target.closest('#setf,#dxtplc'))SETDIRTY=true});
document.addEventListener('submit',e=>{if(e.target.id==='setf')SETDIRTY=false},true);
['setreset','dxtplsave','dxtplreset'].forEach(n=>{const f=A[n];if(f)A[n]=(...a)=>{SETDIRTY=false;return f(...a)}});
const _fclear=A.fclear;if(_fclear)A.fclear=a=>{DQ.clear();_fclear(a)};

/* ---------------- Calendar state ---------------- */
let CT='all',DRAG=null,SUPPRESS=0,CAL_SCROLLED='';
A.dxct=a=>{CT=a;renderView()};
const _calx=A.calx;A.calx=a=>{if(Date.now()-SUPPRESS<400)return;_calx(a)};

/* ---------------- Renters state ---------------- */
const RS={sort:'recent',f:new Set()};
A.dxrs=a=>{RS.sort=a;renderView()};A.dxrf=a=>{RS.f.has(a)?RS.f.delete(a):RS.f.add(a);renderView()};

/* ---------------- Vehicles: Papers due tab ---------------- */
let PDUE=false;const _vfil=A.vfil;A.vfil=a=>{PDUE=false;_vfil(a)};A.dxpdue=()=>{PDUE=!PDUE;renderView()};

const _rv=renderView;
renderView=function(){hideTip();if(view!=='calendar')CAL_SCROLLED='';
 const keep=view==='settings'&&SETDIRTY?[...document.querySelectorAll('#setf [name],[data-dxtpl]')].map(e=>[e.name?'[name="'+e.name+'"]':'[data-dxtpl="'+e.dataset.dxtpl+'"]',e.type==='checkbox'?e.checked:e.value,e.type==='checkbox']):null;
 if(view==='requests'&&DQ.size){const all=R;R=R.filter(r=>[...DQ].every(k=>DQF[k](r)));try{_rv()}finally{R=all}}else _rv();
 if(keep)keep.forEach(([q,v,cb])=>{const e=document.querySelector((q.startsWith('[name')?'#setf ':'')+q);if(e){if(cb)e.checked=v;else e.value=v}});
 if(view==='requests')polishRequests();if(view==='calendar')polishCalendar();if(view==='renters')polishRenters();if(view==='vehicles')polishVehicles()};

function polishRequests(){const q=document.querySelector('#view .qks');if(q)q.insertAdjacentHTML('beforeend','<span class="dxsep"></span>'+Object.keys(DQF).map(k=>{const n=R.filter(DQF[k]).length;return `<button class="qk ${DQ.has(k)?'on':''} ${n&&k!=='To hand over'?'dxqhot':''}" data-act="dxq" data-arg="${k}" title="${{'Balance due':'Confirmed, part-paid, money still owed','Refund due':'Cancelled or declined but money was received','To hand over':'Confirmed, pick-up within 2 days, pick-up checklist not done','Not returned':'Return date passed and return checklist not done'}[k]}">${k}${n?` <em>${n}</em>`:''}</button>`}).join(''));
 if(DQ.size){const fch=document.querySelector('#view .fch'),h=[...DQ].map(k=>`<button class="fc" data-act="dxq" data-arg="${k}">${k} <i>✕</i></button>`).join('');if(fch)fch.insertAdjacentHTML('afterbegin',h);else if(q)q.insertAdjacentHTML('afterend',`<div class="fch">${h}<button class="lnkb" data-act="fclear">Clear all</button></div>`)}
 document.querySelectorAll('#view tr.r[data-arg]').forEach(tr=>{const r=R.find(x=>x.id===tr.dataset.arg);if(!r)return;const td=tr.children[4];if(!td)return;const {got,bal,refund}=payInfo(r);
  td.insertAdjacentHTML('beforeend',refund?`<small class="dxbad">Refund ${peso(got)}</small>`:r.status==='confirmed'?(bal&&got?`<small class="dxwarn">${peso(bal)} due</small>`:!bal?'<small class="dxgood">Paid in full</small>':'<small>Nothing received</small>'):'');
  const st=tr.children[5];if(st&&r.status==='confirmed'){const s=inDone(r.id)?'Returned':outDone(r.id)?'Out now':'';if(s)st.insertAdjacentHTML('beforeend',` <span class="dxt ${inDone(r.id)?'good':''}">${s}</span>`)}})}

function polishCalendar(){const bar=document.querySelector('#view .cbar');
 if(bar){const nb=V.filter(v=>v.bike).length;bar.insertAdjacentHTML('beforeend',`<div class="dxseg">${[['all','All',V.length],['car','Cars',V.length-nb],['bike','Motorbikes',nb]].map(x=>`<button class="${CT===x[0]?'on':''}" data-act="dxct" data-arg="${x[0]}">${x[1]} <em>${x[2]}</em></button>`).join('')}</div>`);const fr=bar.querySelector('.sub');if(fr)bar.appendChild(fr)}
 const rows=[...document.querySelectorAll('#view .cgrid tbody tr')];
 rows.forEach(tr=>{const b=tr.querySelector('.cvn [data-act="editv"]'),v=b&&vAt(b.dataset.arg);if(!v)return;if(CT!=='all'&&(CT==='bike')!==!!v.bike){tr.style.display='none';return}
  const tds=[...tr.querySelectorAll('td')],booked=tds.filter(td=>td.classList.contains('cbk')).length,pct=Math.round(booked/tds.length*100);
  const sm=tr.querySelector('.cvn small');if(sm)sm.insertAdjacentHTML('afterend',`<i class="dxoc" title="${booked} of ${tds.length} days booked this month"><b style="width:${pct}%"></b></i>`);
  for(let i=0;i<tds.length;i++){const td=tds[i];if(td.dataset.act!=='calopen'){td.removeAttribute('title');continue}td.removeAttribute('title');const id=td.dataset.arg,p=tds[i-1],n=tds[i+1],same=x=>x&&x.dataset.act==='calopen'&&x.dataset.arg===id;
   if(!same(p)){td.classList.add('dxa');let len=1;while(same(tds[i+len]))len++;const r=R.find(x=>x.id===id),nm=r?r.name.split(' ')[0]:td.textContent;td.innerHTML=`<span class="dxbl" style="max-width:${len*30-8}px">${nm}</span>`;
    if(r&&r.status==='confirmed'){const pi=payInfo(r);if(pi.bal>0)tds[i+len-1].classList.add('dxdue')}}else td.textContent='';if(!same(n))td.classList.add('dxz')}});
 const g=document.querySelector('#view .cgrid');if(g&&!g.dataset.dx){g.dataset.dx=1}
 {const w=document.querySelector('#view .cwrap'),td=document.querySelector('#view .cgrid thead th.ctd'),mk=(document.querySelector('#view .cbar b')||{}).textContent;if(w&&mk!==CAL_SCROLLED){CAL_SCROLLED=mk;if(td){const nm=document.querySelector('#view .cgrid thead .cvn');w.scrollLeft=Math.max(0,td.offsetLeft-(nm?nm.offsetWidth:0)-60)}else w.scrollLeft=0}}
 const lg=document.querySelector('#view .clg');if(lg)lg.insertAdjacentHTML('beforeend','<span><i class="dxdueL"></i>Money still owed</span><span class="sub">Tip: drag across free days to block several at once. Hover a booking for details.</span>')}
/* drag across free days to block / free a range */
document.addEventListener('mousedown',e=>{const td=e.target.closest&&e.target.closest('#view .cgrid td[data-act="calx"]');if(!td||e.button!==0)return;const [id,d]=td.dataset.arg.split('|');DRAG={id,tr:td.parentElement,a:td,cells:[td],mode:td.classList.contains('cbl')?'free':'block'};td.classList.add('dxsel');e.preventDefault()});
document.addEventListener('mouseover',e=>{if(!DRAG)return;const td=e.target.closest&&e.target.closest('td');if(!td||td.parentElement!==DRAG.tr)return;const all=[...DRAG.tr.children],i=all.indexOf(DRAG.a),j=all.indexOf(td),[lo,hi]=i<j?[i,j]:[j,i];
 DRAG.cells=all.slice(lo,hi+1).filter(c=>c.dataset.act==='calx');all.forEach(c=>c.classList.toggle('dxsel',DRAG.cells.includes(c)))});
document.addEventListener('mouseup',()=>{if(!DRAG)return;const D=DRAG;DRAG=null;if(D.cells.length<2){D.a.classList.remove('dxsel');return}SUPPRESS=Date.now();
 const days=D.cells.map(c=>c.dataset.arg.split('|')[1]),cur=new Set(ST.blocks[D.id]||[]);days.forEach(d=>D.mode==='block'?cur.add(d):cur.delete(d));ST.blocks[D.id]=[...cur].sort();ST.save();try{DB.pushBlocks(D.id,ST.blocks[D.id])}catch(x){}renderView();toast(`${days.length} days ${D.mode==='block'?'blocked':'freed'}`)});

function polishRenters(){const list=document.querySelector('#view .rlist'),rb=document.querySelector('#view .rbar');if(!rb)return;const notes=lsg('rnotes',{})||{};
 const G={};ST.requests.forEach(x=>{if(!x.guestName&&!x.guestPhone)return;const k=rkey(x);const g=G[k]=G[k]||{k,n:0,val:0,owe:0,open:0,last:0,name:x.guestName||''};g.n++;const r=R.find(y=>y.id===e2(x.id)||y.id===x.id);if(r){if(['confirmed','completed'].includes(r.status))g.val+=r.total;if(r.status==='confirmed')g.owe+=payInfo(r).bal;if(['new','confirmed'].includes(r.status))g.open++}g.last=Math.max(g.last,x.createdAt||0)});
 const F={'Repeat':g=>g.n>1,'Open request':g=>g.open>0,'Owes money':g=>g.owe>0,'Has note':g=>!!notes[g.k]};
 rb.insertAdjacentHTML('afterend',`<div class="dxrt"><div class="qks" style="margin:0">${Object.keys(F).map(k=>{const n=Object.values(G).filter(F[k]).length;return `<button class="qk ${RS.f.has(k)?'on':''}" data-act="dxrf" data-arg="${k}">${k}${n?` <em>${n}</em>`:''}</button>`}).join('')}</div><label class="dxsort">Sort <select data-dxsort>${[['recent','Most recent'],['trips','Most requests'],['value','Highest value'],['owe','Owes most'],['az','Name A–Z']].map(o=>`<option value="${o[0]}" ${RS.sort===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></label></div>`);
 if(!list)return;const rows=[...list.querySelectorAll('.rrow')];let shown=0;
 rows.forEach(el=>{const g=G[el.dataset.arg];if(!g)return;el.removeAttribute('title');const ok=[...RS.f].every(k=>F[k](g));el.style.display=ok?'':'none';if(ok)shown++;const tg=el.querySelector('.rtg');if(tg&&g.owe)tg.insertAdjacentHTML('afterbegin',`<em class="dxt warn">Owes ${peso(g.owe)}</em>`)});
 const cmp={recent:(a,b)=>b.last-a.last,trips:(a,b)=>b.n-a.n||b.last-a.last,value:(a,b)=>b.val-a.val,owe:(a,b)=>b.owe-a.owe||b.last-a.last,az:(a,b)=>a.name.localeCompare(b.name)}[RS.sort];
 rows.sort((a,b)=>cmp(G[a.dataset.arg]||{},G[b.dataset.arg]||{})).forEach(el=>list.appendChild(el));
 const cnt=rb.querySelector('.sub');if(cnt)cnt.textContent=shown+' renter'+(shown===1?'':'s');
 if(!shown&&rows.length)list.insertAdjacentHTML('beforeend','<div class="sub" style="text-align:center;padding:20px">No renters match. <button class="lnkb" data-act="dxrclear">Clear filters</button></div>')}
A.dxrclear=()=>{RS.f.clear();renderView()};
document.addEventListener('change',e=>{if(e.target.matches&&e.target.matches('[data-dxsort]')){RS.sort=e.target.value;renderView()}});
/* renter sheet: stats + money per trip */
const _ren=A.renter;A.renter=a=>{_ren(a);const sh=document.getElementById('sh');if(!sh)return;const T=ST.requests.filter(x=>rkey(x)===a);if(!T.length)return;
 const ok=T.filter(x=>['confirmed','approved','completed'].includes(x.status)),days=ok.reduce((s,x)=>s+(+x.days||0),0),first=T.map(x=>x.from).filter(Boolean).sort()[0],owe=T.reduce((s,x)=>{const r=R.find(y=>y.id===x.id);return s+(r&&r.status==='confirmed'?payInfo(r).bal:0)},0);
 const kv=sh.querySelectorAll('.rkv');const last=kv[kv.length-1];if(last)last.insertAdjacentHTML('afterend',`<div class="dxsum" style="margin-top:12px"><div><span>Days rented</span><b>${days}</b></div><div><span>First trip</span><b>${first?dShort(first):'—'}</b></div><div><span>Owes</span><b class="${owe?'dxwarn':'dxgood'}">${owe?peso(owe):'Nothing'}</b></div></div>`);
 sh.querySelectorAll('.rtrip[data-arg]').forEach(b=>{const r=R.find(x=>x.id===b.dataset.arg);if(!r)return;const {bal,got,refund}=payInfo(r);const s=b.querySelector('span small');if(s&&(refund||(r.status==='confirmed')))s.insertAdjacentHTML('beforeend',refund?` · <b class="dxbad">refund ${peso(got)}</b>`:bal?` · <b class="dxwarn">${peso(bal)} due</b>`:' · <b class="dxgood">paid</b>')})};

function polishVehicles(){const tabs=document.querySelector('#view .tabs');const due=dueList(),ids=new Set(due.map(o=>String(o.v.id)));
 if(tabs){tabs.insertAdjacentHTML('beforeend',`<button class="tb ${PDUE?'on':''}" data-act="dxpdue" title="OR/CR, CTPL or service due within 30 days">Papers due<em>${ids.size}</em></button>`);if(PDUE)tabs.querySelectorAll('.tb').forEach(b=>{if(b.dataset.act!=='dxpdue')b.classList.remove('on')})}
 if(PDUE)document.querySelectorAll('#view .vr[data-arg]').forEach(el=>{if(!ids.has(el.dataset.arg))el.style.display='none'})}

/* ---------------- styles ---------------- */
const st=document.createElement('style');st.textContent=`
#dxtip{position:fixed;z-index:60;width:260px;background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.25);padding:12px 14px;font-size:13px;pointer-events:none;opacity:0;transform:translateY(4px);transition:opacity .12s,transform .12s}
#dxtip.on{opacity:1;transform:none}#dxtip>b{display:block;font-size:15px}#dxtip>small{display:block;color:var(--muted);margin-bottom:8px}
#dxtip .tk{display:flex;justify-content:space-between;gap:10px;padding:3px 0;border-top:1px solid var(--line)}#dxtip .tk span{color:var(--muted)}#dxtip .tk.warn{color:#B26A00;font-weight:700}#dxtip .tk.bad{color:var(--bad);font-weight:700}#dxtip .tk.good{color:var(--good);font-weight:700}
#dxtip .tn{margin-top:6px;padding:8px;border-radius:10px;background:var(--bg);font-style:italic;color:var(--muted)}#dxtip>em{display:block;margin-top:8px;font-size:11px;color:var(--accent);font-style:normal;font-weight:700}
:root[data-theme=dark] #dxtip .tk.warn{color:var(--sun)}@media(prefers-color-scheme:dark){:root:not([data-theme=light]) #dxtip .tk.warn{color:var(--sun)}}
.dxsep{width:1px;background:var(--line);margin:0 4px;align-self:stretch}.qk em{font-style:normal;font-size:11px;font-weight:800;margin-left:4px;opacity:.75}.qk.dxqhot:not(.on) em{color:var(--bad);opacity:1}
tr.r td small.dxwarn,tr.r td small.dxbad,tr.r td small.dxgood{font-weight:700}
.dxseg{display:inline-flex;border:1px solid var(--line);border-radius:999px;padding:2px;margin-left:8px}.dxseg button{padding:5px 12px;border-radius:999px;font:600 13px var(--f-body);color:var(--muted)}.dxseg button.on{background:var(--ink);color:var(--surface)}.dxseg em{font-style:normal;font-size:11px;opacity:.7}
.cgrid td.cbk,.cgrid td.cpend{background-clip:content-box;padding:7px 0;border-right-width:0;position:relative;text-align:left}
.cgrid td.cbk.dxa,.cgrid td.cpend.dxa{border-top-left-radius:16px;border-bottom-left-radius:16px}.cgrid td.dxa{padding-left:3px}.cgrid td.dxz{padding-right:3px;border-right-width:1px!important}
.cgrid td.dxa.cbk,.cgrid td.dxa.cpend{background-origin:content-box}.cgrid td.cbk.dxz,.cgrid td.cpend.dxz{border-top-right-radius:16px;border-bottom-right-radius:16px}
.dxbl{position:relative;z-index:1;display:block;padding-left:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px;font-weight:800;line-height:26px}
.cgrid td.dxdue:after{content:'';position:absolute;right:5px;top:50%;margin-top:-4px;width:8px;height:8px;border-radius:50%;background:var(--sun);box-shadow:0 0 0 2px var(--surface);z-index:2}
.cgrid td.dxsel{background:color-mix(in srgb,var(--accent) 30%,transparent)!important;outline:0}
.clg .dxdueL{background:var(--sun);border-radius:50%;border:0}
.dxoc{display:block;height:4px;border-radius:2px;background:var(--line);margin-top:4px;overflow:hidden;max-width:120px}.dxoc b{display:block;height:100%;background:var(--accent)}
@media(max-width:760px){.cgrid .cvn{min-width:96px;max-width:96px;padding:4px 6px}.cvn .lnk{font-size:11.5px;max-width:86px;white-space:normal;line-height:1.15}.cvn small{display:none}.dxoc{max-width:84px}.cbar .dxseg{margin-left:0}}@media(max-width:420px){.tbar button{font-size:10px}}
.dxrt{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin:-2px 0 12px}.dxsort{font-size:12px;font-weight:700;color:var(--muted);display:flex;gap:6px;align-items:center}.dxsort select{border:1px solid var(--line);background:var(--surface);color:var(--ink);border-radius:10px;padding:6px 10px;font:600 13px var(--f-body)}`;document.head.appendChild(st);
renderView();
})();
