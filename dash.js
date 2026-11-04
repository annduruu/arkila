/* Dashboards for the admin and for each owner. Small SVG and CSS charts, no chart library.
   One data function (dhData) feeds both. To add a chart: write a function that returns HTML and put it in a dhCard(). */
let DR=90;                                  /* range in days: 30, 90, 365, or 0 for all time */
let ADOWN='';
const DC={good:'#0E9F8E',amber:'#F59E0B',red:'#E5484D',grey:'#9AA5B1',violet:'#7C3AED',blue:'#1B4DDB'};
const DSTAT={completed:['Completed',DC.good],confirmed:['Paid, upcoming',DC.blue],new:['Requested',DC.amber],cancelled:['Cancelled',DC.grey],declined:['Declined',DC.red]};
const DRANGES=[[30,'30 days'],[90,'90 days'],[365,'12 months'],[0,'All time']];
const dhPaid=r=>r.status==='confirmed'||r.status==='completed';
const dhW=half=>{const el=document.querySelector('#v-admin:not([hidden]),#v-host:not([hidden])'),cw=(el&&el.clientWidth)||600,w=(half&&cw>=900)?(cw-110)/2:cw-70;return Math.round(Math.max(280,Math.min(1100,w)))};
const dhS=(n,w)=>n+' '+w+(n===1?'':'s');
const dhK=n=>n>=1e6?'₱'+(n/1e6).toFixed(n>=1e7?0:1)+'M':n>=1e3?'₱'+(n/1e3).toFixed(n>=1e4?0:1).replace(/\.0$/,'')+'k':'₱'+Math.round(n);
const dhN=n=>Math.round(n).toLocaleString('en-PH');
function dhNice(max){const raw=max/4,p=Math.pow(10,Math.floor(Math.log10(raw||1))),f=raw/p,s=(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p;return{step:s,top:Math.ceil(max/s)*s}}
function dhRange(){
  const b=todayIso();let a;
  if(DR){a=addD(b,-(DR-1));return{a,b,pa:addD(a,-DR),pb:addD(a,-1),n:DR,label:DRANGES.find(x=>x[0]===DR)[1]}}
  const first=ST.requests.reduce((m,r)=>r.from<m?r.from:m,addD(b,-364));return{a:first,b,pa:'',pb:'',n:days(first,b)+1,label:'All time'}}
const dhIn=(r,a,b)=>r.from>=a&&r.from<=b;
function dhDelta(cur,prev){if(!prev)return '';const p=Math.round((cur-prev)/prev*100);if(p===0)return '<small class="dl">No change vs previous</small>';return `<small class="dl ${p>=0?'up':'dn'}">${p>=0?'▲':'▼'} ${Math.abs(p)}% vs previous</small>`}
function dhData(owner){
  const rg=dhRange(),all=ST.requests.filter(r=>!owner||r.hostId===owner),cur=all.filter(r=>dhIn(r,rg.a,rg.b)),prev=rg.pa?all.filter(r=>dhIn(r,rg.pa,rg.pb)):[];
  return{rg,all,cur,prev,paid:cur.filter(dhPaid),pprev:prev.filter(dhPaid),cars:new Map(allCars().map(c=>[c.id,c]))}}
const dhSum=(rs,f)=>rs.reduce((s,r)=>s+f(r),0);
function dhBooked(r,a,b){const e0=addD(b,1),s=r.from>a?r.from:a,e=r.to<e0?r.to:e0;return e>s?days(s,e):0}
/* last 12 months: [{key,label}] */
function dhMonths(){const out=[],now=new Date();for(let i=11;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);out.push({key:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'),label:d.toLocaleDateString('en-PH',{month:'short'})+(d.getMonth()===0||i===11?" '"+String(d.getFullYear()).slice(2):'')})}return out}
/* weeks starting Monday, last n */
function dhWeeks(n){const t=new Date(todayIso()+'T12:00:00'),off=(t.getDay()+6)%7,out=[];for(let i=n-1;i>=0;i--)out.push(addD(iso(new Date(t.getFullYear(),t.getMonth(),t.getDate()-off)),-7*i));return out}

/* ---------- chart pieces ---------- */
const dhTip=(...a)=>esc(a.filter(x=>x!==''&&x!=null).join('\n'));
function chBars(d,o){o=o||{};const W=dhW(o.half),H=o.h||190,pl=o.money?44:30,pb=22,pt=8,pr=4,n=d.length,F=o.fmt||(x=>String(Math.round(x)));
  const mx=Math.max(1,...d.map(x=>x.v+(x.w||0))),nc=dhNice(mx),bw=(W-pl-pr)/n,gap=Math.min(8,bw*.22),ih=H-pt-pb,Y=v=>pt+ih-ih*v/nc.top;
  let s=`<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label||'')}">`;
  for(let v=0;v<=nc.top+1e-9;v+=nc.step)s+=`<line class="gl" x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ct" x="${pl-6}" y="${Y(v)+4}" text-anchor="end">${esc(F(v))}</text>`;
  const every=Math.max(1,Math.ceil(n/Math.max(1,Math.floor((W-pl)/(o.lw||44)))));
  d.forEach((x,i)=>{const bx=pl+i*bw+gap/2,w=Math.max(2,bw-gap),y1=Y(x.v),y2=Y(x.v+(x.w||0));
    s+=`<g class="bg" data-tip="${dhTip(x.l,...(x.lines||[F(x.v+(x.w||0))+(o.unit?' '+o.unit:'')]))}"><rect class="hit" x="${(pl+i*bw).toFixed(1)}" y="${pt}" width="${bw.toFixed(1)}" height="${ih}"/>`;
    if(x.w)s+=`<rect class="b2" x="${bx.toFixed(1)}" y="${y2.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(0,y1-y2).toFixed(1)}" rx="3"/>`;
    s+=`<rect class="b1" x="${bx.toFixed(1)}" y="${y1.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(0,Y(0)-y1).toFixed(1)}" rx="3"/></g>`;
    if(i%every===0)s+=`<text class="ct" x="${(bx+w/2).toFixed(1)}" y="${H-6}" text-anchor="middle">${esc(x.l)}</text>`});
  return s+'</svg>'}
function chLine(d,o){o=o||{};const W=dhW(o.half),H=o.h||190,pl=34,pb=22,pt=8,pr=8,n=d.length,F=o.fmt||(x=>String(Math.round(x)));
  const mx=Math.max(1,...d.map(x=>x.v)),nc=dhNice(mx),ih=H-pt-pb,X=i=>pl+i*(W-pl-pr)/Math.max(1,n-1),Y=v=>pt+ih-ih*v/nc.top;
  let s=`<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label||'')}">`;
  for(let v=0;v<=nc.top+1e-9;v+=nc.step)s+=`<line class="gl" x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="ct" x="${pl-6}" y="${Y(v)+4}" text-anchor="end">${esc(F(v))}</text>`;
  const pts=d.map((x,i)=>X(i).toFixed(1)+','+Y(x.v).toFixed(1));
  s+=`<path class="la" d="M${X(0).toFixed(1)},${Y(0)} L${pts.join(' L')} L${X(n-1).toFixed(1)},${Y(0)} Z"/><polyline class="ll" points="${pts.join(' ')}"/>`;
  const every=Math.max(1,Math.ceil(n/Math.max(1,Math.floor((W-pl)/52))));
  const cw=(W-pl-pr)/Math.max(1,n-1);
  d.forEach((x,i)=>{s+=`<g class="lp" data-tip="${dhTip('Week of '+x.l,F(x.v)+' paid '+(x.v===1?'booking':'bookings'))}"><rect class="hit" x="${(X(i)-cw/2).toFixed(1)}" y="${pt}" width="${cw.toFixed(1)}" height="${ih}"/><line class="lg" x1="${X(i).toFixed(1)}" x2="${X(i).toFixed(1)}" y1="${pt}" y2="${Y(0)}"/><circle class="ld" cx="${X(i).toFixed(1)}" cy="${Y(x.v).toFixed(1)}" r="${n>30?1.5:2.6}"/></g>`;if(i%every===0)s+=`<text class="ct" x="${X(i).toFixed(1)}" y="${H-6}" text-anchor="middle">${esc(x.l)}</text>`});
  return s+'</svg>'}
function chDonut(d,o){o=o||{};const tot=d.reduce((s,x)=>s+x.v,0);if(!tot)return '<p class="note">Nothing in this range.</p>';
  const R=58,r=38,C=64,live=d.filter(x=>x.v>0),P=(a,q)=>[(C+q*Math.cos(a)).toFixed(2),(C+q*Math.sin(a)).toFixed(2)];let a0=-Math.PI/2,sv='';
  if(live.length===1)sv=`<circle cx="${C}" cy="${C}" r="${(R+r)/2}" fill="none" stroke="${live[0].c}" stroke-width="${R-r}" data-tip="${dhTip(live[0].l,live[0].v+' (100%)')}"/>`;
  else live.forEach(x=>{const a1=a0+2*Math.PI*x.v/tot,big=(a1-a0)>Math.PI?1:0,p1=P(a0,R),p2=P(a1,R),p3=P(a1,r),p4=P(a0,r);
    sv+=`<path d="M${p1} A${R} ${R} 0 ${big} 1 ${p2} L${p3} A${r} ${r} 0 ${big} 0 ${p4} Z" fill="${x.c}" data-tip="${dhTip(x.l,dhN(x.v)+' '+(o.unit||''),Math.round(x.v/tot*100)+'% of all')}"/>`;a0=a1});
  return `<div class="dn"><svg viewBox="0 0 128 128" width="128" height="128" role="img" aria-label="${esc(o.label||'')}">${sv}<text x="64" y="62" text-anchor="middle" class="dnn">${dhN(tot)}</text><text x="64" y="78" text-anchor="middle" class="ct">${esc(o.unit||'total')}</text></svg>
  <ul class="dleg">${(live.length?live:d).map(x=>`<li data-tip="${dhTip(x.l,dhN(x.v)+' '+(o.unit||''),Math.round(x.v/tot*100)+'% of all')}"><i style="background:${x.c}"></i><span>${esc(x.l)}</span><b>${dhN(x.v)}</b><small>${Math.round(x.v/tot*100)}%</small></li>`).join('')}</ul></div>`}
function chHB(d,o){o=o||{};const F=o.fmt||dhK;if(!d.length)return '<p class="note">Nothing in this range.</p>';const mx=Math.max(1,...d.map(x=>x.v));
  const tot=d.reduce((s,x)=>s+x.v,0);return `<div class="hbl">${d.map(x=>`<div class="hb" data-tip="${dhTip(x.l,F(x.v)+(tot?' · '+Math.round(x.v/tot*100)+'% of this list':''),x.n!=null?dhS(x.n,'booking'):'')}"><span class="hl" title="${esc(x.l)}">${esc(x.l)}${x.sub?`<small>${esc(x.sub)}</small>`:''}</span><span class="hbar"><i style="width:${Math.max(2,x.v/mx*100).toFixed(1)}%"></i></span><b>${esc(F(x.v))}</b></div>`).join('')}</div>`}
function chHeat(rows,weeks){if(!rows.length)return '<p class="note">No vehicles yet.</p>';
  return `<div class="heat" style="--wk:${weeks.length}"><div class="hrow hh"><span></span><div class="hcells">${weeks.map((w,i)=>`<em>${i%4===0?esc(fmtS(w)):''}</em>`).join('')}</div></div>${rows.map(r=>`<div class="hrow"><span class="hl" title="${esc(r.l)}">${esc(r.l)}</span><div class="hcells">${r.c.map((v,i)=>`<i style="background:color-mix(in srgb,var(--accent) ${Math.round(v/7*100)}%,var(--line))" data-tip="${dhTip(r.l,'Week of '+fmtS(weeks[i]),v+' of 7 days booked')}"></i>`).join('')}</div></div>`).join('')}</div><p class="note" style="margin:8px 0 0">Darker means more of that week was booked.</p>`}
const dhCard=(title,sub,body,cls)=>`<section class="dc${cls?' '+cls:''}"><h3>${esc(title)}</h3>${sub?`<p class="dcs">${esc(sub)}</p>`:''}${body}</section>`;
const KH={'Booking value':'Total price of paid and completed trips, counted on the pickup date.','Arkila commission':'Arkila\'s cut of the booking value.','Paid bookings':'Trips where the renter paid. Cancelled and declined ones are left out.','New users':'Accounts created in this range.','Live vehicles':'Approved vehicles that are not paused.','Cancel / decline rate':'Share of requests in the range that ended cancelled or declined.','Upcoming paid trips':'Confirmed trips with a pickup date from today on.','Owner payouts due':'Owner share of completed trips not yet marked as paid.','Your earnings':'What you receive after the Arkila fee, for paid and completed trips.','Coming to you':'Confirmed or completed trips not yet paid out to you.','Occupancy':'Booked vehicle-days divided by available vehicle-days in this range.','Rating':'Average of renter reviews on your vehicles.','Waiting for you':'New requests where you still need to say if the dates are free.'};
const dhKpi=(label,val,delta,sub)=>`<div class="stat kpi" data-tip="${dhTip(label,KH[label]||'')}"><span>${esc(label)}</span><b>${val}</b>${delta||''}${sub?`<small class="ks">${esc(sub)}</small>`:''}</div>`;
const dhRangeBar=()=>`<div class="chips drs" role="group" aria-label="Date range">${DRANGES.map(x=>`<button type="button" class="chip" data-dr="${x[0]}" aria-pressed="${DR===x[0]}">${x[1]}</button>`).join('')}</div>`;

/* shared series */
function dhSeries(D,valueOf){
  const mo=dhMonths(),idx=new Map(mo.map((m,i)=>[m.key,i])),v=mo.map(m=>({l:m.label,v:0,w:0,n:0}));
  D.all.filter(dhPaid).forEach(r=>{const i=idx.get(r.from.slice(0,7));if(i!=null){valueOf(r,v[i]);v[i].n++}});
  return v}
function dhWeekly(D){const wk=dhWeeks(26),out=wk.map(w=>({l:fmtS(w),v:0}));
  D.all.filter(dhPaid).forEach(r=>{for(let i=wk.length-1;i>=0;i--)if(r.from>=wk[i]){if(r.from<=addD(wk[i],6))out[i].v++;break}});return out}
function dhWeekdays(D){const nm=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],v=nm.map(l=>({l,v:0}));D.paid.forEach(r=>{v[new Date(r.from+'T12:00:00').getDay()].v++});return v}
function dhStatus(D){const c={};D.cur.forEach(r=>c[r.status]=(c[r.status]||0)+1);return Object.keys(DSTAT).map(k=>({l:DSTAT[k][0],v:c[k]||0,c:DSTAT[k][1]}))}
function dhGroup(D,keyf,valf,subf){const m=new Map();D.paid.forEach(r=>{const k=keyf(r);if(!k)return;const o=m.get(k)||{l:k,v:0,n:0};o.v+=valf(r);o.n++;m.set(k,o)});return[...m.values()].sort((a,b)=>b.v-a.v)}

/* ---------- admin dashboard ---------- */
function adDash(){
  if(!ST.requests.length)return `<section class="step"><h2>Dashboard</h2><div class="empty">No bookings yet, so there is nothing to chart.<br>Load the demo data to see the dashboards filled in (about 600 bookings, 120 vehicles, 40 owners).</div><div class="chips" style="margin-top:10px"><button class="chip on" data-demoload>Load demo data</button></div></section>`;
  const D=dhData(''),rg=D.rg,t0=todayIso();
  const gross=dhSum(D.paid,r=>r.total),pg=dhSum(D.pprev,r=>r.total),comm=dhSum(D.paid,commOf),pc=dhSum(D.pprev,commOf);
  const nUsers=ST.users.filter(u=>{const d=D8(u.createdAt);return d>=rg.a&&d<=rg.b}).length,pUsers=rg.pa?ST.users.filter(u=>{const d=D8(u.createdAt);return d>=rg.pa&&d<=rg.pb}).length:0;
  const lost=D.cur.filter(r=>r.status==='cancelled'||r.status==='declined').length,rate=D.cur.length?Math.round(lost/D.cur.length*100):0;
  const due=ST.requests.filter(r=>r.status==='completed'&&!r.paid),upc=ST.requests.filter(r=>r.status==='confirmed'&&r.from>=t0).length,veh=allCars().filter(c=>c.status==='approved'&&c.active!==false).length;
  const kpis=[dhKpi('Booking value',dhK(gross),dhDelta(gross,pg),rg.label),dhKpi('Arkila commission',dhK(comm),dhDelta(comm,pc),Math.round(SETTINGS.commission*100)+'% of booking value'),
    dhKpi('Paid bookings',dhN(D.paid.length),dhDelta(D.paid.length,D.pprev.length),'avg '+php(D.paid.length?gross/D.paid.length:0)),dhKpi('New users',dhN(nUsers),dhDelta(nUsers,pUsers),ST.users.length+' in total'),
    dhKpi('Live vehicles',dhN(veh),'',ST.listings.filter(l=>l.status==='pending').length+' waiting approval'),dhKpi('Cancel / decline rate',rate+'%','',dhN(lost)+' of '+dhN(D.cur.length)+' requests'),
    dhKpi('Upcoming paid trips',dhN(upc),'','from today on'),dhKpi('Owner payouts due',dhK(dhSum(due,ownerGets)),'',dhS(due.length,'completed trip')+' unpaid')].join('');
  const mon=dhSeries(D,(r,m)=>{m.v+=commOf(r);m.w+=ownerGets(r)}).map(m=>({l:m.l,v:m.v,w:m.w,lines:['Booking value '+php(m.v+m.w),'Arkila commission '+php(m.v),'Owners\' share '+php(m.w),dhS(m.n,'paid booking')]}));
  const area=dhGroup(D,r=>{const c=D.cars.get(r.carId);return c?c.area:r.spot},r=>r.total).slice(0,8),type=dhGroup(D,r=>{const c=D.cars.get(r.carId);return c?c.type:''},r=>r.total).slice(0,8);
  const topV=dhGroup(D,r=>r.carName,r=>r.total).slice(0,10),topO=dhGroup(D,r=>r.hostName,r=>r.total).slice(0,10).map(x=>({...x,sub:dhS(x.n,'trip')}));
  return `<div class="dhead2"><div><h2 style="margin:0">Dashboard</h2><p class="note" style="margin:2px 0 0">Booking value counts paid and completed trips by pickup date. Showing ${esc(rg.label.toLowerCase())}.</p></div>${dhRangeBar()}</div>
  <div class="stats">${kpis}</div>
  <div class="dgrid">${dhCard('Booking value by month','Last 12 months. The bright bottom part is Arkila’s commission, the soft part is the owners’ share.',chBars(mon,{money:1,fmt:dhK,label:'Booking value by month'}),'wide')}
  ${dhCard('Paid bookings per week','Last 26 weeks, by pickup date',chLine(dhWeekly(D),{label:'Bookings per week',half:1}))}
  ${dhCard('Busiest pickup days','In the selected range',chBars(dhWeekdays(D),{label:'Pickups by weekday',h:170,half:1,unit:'pickups'}))}
  ${dhCard('Request outcomes','Requests with a pickup date in this range',chDonut(dhStatus(D),{unit:'requests',label:'Request outcomes'}))}
  ${dhCard('Booking value by area','Top areas by pickup vehicle',chHB(area))}
  ${dhCard('Booking value by vehicle type','',chHB(type))}
  ${dhCard('Top 10 vehicles','By booking value',chHB(topV))}
  ${dhCard('Top 10 owners','By booking value',chHB(topO))}</div>`}

/* ---------- owner dashboard (own numbers only; the admin can open any owner's view) ---------- */
function ownDash(oid,asAdmin){
  const u=ST.users.find(x=>x.id===oid),mine=ST.listings.filter(l=>l.ownerId===oid),ids=new Set(mine.map(l=>l.id));
  const D=dhData(oid),rg=D.rg,t0=todayIso();
  const back=asAdmin?`<div class="chips" style="margin-bottom:10px"><button class="chip" data-adtab="users">‹ Back to users</button></div><p class="note" style="margin:0 0 8px">Viewing the owner dashboard for <b>${esc(u?u.name:oid)}</b>. This is what they see on their own screen.</p>`:'';
  if(!D.all.length&&!mine.length)return back+(asAdmin?'<div class="empty">This owner has no vehicles or bookings yet.</div>':'');
  if(!D.all.length)return back+`<section class="step"><h2>Your numbers</h2><div class="empty">Earnings, occupancy and trends show up here once your vehicles get their first bookings.</div></section>`;
  const earn=dhSum(D.paid,ownerGets),pe=dhSum(D.pprev,ownerGets),live=mine.filter(l=>l.status==='approved'&&l.active!==false).length;
  const bd=dhSum(D.paid,r=>dhBooked(r,rg.a,rg.b)),occ=live?Math.min(100,Math.round(bd/(live*rg.n)*100)):0,pbd=rg.pa?dhSum(D.pprev,r=>dhBooked(r,rg.pa,rg.pb)):0,pocc=rg.pa&&live?Math.min(100,Math.round(pbd/(live*rg.n)*100)):0;
  const rv=ST.reviews.filter(x=>ids.has(x.carId)),rat=rv.length?(rv.reduce((s,x)=>s+x.rating,0)/rv.length).toFixed(1):'–';
  const pay=D.all.filter(r=>(r.status==='completed'&&!r.paid)||r.status==='confirmed'),wait=D.all.filter(r=>r.status==='new'&&!r.avail).length;
  const kpis=[dhKpi('Your earnings',dhK(earn),dhDelta(earn,pe),'after '+Math.round(SETTINGS.commission*100)+'% Arkila fee · '+rg.label),dhKpi('Coming to you',dhK(dhSum(pay,ownerGets)),'',dhS(pay.length,'trip')+' not yet paid out'),
    dhKpi('Paid bookings',dhN(D.paid.length),dhDelta(D.paid.length,D.pprev.length),'avg '+php(D.paid.length?dhSum(D.paid,r=>r.total)/D.paid.length:0)),dhKpi('Occupancy',occ+'%',rg.pa?`<small class="dl ${occ>=pocc?'up':'dn'}">${occ>=pocc?'▲':'▼'} ${Math.abs(occ-pocc)} pts vs previous</small>`:'',bd+' vehicle-days booked'),
    dhKpi('Rating',rat==='–'?rat:'★ '+rat,'',rv.length+' reviews'),dhKpi('Waiting for you',dhN(wait),'','open requests, any date')].join('');
  const mon=dhSeries(D,(r,m)=>{m.v+=ownerGets(r)}).map(m=>({l:m.l,v:m.v,lines:['Earnings '+php(m.v),dhS(m.n,'paid booking'),m.n?'avg '+php(m.v/m.n)+' per trip':'']}));
  const wk=dhWeeks(26),heat=mine.filter(l=>l.status==='approved').map(l=>{const c=wk.map(()=>0);D.all.filter(r=>r.carId===l.id&&dhPaid(r)).forEach(r=>wk.forEach((w,i)=>{c[i]+=dhBooked(r,w,addD(w,6))}));return{l:l.name,c,tot:c.reduce((s,x)=>s+x,0)}}).sort((a,b)=>b.tot-a.tot).slice(0,10);
  const perV=dhGroup(D,r=>r.carName,ownerGets).slice(0,10),nxt=D.all.filter(r=>r.status==='confirmed'&&r.from>=t0).sort((a,b)=>a.from>b.from?1:-1).slice(0,5);
  const alert=(!asAdmin&&wait)?`<div class="banner own" style="margin:0 0 12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span><b>${dhS(wait,'request')}</b> waiting for your answer.</span><button class="chip on" data-otab="tasks">Answer now</button></div>`:'';
  return back+alert+`<div class="dhead2"><div><h2 style="margin:0">Your numbers</h2><p class="note" style="margin:2px 0 0">Earnings count paid and completed trips by pickup date. Showing ${esc(rg.label.toLowerCase())}.</p></div>${dhRangeBar()}</div>
  <div class="stats">${kpis}</div>
  <div class="dgrid">${dhCard('Earnings by month','Last 12 months, after the Arkila fee',chBars(mon,{money:1,fmt:dhK,label:'Earnings by month'}),'wide')}
  ${dhCard('Occupancy by vehicle','Last 26 weeks',chHeat(heat,wk),'wide')}
  ${dhCard('Earnings per vehicle','In the selected range',chHB(perV))}
  ${dhCard('Request outcomes','Requests with a pickup date in this range',chDonut(dhStatus(D),{unit:'requests',label:'Request outcomes'}))}
  ${dhCard('Busiest pickup days','In the selected range',chBars(dhWeekdays(D),{label:'Pickups by weekday',h:170,half:1,unit:'pickups'}))}
  ${dhCard('Next pickups','Paid trips coming up',nxt.length?nxt.map(r=>`<div class="lrow"><div class="lmain"><b>${esc(r.carName)}</b><p class="sub">${esc(fmt(r.from))}${r.time?' · '+tl(r.time):''} · ${r.days} day${r.days>1?'s':''} · you get ${php(ownerGets(r))}</p></div></div>`).join(''):'<p class="note">No paid pickups coming up.</p>')}</div>`}

/* ---------- events ---------- */
function dhRefresh(){if($('#v-admin')&&!$('#v-admin').hidden)renderAdmin();else if($('#v-host')&&!$('#v-host').hidden)renderHost()}
document.addEventListener('click',e=>{
  const r=e.target.closest('[data-dr]');if(r){DR=+r.dataset.dr;dhRefresh();return}
  if(e.target.closest('[data-demoload]')){demoLoad();dhRefresh();if(typeof refreshHome==='function')refreshHome();renderNav();toast('Demo data loaded.');return}
  if(e.target.closest('[data-democlear]')){confirmBox({title:'Clear demo data?',text:'Removes every demo owner, renter, vehicle, booking and review. Real records stay.',go:'Clear demo data',back:'Keep it',ok:()=>{demoClear();dhRefresh();if(typeof refreshHome==='function')refreshHome();renderNav();toast('Demo data cleared.')}});return}
  const o=e.target.closest('[data-ownview]');if(o){ADOWN=o.dataset.ownview;ADT='ownerdash';renderAdmin();window.scrollTo({top:0});return}
});
document.addEventListener('click',e=>{if(e.target.closest('[data-admore]')){ADLIM+=100;adTable()}});

/* ---------- backup and restore ---------- */
document.addEventListener('click',e=>{
  if(e.target.closest('[data-bkdl]')){try{const j=JSON.stringify({app:'arkila',ver:DATA_VER,at:new Date().toISOString(),users:ST.users,listings:ST.listings,requests:ST.requests,reviews:ST.reviews,favs:ST.favs,blocks:ST.blocks}),u=URL.createObjectURL(new Blob([j],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='arkila-backup-'+todayIso()+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);toast('Backup downloaded.')}catch(x){toast('Could not make the backup.')}return}
  if(e.target.closest('[data-bkrs]')){const i=$('#bkin');if(i)i.click()}});
document.addEventListener('change',e=>{if(e.target.id!=='bkin')return;const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
  if(f.size>8e6){toast('That file is too big to be a backup.');return}
  const rd=new FileReader();rd.onload=()=>{let j;try{j=JSON.parse(rd.result)}catch(x){toast('That file is not a valid backup.');return}
    if(!j||j.app!=='arkila'||!Array.isArray(j.users)||!Array.isArray(j.listings)||!Array.isArray(j.requests)){toast('That file is not an Arkila backup.');return}
    confirmBox({title:'Restore this backup?',text:'It replaces everything now saved on this device ('+j.users.length+' users, '+j.listings.length+' vehicles, '+j.requests.length+' bookings in the file).',go:'Restore',back:'Cancel',ok:()=>{ST.users=j.users;ST.listings=j.listings;ST.requests=j.requests;ST.reviews=Array.isArray(j.reviews)?j.reviews:[];ST.favs=Array.isArray(j.favs)?j.favs:[];ST.blocks=(j.blocks&&typeof j.blocks==='object'&&!Array.isArray(j.blocks))?j.blocks:{};ST.sid=null;ST.save();location.reload()}})};
  rd.onerror=()=>toast('Could not read that file.');rd.readAsText(f)});

/* ---- hover / tap details for every chart, tile and bar ---- */
(function(){const tip=document.createElement('div');tip.id='dtip';tip.setAttribute('role','tooltip');tip.hidden=true;document.body.appendChild(tip);let cur=null;
  const show=(el,x,y)=>{const t=el.getAttribute('data-tip');if(!t){hide();return}if(cur!==el){cur=el;tip.textContent='';t.split('\n').forEach((ln,i)=>{const d=document.createElement(i?'span':'b');d.textContent=ln;tip.appendChild(d)})}
    tip.hidden=false;const w=tip.offsetWidth,h=tip.offsetHeight,vw=document.documentElement.clientWidth,vh=window.innerHeight;let L=x+14,T=y+16;if(L+w>vw-8)L=x-w-14;if(L<8)L=8;if(T+h>vh-8)T=y-h-12;if(T<8)T=8;tip.style.left=L+'px';tip.style.top=T+'px'};
  const hide=()=>{tip.hidden=true;cur=null};
  const hit=e=>e.target.closest&&e.target.closest('#v-admin [data-tip],#v-host [data-tip]');
  const coarse=()=>window.matchMedia('(hover:none),(pointer:coarse)').matches;
  document.addEventListener('mousemove',e=>{if(coarse())return;const el=hit(e);if(el)show(el,e.clientX,e.clientY);else hide()});
  document.addEventListener('click',e=>{const el=hit(e);if(el&&coarse()){cur===el&&!tip.hidden?hide():show(el,e.clientX,e.clientY)}else if(!el)hide()});
  document.addEventListener('scroll',hide,true);document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});window.addEventListener('hashchange',hide);
})();

/* ---- owner tabs, search, filters, export ---- */
$('#v-host').addEventListener('click',e=>{
  const t=e.target.closest('[data-otab]');if(t){OT=t.dataset.otab;OQ='';OF='all';OS={k:'',d:1};renderHost();window.scrollTo({top:0});return}
  const f=e.target.closest('[data-of]');if(f){OF=f.dataset.of;renderHost();return}
  const s=e.target.closest('[data-osort]');if(s){OS=OS.k===s.dataset.osort?{k:s.dataset.osort,d:-OS.d}:{k:s.dataset.osort,d:1};oTable();return}
  if(e.target.closest('[data-oexp]')){oExport();return}
});
$('#v-host').addEventListener('input',e=>{if(e.target.id==='oq'){OQ=e.target.value;oTable()}
  if(e.target.id==='hd'){const c=$('#hdc');if(c){const n=e.target.value.length;c.textContent=n+' / 600'+(n<20?' · '+(20-n)+' more to go':'')}}});
