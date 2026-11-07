/* Shared dashboard module (admin + owner). Charts are small SVG/CSS, no library. Requests are read from ST and normalised so both old
   ('approved'/'rejected') and new ('confirmed'/'declined') statuses chart correctly. */
const php=n=>'\u20b1'+Math.round(n).toLocaleString('en-PH');
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const fmtS=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-PH',{day:'numeric',month:'short'})};
const days=(a,b)=>{const [y1,m1,d1]=a.split('-').map(Number),[y2,m2,d2]=b.split('-').map(Number);return Math.round((new Date(y2,m2-1,d2)-new Date(y1,m1-1,d1))/864e5)};
const addD=(s,n)=>{const [y,m,d]=s.split('-').map(Number);return iso(new Date(y,m-1,d+n))};
const todayIso=()=>iso(new Date());
const D8=ts=>iso(new Date(ts||Date.now()));
const commOf=r=>Math.round(r.total*SETTINGS.commission),ownerGets=r=>r.total-commOf(r);
const dhNorm=r=>Object.assign({},r,{status:r.status==='approved'?'confirmed':r.status==='rejected'?'declined':r.status,total:+r.total||0});
const dhRefresh=()=>{if(typeof renderView==='function')renderView()};
/* Dashboards for the admin and for each owner. Small SVG and CSS charts, no chart library.
   One data function (dhData) feeds both. To add a chart: write a function that returns HTML and put it in a dhCard(). */
let DR=90,DRC=null;                                  /* range in days: 30, 90, 365, or 0 for all time */
const DC={good:'#0E9F8E',amber:'#F59E0B',red:'#E5484D',grey:'#9AA5B1',violet:'#7C3AED',blue:'#1B4DDB'};
const DSTAT={completed:['Returned',DC.good],confirmed:['Paid, upcoming',DC.blue],new:['Requested',DC.amber],cancelled:['Cancelled',DC.grey],declined:['Declined',DC.red]};
const DRANGES=[[30,'30 days'],[90,'90 days'],[365,'12 months'],[0,'All time']];
const dhPaid=r=>r.status==='confirmed'||r.status==='completed';
const dhW=half=>{const el=document.querySelector('#view'),cw=(el&&el.clientWidth)||600,w=(half&&cw>=900)?(cw-110)/2:cw-70;return Math.round(Math.max(280,Math.min(1100,w)))};
const dhS=(n,w)=>n+' '+w+(n===1?'':'s');
const dhK=n=>n>=1e6?'₱'+(n/1e6).toFixed(n>=1e7?0:1)+'M':n>=1e3?'₱'+(n/1e3).toFixed(n>=1e4?0:1).replace(/\.0$/,'')+'k':'₱'+Math.round(n);
const dhN=n=>Math.round(n).toLocaleString('en-PH');
function dhNice(max){const raw=max/4,p=Math.pow(10,Math.floor(Math.log10(raw||1))),f=raw/p,s=(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p;return{step:s,top:Math.ceil(max/s)*s}}
function dhRange(){
  if(DR==='c'&&DRC){const a=DRC.a,b=DRC.b,n=days(a,b)+1,lb=fmtS(a)+' – '+fmtS(b);return{a,b,pa:addD(a,-n),pb:addD(a,-1),n,label:lb,custom:1}}
  const b=todayIso();let a;
  if(DR){a=addD(b,-(DR-1));return{a,b,pa:addD(a,-DR),pb:addD(a,-1),n:DR,label:DRANGES.find(x=>x[0]===DR)[1]}}
  const first=ST.requests.reduce((m,r)=>r.from<m?r.from:m,addD(b,-364));return{a:first,b,pa:'',pb:'',n:days(first,b)+1,label:'All time'}}
const dhIn=(r,a,b)=>r.from>=a&&r.from<=b;
function dhDelta(cur,prev){if(!prev)return '';const p=Math.round((cur-prev)/prev*100);if(p===0)return '<small class="dd">No change vs previous</small>';return `<small class="dd ${p>=0?'up':'dwn'}">${p>=0?'▲':'▼'} ${Math.abs(p)}% vs previous</small>`}
function dhData(owner){
  const rg=dhRange(),all=ST.requests.map(dhNorm).filter(r=>!owner||r.hostId===owner),cur=all.filter(r=>dhIn(r,rg.a,rg.b)),prev=rg.pa?all.filter(r=>dhIn(r,rg.pa,rg.pb)):[];
  return{rg,all,cur,prev,paid:cur.filter(dhPaid),pprev:prev.filter(dhPaid),cars:new Map(allCars().map(c=>[c.id,c]))}}
const dhSum=(rs,f)=>rs.reduce((s,r)=>s+f(r),0);
function dhBooked(r,a,b){const e0=addD(b,1),s=r.from>a?r.from:a,e=r.to<e0?r.to:e0;return e>s?days(s,e):0}
/* last 12 months: [{key,label}] */
function dhMonths(rg){
  if(rg&&rg.custom){const out=[];
    if(rg.n<=31){for(let d=rg.a;d<=rg.b;d=addD(d,1))out.push({key:d,label:fmtS(d)});return out}
    let y=+rg.a.slice(0,4),m=+rg.a.slice(5,7)-1;const ey=+rg.b.slice(0,4),em=+rg.b.slice(5,7)-1;
    while((y<ey||(y===ey&&m<=em))&&out.length<36){out.push({key:y+'-'+String(m+1).padStart(2,'0'),label:new Date(y,m,1).toLocaleDateString('en-PH',{month:'short'})+(m===0||!out.length?" '"+String(y).slice(2):'')});m++;if(m>11){m=0;y++}}
    return out}
  const out=[],now=new Date();for(let i=11;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);out.push({key:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'),label:d.toLocaleDateString('en-PH',{month:'short'})+(d.getMonth()===0||i===11?" '"+String(d.getFullYear()).slice(2):'')})}return out}
/* weeks (Monday start) that a custom range touches, or the last 26 */
function dhWk(rg){if(!(rg&&rg.custom))return dhWeeks(26);const t=new Date(rg.a+'T12:00:00'),off=(t.getDay()+6)%7;let w=addD(rg.a,-off);const out=[];while(w<=rg.b&&out.length<60){out.push(w);w=addD(w,7)}return out}
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
    s+=`<g class="bg" data-tip="${dhTip(x.l,...(x.lines||[F(x.v+(x.w||0))+(o.unit?' '+o.unit:'')]))}"><rect class="hit" fill="#1B4DDB" fill-opacity="0" pointer-events="all" x="${(pl+i*bw).toFixed(1)}" y="${pt}" width="${bw.toFixed(1)}" height="${ih}"/>`;
    if(x.w)s+=`<rect class="b2" x="${bx.toFixed(1)}" y="${y2.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(0,y1-y2).toFixed(1)}" rx="3"/>`;
    s+=`<rect class="b1${o.c1?' '+o.c1:''}" x="${bx.toFixed(1)}" y="${y1.toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(0,Y(0)-y1).toFixed(1)}" rx="3"/></g>`;
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
  d.forEach((x,i)=>{s+=`<g class="lp" data-tip="${dhTip('Week of '+x.l,F(x.v)+' paid '+(x.v===1?'booking':'bookings'))}"><rect class="hit" fill="#1B4DDB" fill-opacity="0" pointer-events="all" x="${(X(i)-cw/2).toFixed(1)}" y="${pt}" width="${cw.toFixed(1)}" height="${ih}"/><line class="lg" stroke="#1B4DDB" stroke-width="1" stroke-opacity="0" x1="${X(i).toFixed(1)}" x2="${X(i).toFixed(1)}" y1="${pt}" y2="${Y(0)}"/><circle class="ld" cx="${X(i).toFixed(1)}" cy="${Y(x.v).toFixed(1)}" r="${n>30?1.5:2.6}"/></g>`;if(i%every===0)s+=`<text class="ct" x="${X(i).toFixed(1)}" y="${H-6}" text-anchor="middle">${esc(x.l)}</text>`});
  return s+'</svg>'}
function chDonut(d,o){o=o||{};const tot=d.reduce((s,x)=>s+x.v,0);if(!tot)return '<p class="dnote">Nothing in this range.</p>';
  const R=58,r=38,C=64,live=d.filter(x=>x.v>0),P=(a,q)=>[(C+q*Math.cos(a)).toFixed(2),(C+q*Math.sin(a)).toFixed(2)];let a0=-Math.PI/2,sv='';
  if(live.length===1)sv=`<circle cx="${C}" cy="${C}" r="${(R+r)/2}" fill="none" stroke="${live[0].c}" stroke-width="${R-r}" data-tip="${dhTip(live[0].l,live[0].v+' (100%)')}"/>`;
  else live.forEach(x=>{const a1=a0+2*Math.PI*x.v/tot,big=(a1-a0)>Math.PI?1:0,p1=P(a0,R),p2=P(a1,R),p3=P(a1,r),p4=P(a0,r);
    sv+=`<path d="M${p1} A${R} ${R} 0 ${big} 1 ${p2} L${p3} A${r} ${r} 0 ${big} 0 ${p4} Z" fill="${x.c}" data-tip="${dhTip(x.l,dhN(x.v)+' '+(o.unit||''),Math.round(x.v/tot*100)+'% of all')}"/>`;a0=a1});
  return `<div class="dnut"><svg viewBox="0 0 128 128" width="128" height="128" role="img" aria-label="${esc(o.label||'')}">${sv}<text x="64" y="62" text-anchor="middle" class="dnn">${dhN(tot)}</text><text x="64" y="78" text-anchor="middle" class="ct">${esc(o.unit||'total')}</text></svg>
  <ul class="dleg">${(live.length?live:d).map(x=>`<li data-tip="${dhTip(x.l,dhN(x.v)+' '+(o.unit||''),Math.round(x.v/tot*100)+'% of all')}"><i style="background:${x.c}"></i><span>${esc(x.l)}</span><b>${dhN(x.v)}</b><small>${Math.round(x.v/tot*100)}%</small></li>`).join('')}</ul></div>`}
function chHB(d,o){o=o||{};const F=o.fmt||dhK;if(!d.length)return '<p class="dnote">Nothing in this range.</p>';const mx=Math.max(1,...d.map(x=>x.v));
  const tot=d.reduce((s,x)=>s+x.v,0);return `<div class="hbl">${d.map(x=>`<div class="hb" data-tip="${dhTip(x.l,F(x.v)+(tot?' · '+Math.round(x.v/tot*100)+'% of this list':''),x.n!=null?dhS(x.n,'booking'):'')}"><span class="hl" title="${esc(x.l)}">${esc(x.l)}${x.sub?`<small>${esc(x.sub)}</small>`:''}</span><span class="hbar"><i style="width:${Math.max(2,x.v/mx*100).toFixed(1)}%"></i></span><b>${esc(F(x.v))}</b></div>`).join('')}</div>`}
function chHeat(rows,weeks){if(!rows.length)return '<p class="dnote">No vehicles yet.</p>';
  return `<div class="heat" style="--wk:${weeks.length}"><div class="hrow hh"><span></span><div class="hcells">${weeks.map((w,i)=>`<em>${i%4===0?esc(fmtS(w)):''}</em>`).join('')}</div></div>${rows.map(r=>`<div class="hrow"><span class="hl" title="${esc(r.l)}">${esc(r.l)}</span><div class="hcells">${r.c.map((v,i)=>`<i style="background:color-mix(in srgb,var(--accent) ${Math.round(v/7*100)}%,var(--line))" data-tip="${dhTip(r.l,'Week of '+fmtS(weeks[i]),v+' of 7 days booked')}"></i>`).join('')}</div></div>`).join('')}</div><p class="dnote" style="margin:8px 0 0">Darker means more of that week was booked.</p>`}
const dhCard=(title,sub,body,cls)=>`<section class="dc${cls?' '+cls:''}"><h3>${esc(title)}</h3>${sub?`<p class="dcs">${esc(sub)}</p>`:''}${body}</section>`;
const KH={'Booking value':'Total price of paid and completed trips, counted on the pickup date.','Arkila commission':'Arkila\'s cut of the booking value.','Paid bookings':'Trips where the renter paid. Cancelled and declined ones are left out.','New users':'Accounts created in this range.','Live vehicles':'Approved vehicles that are not paused.','Cancel / decline rate':'Share of requests in the range that ended cancelled or declined.','Upcoming paid trips':'Confirmed trips with a pickup date from today on.','Owner payouts due':'Owner share of completed trips not yet marked as paid.','Your earnings':'What you receive after the Arkila fee, for paid and completed trips.','Coming to you':'Confirmed or completed trips not yet paid out to you.','Occupancy':'Booked vehicle-days divided by available vehicle-days in this range.','Rating':'Average of renter reviews on your vehicles.','Waiting for you':'New requests where you still need to say if the dates are free.'};
const dhKpi=(label,val,delta,sub)=>`<div class="dstat kpi" data-tip="${dhTip(label,KH[label]||'')}"><span>${esc(label)}</span><b>${val}</b>${delta||''}${sub?`<small class="ks">${esc(sub)}</small>`:''}</div>`;
const dhRangeBar=()=>`<div class="drs" role="group" aria-label="Date range">${DRANGES.map(x=>`<button type="button" class="dchip" data-dr="${x[0]}" aria-pressed="${DR===x[0]}">${x[1]}</button>`).join('')}<button type="button" class="dchip rcb" data-dr="c" aria-pressed="${DR==='c'}" aria-haspopup="dialog"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>${DR==='c'&&DRC?esc(fmtS(DRC.a)+' – '+fmtS(DRC.b)):'Custom range'}</button>${DR==='c'?'<button type="button" class="dchip" data-dr="90" aria-label="Back to 90 days" title="Back to 90 days">×</button>':''}</div>`;

/* shared series */
function dhSeries(D,valueOf){
  const mo=dhMonths(D.rg),daily=D.rg.custom&&D.rg.n<=31,idx=new Map(mo.map((m,i)=>[m.key,i])),v=mo.map(m=>({l:m.label,v:0,w:0,n:0}));
  D.all.filter(dhPaid).forEach(r=>{const i=idx.get(daily?r.from:r.from.slice(0,7));if(i!=null){valueOf(r,v[i]);v[i].n++}});
  return v}
function dhWeekly(D){const wk=dhWk(D.rg),out=wk.map(w=>({l:fmtS(w),v:0}));
  D.all.filter(dhPaid).forEach(r=>{for(let i=wk.length-1;i>=0;i--)if(r.from>=wk[i]){if(r.from<=addD(wk[i],6))out[i].v++;break}});return out}
function dhWeekdays(D){const nm=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],v=nm.map(l=>({l,v:0}));D.paid.forEach(r=>{v[new Date(r.from+'T12:00:00').getDay()].v++});return v}
function dhStatus(D){const c={};D.cur.forEach(r=>c[r.status]=(c[r.status]||0)+1);return Object.keys(DSTAT).map(k=>({l:DSTAT[k][0],v:c[k]||0,c:DSTAT[k][1]}))}
function dhGroup(D,keyf,valf,subf){const m=new Map();D.paid.forEach(r=>{const k=keyf(r);if(!k)return;const o=m.get(k)||{l:k,v:0,n:0};o.v+=valf(r);o.n++;m.set(k,o)});return[...m.values()].sort((a,b)=>b.v-a.v)}

/* ---------- admin dashboard ---------- */
function adDash(){
  if(!ST.requests.length)return `<div class="card"><h2>Insights</h2><div class="dsub">No bookings yet, so there is nothing to chart. Charts fill in as requests come in. For test data, use the Test data button.</div></div>`;
  const D=dhData(''),rg=D.rg,t0=todayIso(),per=rg.custom&&rg.n<=31?'day':'month';
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
  return `<div class="dhead2"><div><p class="dnote" style="margin:0">Booking value counts paid and completed trips by pickup date. Showing ${esc(rg.custom?rg.label:rg.label.toLowerCase())}.</p></div>${dhRangeBar()}</div>
  <div class="dkp">${kpis}</div>
  <div class="dgrid">${dhCard('Booking value by '+per,(rg.custom?(per==='day'?'Each day in your range.':'Months in your range.'):'Last 12 months.')+' The dark blue bottom part is Arkila’s commission, the light blue part is the owners’ share.',chBars(mon,{money:1,fmt:dhK,label:'Booking value by month'}),'wide')}
  ${dhCard('Paid bookings per week',(rg.custom?'Weeks in your range':'Last 26 weeks')+', by pickup date',chLine(dhWeekly(D),{label:'Bookings per week',half:1}))}
  ${dhCard('Busiest pickup days','In the selected range',chBars(dhWeekdays(D),{label:'Pickups by weekday',h:170,half:1,unit:'pickups'}))}
  ${dhCard('Request outcomes','Requests with a pickup date in this range',chDonut(dhStatus(D),{unit:'requests',label:'Request outcomes'}))}
  ${dhCard('Booking value by area','Top areas by pickup vehicle',chHB(area))}
  ${dhCard('Booking value by vehicle type','',chHB(type))}
  ${dhCard('Top 10 vehicles','By booking value',chHB(topV))}
  ${dhCard('Top 10 owners','By booking value',chHB(topO))}</div>`}

/* ---------- owner dashboard (own numbers only; the admin can open any owner's view) ---------- */
function ownDash(oid,asAdmin){
  const u=ST.users.find(x=>x.id===oid),mine=ST.listings.filter(l=>l.ownerId===oid),ids=new Set(mine.map(l=>l.id));
  const D=dhData(oid),rg=D.rg,t0=todayIso(),per=rg.custom&&rg.n<=31?'day':'month';
  const back='';
  if(!D.all.length&&!mine.length)return `<div class="card"><h2>Welcome</h2><div class="dsub">You have no vehicles yet. Add your first one and Arkila will review it. Your earnings and occupancy show up here once renters start booking.</div></div>`;
  if(!D.all.length)return `<div class="card"><h2>Your numbers</h2><div class="dsub">Earnings, occupancy and trends show up here once your vehicles get their first bookings.</div></div>`;
  const earn=dhSum(D.paid,ownerGets),pe=dhSum(D.pprev,ownerGets),live=mine.filter(l=>l.status==='approved'&&l.active!==false).length;
  const bd=dhSum(D.paid,r=>dhBooked(r,rg.a,rg.b)),occ=live?Math.min(100,Math.round(bd/(live*rg.n)*100)):0,pbd=rg.pa?dhSum(D.pprev,r=>dhBooked(r,rg.pa,rg.pb)):0,pocc=rg.pa&&live?Math.min(100,Math.round(pbd/(live*rg.n)*100)):0;
  const rv=ST.reviews.filter(x=>ids.has(x.carId)),rat=rv.length?(rv.reduce((s,x)=>s+x.rating,0)/rv.length).toFixed(1):'–';
  const pay=D.all.filter(r=>(r.status==='completed'&&!r.paid)||r.status==='confirmed'),wait=D.all.filter(r=>r.status==='new'&&!r.avail).length;
  const kpis=[dhKpi('Your earnings',dhK(earn),dhDelta(earn,pe),'after '+Math.round(SETTINGS.commission*100)+'% Arkila fee · '+rg.label),dhKpi('Coming to you',dhK(dhSum(pay,ownerGets)),'',dhS(pay.length,'trip')+' not yet paid out'),
    dhKpi('Paid bookings',dhN(D.paid.length),dhDelta(D.paid.length,D.pprev.length),'avg '+php(D.paid.length?dhSum(D.paid,r=>r.total)/D.paid.length:0)),dhKpi('Occupancy',occ+'%',rg.pa?`<small class="dd ${occ>=pocc?'up':'dwn'}">${occ>=pocc?'▲':'▼'} ${Math.abs(occ-pocc)} pts vs previous</small>`:'',bd+' vehicle-days booked'),
    dhKpi('Rating',rat==='–'?rat:'★ '+rat,'',rv.length+' reviews'),dhKpi('Waiting for you',dhN(wait),'','open requests, any date')].join('');
  const mon=dhSeries(D,(r,m)=>{m.v+=ownerGets(r)}).map(m=>({l:m.l,v:m.v,lines:['Earnings '+php(m.v),dhS(m.n,'paid booking'),m.n?'avg '+php(m.v/m.n)+' per trip':'']}));
  const wk=dhWk(rg),heat=mine.filter(l=>l.status==='approved').map(l=>{const c=wk.map(()=>0);D.all.filter(r=>r.carId===l.id&&dhPaid(r)).forEach(r=>wk.forEach((w,i)=>{c[i]+=dhBooked(r,w,addD(w,6))}));return{l:l.name,c,tot:c.reduce((s,x)=>s+x,0)}}).sort((a,b)=>b.tot-a.tot).slice(0,10);
  const perV=dhGroup(D,r=>r.carName,ownerGets).slice(0,10),nxt=D.all.filter(r=>r.status==='confirmed'&&r.from>=t0).sort((a,b)=>a.from>b.from?1:-1).slice(0,5);
  const alert='';
  return `<div class="dhead2"><div><p class="dnote" style="margin:0">Earnings count paid and completed trips by pickup date. Showing ${esc(rg.custom?rg.label:rg.label.toLowerCase())}.</p></div>${dhRangeBar()}</div>
  <div class="dkp own">${kpis}</div>
  <div class="dgrid">${dhCard('Earnings by '+per,(rg.custom?(per==='day'?'Each day in your range':'Months in your range'):'Last 12 months')+', after the Arkila fee',chBars(mon,{money:1,fmt:dhK,label:'Earnings by month'}),'wide')}
  ${dhCard('Occupancy by vehicle',rg.custom?'Weeks in your range':'Last 26 weeks',chHeat(heat,wk),'wide')}
  ${dhCard('Earnings per vehicle','In the selected range',chHB(perV))}
  ${dhCard('Request outcomes','Requests with a pickup date in this range',chDonut(dhStatus(D),{unit:'requests',label:'Request outcomes'}))}
  ${dhCard('Busiest pickup days','In the selected range',chBars(dhWeekdays(D),{label:'Pickups by weekday',h:170,half:1,unit:'pickups'}))}
  ${dhCard('Next pickups','Paid trips coming up',nxt.length?nxt.map(r=>`<div class="dlrow"><b>${esc(r.carName)}</b><span class="dsub">${esc(fmtS(r.from))}${r.time?' · '+esc(r.time):''} · ${r.days} day${r.days>1?'s':''} · you get ${php(ownerGets(r))}</span></div>`).join(''):'<p class="dnote">No paid pickups coming up.</p>')}</div>`}


/* ---- hover / tap details for every chart, tile and bar ----
   Uses pointer events (mouse and pen hover, touch taps) and inline styles, so it works the same inside any viewer or frame. */
(function(){const tip=document.createElement('div');tip.id='dtip';tip.setAttribute('role','tooltip');
  tip.style.cssText='position:fixed;z-index:2147483000;pointer-events:none;display:none;max-width:240px;gap:2px;padding:8px 10px;border-radius:10px;background:#0f1a2b;color:#fff;font-size:13px;line-height:1.35;box-shadow:0 6px 20px rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.14);left:0;top:0';
  document.body.appendChild(tip);let cur=null,pt='mouse';
  const hidden=()=>tip.style.display==='none';
  const hide=()=>{tip.style.display='none';cur=null};
  const show=(el,x,y)=>{const t=el.getAttribute('data-tip');if(!t){hide();return}
    if(cur!==el){cur=el;tip.textContent='';t.split('\n').forEach((ln,i)=>{const d=document.createElement(i?'span':'b');d.style.cssText=i?'display:block;color:#d3dcec;font-variant-numeric:tabular-nums':'display:block;font-size:13px';d.textContent=ln;tip.appendChild(d)})}
    tip.style.display='grid';const w=tip.offsetWidth,h=tip.offsetHeight,vw=document.documentElement.clientWidth,vh=window.innerHeight;let L=x+14,T=y+16;if(L+w>vw-8)L=x-w-14;if(L<8)L=8;if(T+h>vh-8)T=y-h-12;if(T<8)T=8;tip.style.left=L+'px';tip.style.top=T+'px'};
  const hit=e=>e.target&&e.target.closest?e.target.closest('#view [data-tip]'):null;
  document.addEventListener('pointerdown',e=>{pt=e.pointerType||'mouse'},true);
  document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const el=hit(e);if(el)show(el,e.clientX,e.clientY);else if(!hidden())hide()},true);
  document.addEventListener('mousemove',e=>{if(pt==='touch')return;const el=hit(e);if(el)show(el,e.clientX,e.clientY);else if(!hidden())hide()},true);
  document.addEventListener('click',e=>{const el=hit(e);if(pt==='touch'){if(el){cur===el&&!hidden()?hide():show(el,e.clientX,e.clientY)}else hide()}},true);
  document.addEventListener('scroll',hide,true);document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});window.addEventListener('hashchange',hide);
})();


/* ---- custom date range: a floating two-month calendar, like the availability one ---- */
let RC=null;
const RCM=['January','February','March','April','May','June','July','August','September','October','November','December'];
function rcMonth(y,m,which){
  const first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate(),pad=x=>String(x).padStart(2,'0');
  let h=`<div class="rcm1 ${which}"><div class="rch">${which==='rc1'?'<button type="button" class="rcn" data-rcnav="-1" aria-label="Previous month">‹</button>':'<span class="rcn ph"></span>'}<b>${RCM[m]} ${y}</b>${which==='rc2'?'<button type="button" class="rcn" data-rcnav="1" aria-label="Next month">›</button>':'<button type="button" class="rcn nx" data-rcnav="1" aria-label="Next month">›</button>'}</div><div class="rcg">`+['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<span class="wd">${x}</span>`).join('');
  for(let i=0;i<first;i++)h+='<span></span>';
  for(let d=1;d<=n;d++){const k=`${y}-${pad(m+1)}-${pad(d)}`;h+=k>todayIso()?`<button type="button" class="fu" disabled>${d}</button>`:`<button type="button" data-rcd="${k}">${d}</button>`}
  return h+'</div></div>'}
function rcPaint(){
  const pop=document.getElementById('rcpop');if(!pop||!RC)return;
  const lo0=RC.a,hi0=RC.b||(RC.a&&RC.hov)||'',lo=hi0&&hi0<lo0?hi0:lo0,hi=hi0&&hi0<lo0?lo0:hi0,t=todayIso();
  pop.querySelectorAll('[data-rcd]').forEach(b=>{const d=b.dataset.rcd;b.className=(lo&&d===lo?'a ':'')+(hi&&d===hi?'z ':'')+(lo&&hi&&d>lo&&d<hi?'in ':'')+(d===t?'td':'')});
  const s=pop.querySelector('.rcs'),ok=RC.a&&RC.b;
  s.textContent=!RC.a?'Pick the first day':!RC.b?'Now pick the last day':fmtS(RC.a)+' – '+fmtS(RC.b)+' · '+dhS(days(RC.a,RC.b)+1,'day');
  pop.querySelector('[data-rcapply]').disabled=!ok}
function rcDraw(){
  const pop=document.getElementById('rcpop');let y2=RC.y,m2=RC.m+1;if(m2>11){m2=0;y2++}
  pop.innerHTML=`<div class="rcm">${rcMonth(RC.y,RC.m,'rc1')}${rcMonth(y2,m2,'rc2')}</div><div class="rcf"><span class="rcs" aria-live="polite"></span><span class="rcb2"><button type="button" class="dchip" data-rcclear>Reset to default</button><button type="button" class="dchip on" data-rcapply>Apply</button></span></div>`;
  rcPaint()}
function rcOpen(){
  const t=todayIso(),base=(DR==='c'&&DRC)?DRC.a:addD(t,-30);
  RC={y:+base.slice(0,4),m:+base.slice(5,7)-1,a:(DR==='c'&&DRC)?DRC.a:'',b:(DR==='c'&&DRC)?DRC.b:'',hov:''};
  let bk=document.getElementById('rcbk'),pop=document.getElementById('rcpop');
  if(!bk){bk=document.createElement('div');bk.id='rcbk';document.body.appendChild(bk);pop=document.createElement('div');pop.id='rcpop';pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Choose a date range');document.body.appendChild(pop)}
  bk.style.display='block';pop.style.display='block';rcDraw()}
function rcClose(){const bk=document.getElementById('rcbk'),pop=document.getElementById('rcpop');if(bk)bk.style.display='none';if(pop)pop.style.display='none';RC=null}
document.addEventListener('click',e=>{
  if(!RC)return;
  if(e.target.id==='rcbk'){rcClose();return}
  const d=e.target.closest('[data-rcd]');
  if(d){const k=d.dataset.rcd;if(!RC.a||RC.b){RC.a=k;RC.b='';RC.hov=''}else{if(k<RC.a){RC.b=RC.a;RC.a=k}else RC.b=k}rcPaint();return}
  const nv=e.target.closest('[data-rcnav]');if(nv){RC.m+=+nv.dataset.rcnav;if(RC.m<0){RC.m=11;RC.y--}if(RC.m>11){RC.m=0;RC.y++}{const t=todayIso(),ty=+t.slice(0,4),tm=+t.slice(5,7)-1;const mx=tm-(innerWidth>640?1:0);if(RC.y*12+RC.m>ty*12+mx){RC.y=ty;RC.m=mx;if(RC.m<0){RC.m=11;RC.y--}}}rcDraw();return}
  if(e.target.closest('[data-rcapply]')){if(RC.a&&RC.b){DR='c';DRC={a:RC.a,b:RC.b};rcClose();dhRefresh()}return}
  if(e.target.closest('[data-rcclear]')){DR=90;DRC=null;rcClose();dhRefresh();return}
});
document.addEventListener('mouseover',e=>{if(!RC||!RC.a||RC.b)return;const d=e.target.closest('[data-rcd]');if(d&&RC.hov!==d.dataset.rcd){RC.hov=d.dataset.rcd;rcPaint()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&RC){rcClose();e.stopPropagation()}},true);

/* ---- date range buttons ---- */
document.addEventListener('click',e=>{const r=e.target.closest('[data-dr]');if(!r)return;if(r.dataset.dr==='c'){rcOpen();return}DR=+r.dataset.dr;DRC=null;dhRefresh()});
