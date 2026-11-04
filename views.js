/* Login, owner, trips and admin screens. Demo only: no real Facebook or Google yet. */
const ROUTES=['home','saved','host','trips','account','admin','terms','privacy'];
const STATUS={new:['Requested','w'],confirmed:['Paid and confirmed','b'],completed:['Completed','g'],cancelled:['Cancelled','r'],declined:['Declined by owner','r'],pending:['Waiting for approval','w'],approved:['Live','g'],rejected:['Not approved','r'],paused:['Paused','']};
const dr=r=>r.time?fmt(r.from)+', '+tl(r.time)+' to '+fmt(r.to)+', '+tl(endTime(r.time,r.extraH))+(r.extraH?' (+'+r.extraH+' h)':''):fmt(r.from)+' to '+fmt(r.to);
const pill=k=>{const s=STATUS[k]||[k,''];return `<span class="pill ${s[1]}">${esc(t('st.'+k)===('st.'+k)?s[0]:t('st.'+k))}</span>`};
const has=(u,r)=>!!(u&&u.roles.includes(r));
const first=n=>String(n||'').split(' ')[0];

/* ---- requests ---- */
function saveRequest(q,name,phone,notes,spot,msg,email){
  const me=ST.me();let id;do{id='REQ-'+(1000+Math.floor(Math.random()*9000))}while(ST.requests.some(r=>r.id===id));
  const r={id,carId:q.c.id,carName:q.c.name,hostId:q.c.ownerId,hostName:q.c.ownerName,guestId:me.id,guestName:name,guestPhone:phone,guestEmail:email||'',from:q.a,to:q.b,time:q.time||'',extraH:q.extra||0,extraFee:q.xfee||0,days:q.d,total:q.total,deposit:q.dep,spot,notes,msg,status:'new',ack:{renterNotice:Date.now(),v:'2026-11-03'},createdAt:Date.now()};
  ST.requests.unshift(r);ST.save();renderNav();return r;
}
const setReq=(id,status)=>{const r=ST.requests.find(x=>x.id===id);if(r){r.status=status;ST.save()}};

/* ---- nav ---- */
function renderNav(){
  const me=ST.me(),h=location.hash.slice(1)||'home',on=k=>h===k?' class="on" aria-current="page"':'';
  const myTrips=me?ST.requests.filter(r=>r.guestId===me.id&&r.status!=='cancelled').length:0;
  const ic=p=>`<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const I={rent:'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',saved:'<path d="M6 3.5h12v17l-6-4.5-6 4.5z"/>',trips:'<path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v4H3z"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>',acct:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-4 3.2-6 7-6s7 2 7 6"/>',admin:'<path d="M12 3l8 3v6c0 4.5-3.4 7.7-8 9-4.6-1.3-8-4.5-8-9V6z"/>'};
  const row=(href,k,label,badge)=>`<a href="${href}" role="menuitem"${on(k)}>${ic(I[k])}<span>${esc(label)}</span>${badge?`<b>${badge}</b>`:''}</a>`;
  $('#nav').innerHTML=row('#home','rent',t('nav.rent'))+row('#saved','saved',t('nav.saved'),ST.favs.length)+(me?row('#trips','trips',t('nav.trips'),myTrips)+row('#account','acct',t('nav.account')):'')+(has(me,'admin')?row('#admin','admin',t('nav.admin')):'');
  $('#mauth').innerHTML=me?`<div class="who">${esc(me.name)}</div><button type="button" class="mi" data-logout role="menuitem">${esc(t('nav.logout'))}</button>`:`<button type="button" class="mi strong" data-login role="menuitem">${esc(t('nav.login'))}</button>`;
  const hb=$('#hostbtn');if(hb){hb.textContent=has(me,'host')?t('nav.host'):t('nav.become');if(me){hb.setAttribute('href','#host');hb.removeAttribute('data-login');hb.classList.toggle('on',h==='host')}else{hb.setAttribute('href','#host');hb.dataset.login='host'}}
  const av=$('#mav');if(av)av.textContent=me?first(me.name).charAt(0).toUpperCase():'';
  const mb=$('#mbtn');if(mb)mb.classList.toggle('in',!!me);
  const sb=$('#setbtn');if(sb)sb.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="vertical-align:-3px"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="2"/></svg> ${PREF.lang.toUpperCase()} · ${PREF.cur}`;
}

const FILX={"Dates are free":"Libre ang mga petsa","Decline":"Tanggihan","You confirmed the dates. Waiting for the renter to pay.":"Kinumpirma mo ang mga petsa. Hinihintay ang bayad ng umuupa.","Dates confirmed":"Nakumpirma ang mga petsa","Request declined":"Tinanggihan ang request","Owner dashboard": "Dashboard ng may-ari", "New vehicles are checked by the Arkila team before renters can see them.": "Sinusuri muna ng Arkila team ang mga bagong sasakyan bago ito makita ng mga umuupa.", "How a booking works for you": "Paano gumagana ang booking para sa iyo", "Arkila checks the renter's licence and ID.": "Chine-check ng Arkila ang lisensya at ID ng umuupa.", "Arkila asks you to confirm the vehicle is free for the dates. Reply within [2 hours] or the request lapses.": "Hihilingin ng Arkila na kumpirmahin mong libre ang sasakyan sa mga petsa. Sumagot sa loob ng [2 oras] o mawawalan ng bisa ang request.", "The renter agrees to the renter notice and pays Arkila online. Arkila confirms the booking and blocks the dates on your calendar.": "Sumasang-ayon ang umuupa sa renter notice at nagbabayad online sa Arkila. Kinukumpirma ng Arkila ang booking at ibina-block ang mga petsa sa kalendaryo mo.", "You and the renter complete Arkila's handover checklist at pickup, with dated photos.": "Kayo ng umuupa ang magtatapos ng handover checklist ng Arkila sa pickup, may mga litratong may petsa.", "Arkila pays you the rental fee, less its fee, 24 hours after pickup if the renter reports no problem.": "Babayaran ka ng Arkila ng renta, bawas ang fee nito, 24 oras matapos ang pickup kung walang problemang iulat ang umuupa.", "The renter's deposit stays with Arkila. If you report damage within [24 hours] of return, the claimed amount stays held until it is settled.": "Nasa Arkila ang deposit ng umuupa. Kung mag-ulat ka ng pinsala sa loob ng [24 oras] matapos ibalik, hawak muna ang kinukuhang halaga hanggang maayos.", "Your vehicles": "Mga sasakyan mo", "View": "Tingnan", "Calendar": "Kalendaryo", "Pause": "I-pause", "Resume": "Ituloy", "Delete": "Burahin", "Tap again to delete": "I-tap ulit para burahin", "Add a vehicle": "Magdagdag ng sasakyan", "Category": "Kategorya", "Car, van or pickup": "Kotse, van o pickup", "Motorbike or scooter": "Motorsiklo o scooter", "Vehicle name": "Pangalan ng sasakyan", "Type": "Uri", "Seats": "Upuan", "Riders": "Sakay", "Service": "Serbisyo", "Self-drive": "Self-drive", "With driver": "May driver", "Pickup location": "Pickup location", "Pick one from the list so renters can find you on the map.": "Pumili sa listahan para mahanap ka ng mga umuupa sa mapa.", "Price per day (PHP)": "Presyo kada araw (PHP)", "Color": "Kulay", "Silver": "Silver", "Black": "Itim", "White": "Puti", "Blue": "Asul", "Red": "Pula", "Green": "Berde", "Grey": "Abo", "Short description": "Maikling paglalarawan", "Year": "Taon", "Luggage (bags)": "Bagahe (bag)", "Engine size (cc)": "Laki ng makina (cc)", "Transmission": "Transmission", "Automatic": "Automatic", "Manual": "Manual", "Fuel": "Gasolina", "Gasoline": "Gasolina", "Diesel": "Diesel", "Hybrid": "Hybrid", "Electric": "Electric", "Helmets included": "Kasamang helmet", "Security deposit (PHP), paid to Arkila and refunded to the renter": "Security deposit (PHP), binabayad sa Arkila at ibinabalik sa umuupa", "Daily distance limit": "Limitasyon ng layo kada araw", "Features (separate with commas)": "Mga tampok (paghiwalayin ng kuwit)", "Photos (up to 4)": "Mga litrato (hanggang 4)", "Only upload photos you took or have permission to use.": "Mag-upload lang ng litratong kinuha mo o may pahintulot kang gamitin.", "I have read and agree to the": "Nabasa ko at sumasang-ayon ako sa", "owner declaration": "owner declaration", "and the": "at sa", "Terms of Service": "Terms of Service", ", and I understand Arkila holds the booking money and pays me after the handover.": ", at nauunawaan kong hawak ng Arkila ang bayad sa booking at babayaran ako pagkatapos ng handover.", "Submit for approval": "Ipasa para ma-approve", "Requests for your vehicles": "Mga request para sa sasakyan mo", "No requests yet.": "Wala pang request.", "PH:Toyota Vios 2021": "Toyota Vios 2021", "PH:Search a town, airport or place": "Maghanap ng bayan, airport o lugar", "PH:One or two sentences guests will read": "Isa o dalawang pangungusap na babasahin ng mga umuupa", "PH:150 km/day, or Unlimited": "150 km/araw, o Unlimited", "PH:Air conditioning, Bluetooth audio, USB charging": "Aircon, Bluetooth audio, USB charging", "Hide calendar": "Itago ang kalendaryo", "Available": "Bakante", "Booked": "Naka-book", "Blocked by you": "Ni-block mo", "Blocked by Arkila": "Ni-block ng Arkila", "Tap a free day to block it, tap again to unblock. Booked days update by themselves when Arkila confirms a booking.": "I-tap ang bakanteng araw para i-block, i-tap ulit para i-unblock. Kusang nag-a-update ang mga naka-book na araw kapag kinumpirma ng Arkila ang booking.", "No vehicles yet. Add your first one below.": "Wala pang sasakyan. Idagdag ang una mo sa ibaba.", "Earn from your vehicle": "Kumita sa sasakyan mo", "List a car, van or motorbike. Arkila handles the renter checks, the paperwork and the payment. The renter pays Arkila online up front, and Arkila pays you after the handover, less its fee.": "Mag-list ng kotse, van o motorsiklo. Ang Arkila ang bahala sa pag-check sa umuupa, papeles at bayad. Nagbabayad online muna ang umuupa sa Arkila, at babayaran ka ng Arkila pagkatapos ng handover, bawas ang fee nito.", "List your vehicle": "I-list ang sasakyan mo", "Account": "Account", "Personal details": "Personal na detalye", "Sign-in": "Pag-sign in", "Privacy & data": "Privacy at data", "Notifications": "Mga abiso", "Payments": "Mga bayad", "Language & currency": "Wika at currency", "Owner tools": "Gamit ng may-ari", "Legal name": "Legal na pangalan", "Edit": "I-edit", "Preferred first name": "Gustong pangalan", "Not provided": "Walang nakalagay", "Add": "Idagdag", "Email": "Email", "Mobile number": "Mobile number", "Home address": "Tirahan", "Emergency contact": "Emergency contact", "Driving licence and ID": "Lisensya at ID", "Arkila checks these when you book. They are not stored on this demo site.": "Chine-check ito ng Arkila kapag nag-book ka. Hindi ito naka-save sa demo site na ito.", "Signed in with": "Naka-sign in gamit ang", "Member since": "Miyembro mula", "This device": "Device na ito", "Log out to end your session here.": "Mag-log out para tapusin ang session dito.", "Log out": "Mag-log out", "Privacy and data": "Privacy at data", "Download my data": "I-download ang data ko", "A copy of your details, requests and listings from this device.": "Kopya ng mga detalye, request at listing mo mula sa device na ito.", "Download": "I-download", "Delete my account": "Burahin ang account ko", "Removes your details, requests and listings from this device. This cannot be undone.": "Aalisin ang mga detalye, request at listing mo sa device na ito. Hindi na ito maibabalik.", "Read the rules": "Basahin ang mga patakaran", "Privacy Notice": "Privacy Notice", "Common questions": "Mga karaniwang tanong", "Who can see my details?": "Sino ang makakakita ng detalye ko?", "An owner sees your name, contact and trip details only after you send a request for their vehicle.": "Makikita lang ng may-ari ang pangalan, contact at detalye ng biyahe mo pagkatapos mong mag-request sa sasakyan nila.", "Can I change my details?": "Pwede ko bang baguhin ang detalye ko?", "Yes, any time under Personal details.": "Oo, anumang oras sa Personal na detalye.", "What does Arkila keep private?": "Ano ang pinapanatiling pribado ng Arkila?", "Your licence and ID, and your payment details. Owners never see them.": "Ang lisensya at ID mo, at ang detalye ng bayad mo. Hindi ito nakikita ng mga may-ari.", "Invoices and booking confirmations": "Mga invoice at booking confirmation", "These are your official record, so they are always on.": "Ito ang opisyal mong record, kaya laging naka-on.", "Requests and questions": "Mga request at tanong", "Handled on Facebook Messenger. We reply there when you message us.": "Sa Facebook Messenger ito inaasikaso. Doon kami sasagot kapag nag-message ka.", "How you pay": "Paano magbayad", "After the owner confirms, you pay the rental fee and the refundable deposit online to Arkila. Arkila pays the owner after pickup.": "Kapag nakumpirma na ng may-ari, babayaran mo online sa Arkila ang renta at ang refundable na deposit. Babayaran ng Arkila ang may-ari pagkatapos ng pickup.", "Refunds": "Mga refund", "Refunds go back to the method you paid with. See the cancellation rules in the": "Bumabalik ang refund sa paraan ng pagbayad mo. Tingnan ang cancellation rules sa", "Saved payment methods": "Mga naka-save na paraan ng bayad", "None. Arkila does not store your card or wallet details.": "Wala. Hindi iniipon ng Arkila ang card o wallet details mo.", "Language and currency": "Wika at currency", "Current setting": "Kasalukuyang setting", "Change": "Palitan", "Payout account": "Payout account", "My vehicles": "Mga sasakyan ko", "Add, pause or edit your listings.": "Magdagdag, mag-pause o mag-edit ng mga listing mo.", "Open owner area": "Buksan ang pang-may-ari", "Your name as it appears on your driving licence.": "Pangalan mo gaya ng nasa driving licence mo.", "What owners call you on chat.": "Tawag sa iyo ng mga may-ari sa chat.", "Used only for invoices and booking confirmations.": "Gamit lang para sa invoice at booking confirmation.", "Include the country code, for example +639171234567.": "Isama ang country code, hal. +639171234567.", "Where you live. Optional.": "Saan ka nakatira. Opsyonal.", "Name and number of someone we can reach. Optional.": "Pangalan at numero ng pwede naming tawagan. Opsyonal.", "Save": "I-save", "Cancel": "Kanselahin", "Account sections": "Mga seksyon ng account", "GCash number or bank account name": "GCash number o pangalan ng bank account", "Where Arkila sends your payout, 24 hours after pickup if there is no problem.": "Saan ipapadala ng Arkila ang payout mo, 24 oras matapos ang pickup kung walang problema.", "Please enter your full name.": "Ilagay ang buong pangalan mo.", "Please enter a valid email address.": "Maglagay ng wastong email.", "Please enter a valid mobile number with the country code.": "Maglagay ng wastong mobile number na may country code.", "Tick the owner declaration to submit.": "I-tick ang owner declaration para maipasa.", "Search and pick the pickup location from the list.": "Hanapin at piliin ang pickup location sa listahan.", "Add the vehicle name.": "Ilagay ang pangalan ng sasakyan.", "Saved": "Na-save", "Download started": "Nagsimula na ang download", "Account deleted": "Nabura ang account"};
const FILRX=[[/^(\w[\w ]*) · (\d+) (seats|riders) · (.+)$/,(a,ty,n,k,rest)=>`${ty} · ${n} ${k==='seats'?'upuan':'sakay'} · ${rest.replace(/\/day$/,'/araw').replace('Self-drive','Self-drive').replace('With driver','May driver')}`],[/^Sent to (.+)\. These are your official record, so they are always on\.$/,(a,e)=>`Ipinapadala sa ${e}. Ito ang opisyal mong record, kaya laging naka-on.`],[/^Sent to your email\. These are your official record, so they are always on\.$/,()=>'Ipinapadala sa email mo. Ito ang opisyal mong record, kaya laging naka-on.']];
const X=s=>(typeof PREF!=='undefined'&&PREF.lang==='fil'&&FILX[s])||s;
function trFil(root){
  if(typeof PREF==='undefined'||PREF.lang!=='fil'||!root)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;const L=[];while(n=w.nextNode())L.push(n);
  L.forEach(n=>{const raw=n.nodeValue,s=raw.replace(/\s+/g,' ').trim();if(!s)return;let o=FILX[s];if(o===undefined)for(const [rx,f] of FILRX){const mm=s.match(rx);if(mm){o=f(...mm);break}}if(o!==undefined)n.nodeValue=raw.match(/^\s*/)[0]+o+raw.match(/\s*$/)[0]});
  root.querySelectorAll('[placeholder]').forEach(e=>{const o=FILX['PH:'+e.placeholder];if(o)e.placeholder=o});
  root.querySelectorAll('[aria-label]').forEach(e=>{const o=FILX[e.getAttribute('aria-label')];if(o)e.setAttribute('aria-label',o)});
  root.querySelectorAll('select option').forEach(e=>{const o=FILX[e.textContent.trim()];if(o)e.textContent=o});
}
/* ---- account settings ---- */
let ACT='personal',ACE=null;
const ACTABS=[['personal','Personal details'],['signin','Sign-in'],['privacy','Privacy & data'],['notif','Notifications'],['pay','Payments'],['lang','Language & currency'],['owner','Owner tools']];
const ACF=[['first','First name','Your first name as it appears on your driving licence.','text',2],['last','Last name','Your last name as it appears on your driving licence.','text',2],['pname','Preferred first name','What owners call you on chat.','text',0],['email','Email','Used only for invoices and booking confirmations.','email',1],['phone','Mobile number','Include the country code, for example +639171234567.','tel',3],['addr','Home address','Where you live. Optional.','text',0],['emer','Emergency contact','Name and number of someone we can reach. Optional.','text',0]];
function acctVal(me,k){return k==='first'?userFL(me)[0]:k==='last'?userFL(me)[1]:(me[k]||'')}
function renderAccount(){
  const me=ST.me(),el=$('#v-account');if(!me){el.innerHTML='';return}
  const tabs=ACTABS.filter(x=>x[0]!=='owner'||has(me,'host'));if(!tabs.some(x=>x[0]===ACT))ACT='personal';
  const side=`<nav class="atabs" aria-label="Account sections">${tabs.map(x=>`<button type="button" data-atab="${x[0]}"${x[0]===ACT?' class="on" aria-current="true"':''}>${x[1]}</button>`).join('')}</nav>`;
  let main='';
  if(ACT==='personal'){
    main=`<h2>Personal details</h2>`+ACF.map(f=>{const k=f[0],val=acctVal(me,k);
      if(ACE===k)return `<div class="arow ed"><form data-aform="${k}" novalidate><label for="ai-${k}">${f[1]}</label><p class="hint">${f[2]}</p><input id="ai-${k}" type="${f[3]}" value="${esc(val)}" maxlength="120" autocomplete="off"><div class="aerr" role="alert"></div><div class="acts"><button type="submit" class="btn dark">Save</button><button type="button" class="lnk" data-acancel>Cancel</button></div></form></div>`;
      return `<div class="arow"><div><b>${f[1]}</b><span class="${val?'':'mut'}">${val?esc(val):'Not provided'}</span></div><button type="button" class="lnk" data-aedit="${k}">${val?'Edit':'Add'}</button></div>`}).join('')+
      `<div class="arow"><div><b>Driving licence and ID</b><span class="mut">Arkila checks these when you book. They are not stored on this demo site.</span></div></div>`;
  }else if(ACT==='signin'){
    const pv={facebook:'Facebook',google:'Google',admin:'Admin demo login'}[me.provider]||'Demo login';
    main=`<h2>Sign-in</h2><div class="arow"><div><b>Signed in with</b><span>${esc(pv)}</span></div></div><div class="arow"><div><b>Member since</b><span>${esc(new Date(me.createdAt||Date.now()).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}))}</span></div></div><div class="arow"><div><b>This device</b><span class="mut">Log out to end your session here.</span></div><button type="button" class="lnk" data-logout>Log out</button></div>`;
  }else if(ACT==='privacy'){
    main=`<h2>Privacy and data</h2><div class="arow"><div><b>Download my data</b><span class="mut">A copy of your details, requests and listings from this device.</span></div><button type="button" class="lnk" data-adl>Download</button></div><div class="arow"><div><b>Delete my account</b><span class="mut">Removes your details, requests and listings from this device. This cannot be undone.</span></div><button type="button" class="lnk dng" data-adel>Delete</button></div><div class="arow"><div><b>Read the rules</b><span><a href="#privacy">Privacy Notice</a> · <a href="#terms">Terms of Service</a></span></div></div>
    <div class="ainfo"><h3>Common questions</h3><p><b>Who can see my details?</b> An owner sees your name, contact and trip details only after you send a request for their vehicle.</p><p><b>Can I change my details?</b> Yes, any time under Personal details.</p><p><b>What does Arkila keep private?</b> Your licence and ID, and your payment details. Owners never see them.</p></div>`;
  }else if(ACT==='notif'){
    main=`<h2>Notifications</h2><div class="arow"><div><b>Invoices and booking confirmations</b><span>Sent to ${esc(me.email||'your email')}. These are your official record, so they are always on.</span></div></div><div class="arow"><div><b>Requests and questions</b><span>Handled on Facebook Messenger. We reply there when you message us.</span></div></div>`;
  }else if(ACT==='pay'){
    main=`<h2>Payments</h2><div class="arow"><div><b>How you pay</b><span>After the owner confirms, you pay the rental fee and the refundable deposit online to Arkila. Arkila pays the owner after pickup.</span></div></div><div class="arow"><div><b>Refunds</b><span>Refunds go back to the method you paid with. See the cancellation rules in the <a href="#terms">Terms of Service</a>.</span></div></div><div class="arow"><div><b>Saved payment methods</b><span class="mut">None. Arkila does not store your card or wallet details.</span></div></div>`;
  }else if(ACT==='lang'){
    main=`<h2>Language and currency</h2><div class="arow"><div><b>Current setting</b><span>${PREF.lang.toUpperCase()} · ${PREF.cur}</span></div><button type="button" class="lnk" data-setopen>Change</button></div>`;
  }else{
    main=`<h2>Owner tools</h2><div class="arow"><div><b>Payout account</b><span class="${me.payout?'':'mut'}">${me.payout?esc(me.payout):'Not provided'}</span></div><button type="button" class="lnk" data-aedit="payout">${me.payout?'Edit':'Add'}</button></div>`+(ACE==='payout'?`<div class="arow ed"><form data-aform="payout" novalidate><label for="ai-payout">GCash number or bank account name</label><p class="hint">Where Arkila sends your payout, 24 hours after pickup if there is no problem.</p><input id="ai-payout" value="${esc(me.payout||'')}" maxlength="120" autocomplete="off"><div class="aerr" role="alert"></div><div class="acts"><button type="submit" class="btn dark">Save</button><button type="button" class="lnk" data-acancel>Cancel</button></div></form></div>`:'')+`<div class="arow"><div><b>My vehicles</b><span>Add, pause or edit your listings.</span></div><a class="lnk" href="#host">Open owner area</a></div>`;
  }
  const oldTabs=el.querySelector('.atabs'),keep=oldTabs?oldTabs.scrollLeft:0;
  el.innerHTML=`<h1 class="atitle">Account</h1><p class="lead2">${esc(me.name)}${me.email?' · '+esc(me.email):''}</p><div class="acct">${side}<div class="apane">${main}</div></div>`;trFil(el);
  const tb=el.querySelector('.atabs'),on=tb&&tb.querySelector('.on');if(tb){tb.scrollLeft=keep;if(on&&tb.scrollWidth>tb.clientWidth){const l=on.offsetLeft,r=l+on.offsetWidth,pad=24;if(l-pad<tb.scrollLeft)tb.scrollLeft=Math.max(0,l-pad);else if(r+pad>tb.scrollLeft+tb.clientWidth)tb.scrollLeft=r+pad-tb.clientWidth}}
}
$('#v-account').addEventListener('click',e=>{
  const me=ST.me();if(!me)return;let b;
  if(b=e.target.closest('[data-atab]')){ACT=b.dataset.atab;ACE=null;renderAccount()}
  else if(b=e.target.closest('[data-aedit]')){ACE=b.dataset.aedit;renderAccount();const i=$('#ai-'+ACE);if(i)i.focus()}
  else if(e.target.closest('[data-acancel]')){ACE=null;renderAccount()}
  else if(e.target.closest('[data-adl]')){const d={account:me,requests:ST.requests.filter(r=>r.guestId===me.id),listings:ST.listings.filter(l=>l.ownerId===me.id),shortlist:ST.favs};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'}));a.download='arkila-my-data.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast(X('Download started'))}
  else if(e.target.closest('[data-adel]'))confirmBox({title:'Delete your account?',text:'This removes your details, requests and listings from this device. It cannot be undone.',go:'Delete my account',back:'Keep my account',ok:()=>{const id=me.id;ST.requests=ST.requests.filter(r=>r.guestId!==id);ST.listings=ST.listings.filter(l=>l.ownerId!==id);ST.users=ST.users.filter(u=>u.id!==id);ST.sid=null;ST.save();ACE=null;ACT='personal';renderNav();toast(X('Account deleted'));location.hash='home';route()}});
});
$('#v-account').addEventListener('submit',e=>{
  const f=e.target.closest('[data-aform]');if(!f)return;e.preventDefault();
  const me=ST.me(),k=f.dataset.aform,val=f.elements[0].value.trim(),er=f.querySelector('.aerr');let m='';
  if(k==='first'&&val.length<2)m='Please enter your first name.';
  else if(k==='last'&&val.length<2)m='Please enter your last name.';
  else if(k==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val))m='Please enter a valid email address.';
  else if(k==='phone'&&!/^\+?\d{8,15}$/.test(val.replace(/[\s-]/g,'')))m='Please enter a valid mobile number with the country code.';
  if(m){er.textContent=X(m);return}
  if(k==='first'||k==='last'){const fl=userFL(me);me.first=k==='first'?val:fl[0];me.last=k==='last'?val:fl[1];me.name=(me.first+' '+me.last).trim()}else me[k]=k==='phone'?val.replace(/[\s-]/g,''):val;
  if(k==='first'||k==='last'||k==='email'||k==='phone'){const c=lsg('contact',{});lss('contact',Object.assign({},c&&typeof c==='object'&&!Array.isArray(c)?c:{},{name:me.name,first:userFL(me)[0],last:userFL(me)[1],phone:me.phone||(c&&c.phone)||'',email:me.email||(c&&c.email)||''}))}
  ST.save();ACE=null;renderNav();renderAccount();toast(X('Saved'));
});

/* ---- login ---- */
const ldlg=$('#ldlg');
function openLogin(msg,role){
  $('#lbody').innerHTML=`<h2 id="ltitle">${esc(t('l.title'))}</h2><p class="note" style="margin:6px 0 0">${esc(msg||t('l.sub'))}</p>
  <div class="banner" style="margin:12px 0">${esc(t('l.demo'))}</div>
  <div class="form"><div class="f2"><label class="req"><span class="lab">${esc(t('l.fname'))}</span><input id="lfn" autocomplete="given-name" placeholder="Juan"></label><label class="req"><span class="lab">${esc(t('l.lname'))}</span><input id="lln" autocomplete="family-name" placeholder="Dela Cruz"></label></div>
  <div class="rolepick" role="radiogroup"><label class="rp"><input type="radio" name="lrole" value="guest"${role==="host"?"":" checked"}><span><b>${esc(t('l.rent'))}</b><small>${esc(t('l.rents'))}</small></span></label><label class="rp"><input type="radio" name="lrole" value="host"${role==="host"?" checked":""}><span><b>${esc(t('l.list'))}</b><small>${esc(t('l.lists'))}</small></span></label></div>
  <p class="err" id="lerr" role="alert"></p>
  <button type="button" class="btn" data-lgo="facebook">${esc(t('l.fb'))}</button><button type="button" class="btn ghost" data-lgo="google">${esc(t('l.g'))}</button>
  <button type="button" class="chip" data-lgo="admin" style="justify-self:start">${esc(t('l.admin'))}</button></div>`;
  if(!ldlg.open)ldlg.showModal();
}
function doLogin(provider){
  let fnv=$('#lfn').value.trim(),lnv=$('#lln').value.trim();if(provider==='admin'&&!fnv&&!lnv){fnv='Arkila';lnv='Admin'}let name=(fnv+' '+lnv).trim();const wantHost=(document.querySelector('input[name="lrole"]:checked')||{}).value==='host';
  if(fnv.length<2||lnv.length<2){$('#lerr').textContent=t(fnv.length<2?'e.fname':'e.lname');mark(fnv.length<2?$('#lfn'):$('#lln'));return}
  const id=(provider==='admin'?'admin':provider)+':'+slug(name);let u=ST.users.find(x=>x.id===id);
  if(!u){u={id,name,first:fnv,last:lnv,provider,roles:['guest'],createdAt:Date.now()};ST.users.push(u)}
  if(u.suspended){$('#lerr').textContent='This account is suspended. Please contact Arkila.';return}
  if(provider==='admin'&&!has(u,'admin'))u.roles.push('admin');
  if(wantHost&&!has(u,'host'))u.roles.push('host');
  ST.sid=id;ST.save();{const fl=provider==='admin'?['','']:userFL(u);$('#fn').value=fl[0];$('#ln').value=fl[1]}ldlg.close();renderNav();toast(t('l.in',{n:first(name)}));
  if(wantHost)location.hash='host';else if(provider==='admin')location.hash='admin';else route();
  refreshHome();
}
ldlg.addEventListener('click',e=>{if(e.target===ldlg||e.target.closest('[data-lclose]'))ldlg.close();const g=e.target.closest('[data-lgo]');if(g)doLogin(g.dataset.lgo)});

/* ---- owner ---- */
const HF={photos:[],err:'',place:null};
const HCAL=new Set();
function hostDay(id,s){const me=ST.me(),l=me&&ST.listings.find(x=>x.id===id&&x.ownerId===me.id);if(!l)return;const k=dayInfo(id,s);if(k==='booked'||k==='arkila')return;const arr=ST.blocks[id]||(ST.blocks[id]=[]),i=arr.indexOf(s);if(i>=0)arr.splice(i,1);else arr.push(s);if(!arr.length)delete ST.blocks[id];ST.save();refreshHome()}
const COLORS=[['#A9B3C0','Silver'],['#1F2933','Black'],['#D6DBE2','White'],['#2E86DE','Blue'],['#C0392B','Red'],['#3E6B4E','Green'],['#7D8794','Grey']];
function readImg(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const sc=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.72))};im.onerror=rej;im.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}
function hostSteps(){return `<section class="step"><h2>How a booking works for you</h2><ol class="rules"><li>Arkila checks the renter's licence and ID.</li><li>Arkila asks you to confirm the vehicle is free for the dates. Reply within [2 hours] or the request lapses.</li><li>The renter agrees to the renter notice and pays Arkila online. Arkila confirms the booking and blocks the dates on your calendar.</li><li>You and the renter complete Arkila's handover checklist at pickup, with dated photos.</li><li>Arkila pays you the rental fee, less its fee, 24 hours after pickup if the renter reports no problem.</li><li>The renter's deposit stays with Arkila. If you report damage within [24 hours] of return, the claimed amount stays held until it is settled.</li></ol></section>`}
function renderHost(){
  const me=ST.me(),el=$('#v-host');
  if(!has(me,'host')){el.innerHTML=`<h1>Earn from your vehicle</h1><p class="lead">List a car, van or motorbike. Arkila handles the renter checks, the paperwork and the payment. The renter pays Arkila online up front, and Arkila pays you after the handover, less its fee.</p>${hostSteps()}<button class="btn" data-becomehost>List your vehicle</button>`;trFil(el);return}
  const mine=ST.listings.filter(l=>l.ownerId===me.id),reqs=ST.requests.filter(r=>r.hostId===me.id);
  el.innerHTML=`<h1>Owner dashboard</h1><p class="lead">New vehicles are checked by the Arkila team before renters can see them.</p>${ownDash(me.id,false)}${hostSteps()}
  <section class="step"><h2>Your vehicles</h2>${mine.length?mine.map(l=>{const k=l.status==='approved'&&l.active===false?'paused':l.status;return `<div class="lrow"><div class="lthumb">${imgsOf(l)[0]}</div><div class="lmain"><b>${esc(l.name)}</b> ${pill(k)}<p class="sub">${esc(l.type)} · ${l.seats} ${l.kind==='motor'?'riders':'seats'} · ${esc(l.service)} · ${esc(l.area)} · ${php(l.price)}/day</p></div><div class="row2" style="gap:6px"><button class="chip" data-open="${esc(l.id)}">View</button>${l.status==='approved'?`<button class="chip" data-hcal="${esc(l.id)}">${HCAL.has(l.id)?'Hide calendar':'Calendar'}</button><button class="chip" data-hpause="${esc(l.id)}">${l.active===false?'Resume':'Pause'}</button>`:''}<button class="chip" data-hdel="${esc(l.id)}">Delete</button></div></div>${l.status==='approved'?`<div class="calwrap">${HCAL.has(l.id)?`<div class="cal" id="cal-h-${esc(l.id)}" data-key="h-${esc(l.id)}" data-car="${esc(l.id)}" data-mode="host">${calInner('h-'+l.id,l.id,'host')}</div><p class="note">Tap a free day to block it, tap again to unblock. Booked days update by themselves when Arkila confirms a booking.</p>`:''}</div>`:''}`}).join(''):'<div class="empty">No vehicles yet. Add your first one below.</div>'}</section>
  <section class="step"><h2>Add a vehicle</h2><form class="form" id="hf" novalidate>
    <label><span class="lab">Category</span><select id="hk"><option value="car">Car, van or pickup</option><option value="motor">Motorbike or scooter</option></select></label>
    <label class="req"><span class="lab">Vehicle name</span><input id="hn" placeholder="Toyota Vios 2021"></label>
    <div class="f2"><label class="req"><span class="lab">Type</span><select id="ht"><option value="">Select…</option>${['Sedan','Hatchback','SUV','Van','Pickup'].map(t=>`<option>${t}</option>`).join('')}</select></label>
    <label class="req"><span class="lab" id="hsl">Seats</span><input id="hs" type="number" min="1" max="20" placeholder="5"></label></div>
    <div class="f2"><label class="req"><span class="lab">Service</span><select id="hv"><option value="">Select…</option><option>Self-drive</option><option>With driver</option></select></label>
    <div class="ppick req"><span class="lab" id="hpl-l">Pickup location</span><div class="ppw"><input id="hpl" role="combobox" aria-labelledby="hpl-l" aria-expanded="false" aria-controls="hpop" autocomplete="off" placeholder="Search a town, airport or place" value="${esc(HF.place?HF.place.n:'')}"><div class="ppop" id="hpop" role="listbox" hidden></div></div><p class="note" id="hpn" style="margin:4px 0 0">${HF.place?'Pinned: '+esc(HF.place.n)+(HF.place.s?', '+esc(HF.place.s):''):'Pick one from the list so renters can find you on the map.'}</p></div></div>
    <div class="f2"><label class="req"><span class="lab">Price per day (PHP)</span><input id="hp" type="number" min="300" step="50" placeholder="1800"></label>
    <label class="req"><span class="lab">Color</span><select id="hc"><option value="">Select…</option>${COLORS.map(c=>`<option value="${c[0]}">${c[1]}</option>`).join('')}</select></label></div>
    <label class="req"><span class="lab">Price per extra hour (PHP)</span><input id="hph" type="number" min="1" step="10" placeholder="Usually about ${Math.round(XRATE*100)}% of the daily price"></label>
    <label class="req"><span class="lab">Description (at least 20 characters)</span><textarea id="hd" rows="4" maxlength="600" placeholder="Tell renters about the vehicle: its condition, what is included, and tips for the trip"></textarea></label>
    <div class="f2"><label class="req"><span class="lab">Year</span><input id="hy" type="number" min="1995" max="2030" placeholder="2021"></label>
    <label class="ca req"><span class="lab">Luggage (bags)</span><input id="hb" type="number" min="0" max="20" placeholder="3"></label>
    <label class="mo req" hidden><span class="lab">Engine size (cc)</span><input id="hcc" type="number" min="50" max="2000" placeholder="125"></label></div>
    <div class="f2"><label class="req"><span class="lab">Transmission</span><select id="hm"><option value="">Select…</option><option>Automatic</option><option>Manual</option></select></label>
    <label class="req"><span class="lab">Fuel</span><select id="hfu"><option value="">Select…</option><option>Gasoline</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></label></div>
    <div class="f2 mo" hidden><label class="req"><span class="lab">Helmets included</span><input id="hhel" type="number" min="0" max="2" placeholder="2"></label>
</div>
    <label class="req"><span class="lab">Security deposit (PHP), paid to Arkila and refunded to the renter</span><input id="hsd" type="number" min="0" step="500" placeholder="5000"></label>
    <label class="mo req" hidden><span class="lab">Daily distance limit</span><input id="hmi" placeholder="150 km/day, or Unlimited"></label>
    <label><span class="lab">Features (separate with commas)</span><input id="hft" placeholder="Air conditioning, Bluetooth audio, USB charging"></label>
    <label><span class="lab">Photos (up to 4)</span><input id="hphoto" type="file" accept="image/*" multiple></label>
    <p class="muted" style="margin:4px 0 0;font-size:12px">Only upload photos you took or have permission to use.</p>
    <div class="thumbs" id="hthumbs"></div>
    <label class="ck"><input type="checkbox" id="hack"><span>I have read and agree to the <button type="button" class="lnk" data-notice="host">owner declaration</button> and the <a href="#terms" target="_blank" rel="noopener">Terms of Service</a>, and I understand Arkila holds the booking money and pays me after the handover.</span></label>
    <p class="err" id="herr" role="alert"></p><button class="btn" type="submit">Submit for approval</button></form></section>
  <section class="step"><h2>Requests for your vehicles</h2>${reqs.length?reqs.map(r=>`<div class="lrow"><div class="lmain"><b>${esc(r.carName)}</b> ${pill(r.status)}<p class="sub">${dr(r)} · ${r.days} day${r.days>1?'s':''} · ${php(r.total)} · ${esc(r.id)}</p><p class="sub">Guest: ${esc(first(r.guestName))}${(r.status==='confirmed'||r.status==='completed')?` · ${esc(r.guestPhone)}${r.guestEmail?' · '+esc(r.guestEmail):''}`:' · contact shared once the deposit is received'}</p>${r.status==='new'&&r.avail==='yes'?'<p class="sub">You confirmed the dates. Waiting for the renter to pay.</p>':''}</div>${r.status==='new'&&!r.avail?`<div class="row2" style="gap:6px"><button class="chip on" data-rav="${esc(r.id)}|yes">Dates are free</button><button class="chip" data-rav="${esc(r.id)}|no">Decline</button></div>`:''}</div>`).join(''):'<div class="empty">No requests yet.</div>'}</section>`;
  renderHthumbs();trFil(el);
}
/* ---- owner: pickup location search (same local list + Photon as the Where box) ---- */
let HPT=0;
function hPlaces(raw){
  const q=norm(raw.trim()),loc=q?localPlaces().filter(x=>norm(x.n).includes(q)||norm(x.s||'').includes(q)):localPlaces().slice(0,8),have=new Set(loc.map(x=>norm(x.n)));
  return {loc:loc.slice(0,6),web:(PH_CACHE[q]||[]).filter(x=>!have.has(norm(x.n)))};
}
function hRender(){
  const pop=$('#hpop'),inp=$('#hpl');if(!pop||!inp)return;const raw=inp.value,q=norm(raw.trim()),r=hPlaces(raw);
  const row=(x,i,k)=>`<button type="button" role="option" class="ppo" data-hpick="${k}:${i}"><b>${esc(x.n)}</b><small>${esc(x.s||'')}</small></button>`;
  let h=r.loc.map((x,i)=>row(x,i,'l')).join('')+r.web.map((x,i)=>row(x,i,'w')).join('');
  if(q.length>=3&&PH_CACHE[q]===undefined)h+='<p class="note" style="margin:8px 10px">Searching all of Palawan…</p>';
  else if(q.length>=3&&!r.loc.length&&!r.web.length)h='<p class="note" style="margin:8px 10px">No match. Try the nearest town.</p>';
  pop.innerHTML=h;pop.hidden=!h;inp.setAttribute('aria-expanded',String(!!h));pop._r=r;
}
function hSearch(raw){
  const q=norm(raw.trim());clearTimeout(HPT);if(q.length<3||PH_CACHE[q]!==undefined)return;
  HPT=setTimeout(()=>{fetch('https://photon.komoot.io/api/?limit=7&lang=en&lat=9.74&lon=118.73&bbox=116.9,8.2,120.6,12.6&q='+encodeURIComponent(raw.trim()))
    .then(r=>r.ok?r.json():Promise.reject()).then(j=>{PH_CACHE[q]=(j.features||[]).filter(f=>f.properties&&f.properties.countrycode==='PH'&&f.geometry).map(f=>{const p=f.properties;return {n:p.name||p.street||'',s:[p.district||p.city||p.county,p.state].filter(x=>x&&x!==p.name).join(', '),p:[f.geometry.coordinates[1],f.geometry.coordinates[0]]}}).filter(x=>x.n);if(norm($('#hpl')&&$('#hpl').value.trim())===q)hRender()})
    .catch(()=>{PH_CACHE[q]=[];if($('#hpl')&&norm($('#hpl').value.trim())===q)hRender()})},350);
}
document.addEventListener('input',e=>{if(e.target.id!=='hpl')return;HF.place=null;$('#hpn').textContent='Pick one from the list so renters can find you on the map.';hRender();hSearch(e.target.value)});
document.addEventListener('focusin',e=>{if(e.target.id==='hpl')hRender()});
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-hpick]');
  if(b){const [k,i]=b.dataset.hpick.split(':'),pop=$('#hpop'),x=(k==='l'?pop._r.loc:pop._r.web)[+i];if(x){HF.place={n:x.n,s:x.s,p:x.p.slice()};$('#hpl').value=x.n;$('#hpn').textContent='Pinned: '+x.n+(x.s?', '+x.s:'');pop.hidden=true;$('#hpl').setAttribute('aria-expanded','false')}return}
  if(!e.target.closest('.ppick')){const p=$('#hpop');if(p)p.hidden=true}
});
function renderHthumbs(){const t=$('#hthumbs');if(t)t.innerHTML=HF.photos.map((p,i)=>`<div class="th on" style="position:relative"><img src="${p}" alt="Photo ${i+1}"><button type="button" class="chip" data-hrm="${i}" style="position:absolute;right:2px;top:2px;padding:0 7px">×</button></div>`).join('')}
const KIND_OPTS={car:{types:['Sedan','Hatchback','SUV','Van','Pickup'],trans:['Automatic','Manual'],seats:[5,20,'Seats'],ph:'Toyota Vios 2021'},motor:{types:['Scooter','Underbone','Mid-size','Big bike'],trans:['Automatic','Semi-automatic','Manual'],seats:[2,2,'Riders'],ph:'Honda Click 125i'}};
function hostKind(){
  const k=$('#hk').value,o=KIND_OPTS[k];const dp=$('#hsd');if(dp)dp.placeholder=SETTINGS.deposit[k==='motor'?'motor':'car'];
  $('#ht').innerHTML='<option value="">Select…</option>'+o.types.map(t=>`<option>${t}</option>`).join('');$('#hm').innerHTML='<option value="">Select…</option>'+o.trans.map(t=>`<option>${t}</option>`).join('');
  $('#hs').max=o.seats[1];$('#hs').value='';$('#hs').placeholder=o.seats[0];$('#hsl').textContent=o.seats[2];$('#hn').placeholder=o.ph;
  document.querySelectorAll('#hf .mo').forEach(e=>e.hidden=k!=='motor');document.querySelectorAll('#hf .ca').forEach(e=>e.hidden=k==='motor');
  $('#hp').placeholder=k==='motor'?'600':'1800';
}
async function addHostListing(){
  const me=ST.me(),v=id=>$('#'+id).value.trim(),err=$('#herr');err.textContent='';
  const name=v('hn'),price=+v('hp'),seats=+v('hs'),mo=v('hk')==='motor',hourly=+v('hph'),year=+v('hy'),dep=v('hsd');
  const bad=(id,m)=>{err.textContent=X(m);mark($('#'+id));return true};
  if(name.length<3){bad('hn','Add the vehicle name.');return}
  if(!v('ht')){bad('ht','Choose the vehicle type.');return}
  if(!(seats>=1)||(mo&&seats>2)){bad('hs',mo?'Riders must be 1 or 2.':'Enter the number of seats.');return}
  if(!v('hv')){bad('hv','Choose self-drive or with driver.');return}
  if(!HF.place){err.textContent=X('Search and pick the pickup location from the list.');mark($('#hpl'));return}
  if(!(price>=300)){bad('hp','Enter a price per day, at least ₱300.');return}
  if(!v('hc')){bad('hc','Choose the color.');return}
  if(!(hourly>=1)){bad('hph','Enter the price per extra hour.');return}
  if(hourly>price){bad('hph','The extra hour price must be less than the daily price.');return}
  if(v('hd').length<20){bad('hd','Add a description of at least 20 characters.');return}
  if(!(year>=1995&&year<=2030)){bad('hy','Enter the year (1995 to 2030).');return}
  if(!mo&&v('hb')===''){bad('hb','Enter how many bags fit.');return}
  if(mo&&!(+v('hcc')>=50)){bad('hcc','Enter the engine size in cc.');return}
  if(!v('hm')){bad('hm','Choose the transmission.');return}
  if(!v('hfu')){bad('hfu','Choose the fuel.');return}
  if(mo&&v('hhel')===''){bad('hhel','Enter how many helmets are included (0 to 2).');return}
  if(mo&&!v('hmi')){bad('hmi','Enter the daily distance limit, or Unlimited.');return}
  if(dep===''||!(+dep>=0)){bad('hsd','Enter the security deposit (0 or more).');return}
  if(!$('#hack').checked){err.textContent=X('Tick the owner declaration to submit.');mark($('#hack'));return}
  const l={id:'u-'+Date.now().toString(36),kind:mo?'motor':'car',name,type:v('ht'),seats,service:v('hv'),area:HF.place.n,pos:HF.place.p,place:{n:HF.place.n,s:HF.place.s||''},price,hourly:Math.max(0,+v('hph')||0),color:v('hc'),active:true,description:v('hd'),
    specs:mo?{year:+v('hy')||'',transmission:v('hm'),cc:+v('hcc')||'',fuel:v('hfu'),helmets:Math.max(0,Math.min(2,+v('hhel')||0)),mileage:v('hmi')||'',deposit:Math.max(0,+v('hsd')||0)}:{year:+v('hy')||'',transmission:v('hm'),fuel:v('hfu'),bags:+v('hb')||0,aircon:'Yes',deposit:Math.max(0,+v('hsd')||0)},features:v('hft').split(',').map(s=>s.trim()).filter(Boolean),images:HF.photos.slice(),
    ownerId:me.id,ownerName:me.name,status:'pending',ack:{hostDeclaration:Date.now(),v:'2026-11-03'},createdAt:Date.now()};
  ST.listings.unshift(l);
  if(!ST.save()){ST.listings.shift();err.textContent='This device is out of storage for photos. Remove a photo or two and try again.';return}
  HF.photos=[];HF.place=null;toast('Submitted. The Arkila team will review it.');renderHost();
}
$('#v-host').addEventListener('click',e=>{
  const b=e.target.closest('[data-becomehost],[data-hpause],[data-hdel],[data-hrm],[data-hcal],[data-rav]');if(!b)return;const me=ST.me();
  if(b.dataset.rav){const [id,ans]=b.dataset.rav.split('|'),r=ST.requests.find(x=>x.id===id&&x.hostId===me.id);if(r&&r.status==='new'&&!r.avail){if(ans==='yes'){r.avail='yes';r.availAt=Date.now();toast(X('Dates confirmed'))}else{r.status='declined';r.declinedAt=Date.now();toast(X('Request declined'))}ST.save();renderHost();renderNav()}return}
  if(b.dataset.becomehost!==undefined){if(!has(me,'host'))me.roles.push('host');ST.save();renderNav();renderHost()}
  else if(b.dataset.hpause){const l=ST.listings.find(x=>x.id===b.dataset.hpause&&x.ownerId===me.id);if(l){l.active=l.active===false;ST.save();renderHost();refreshHome()}}
  else if(b.dataset.hdel){if(b.dataset.armed){ST.listings=ST.listings.filter(x=>!(x.id===b.dataset.hdel&&x.ownerId===me.id));ST.save();renderHost();refreshHome()}else{b.dataset.armed='1';b.textContent='Tap again to delete'}}
  else if(b.dataset.hcal){const k=b.dataset.hcal;if(HCAL.has(k))HCAL.delete(k);else HCAL.add(k);renderHost()}
  else if(b.dataset.hrm!==undefined){HF.photos.splice(+b.dataset.hrm,1);renderHthumbs()}
});
$('#v-host').addEventListener('submit',e=>{if(e.target.id==='hf'){e.preventDefault();addHostListing()}});
$('#v-host').addEventListener('change',async e=>{
  if(e.target.id==='hk'){hostKind();return}
  if(e.target.id!=='hphoto')return;const files=[...e.target.files].slice(0,4-HF.photos.length);
  for(const f of files){try{HF.photos.push(await readImg(f))}catch(x){toast('Could not read that photo.')}}
  e.target.value='';renderHthumbs();
});

/* ---- guest trips ---- */
function renderTrips(){
  const me=ST.me(),mine=ST.requests.filter(r=>r.guestId===me.id);
  $('#v-trips').innerHTML=`<h1>${esc(t('tr.t'))}</h1><p class="lead">${esc(t('tr.lead'))}</p>`+(mine.length?mine.map(r=>`<section class="step"><div class="row2"><h2>${esc(r.carName)}</h2>${pill(r.status)}</div><p class="sub" style="margin:0">${dr(r).replace(' to ',' → ')} · ${esc(t('tr.days',{d:r.days}))} · ${esc(r.id)}</p>
    <div class="q"><div><span>${esc(t('tr.total'))}</span><span>${esc(money(r.total))}</span></div><div><span>${esc(t('tr.dep'))}</span><span>${esc(money(r.deposit))}</span></div><div class="t"><span>${esc(t('tr.pay'))}</span><span>${esc(money(r.total+r.deposit))}</span></div></div>
    ${r.status==='new'||r.status==='confirmed'?`<div class="stack"><button class="btn ghost danger" data-cancelreq="${esc(r.id)}">${esc(t('tr.cancel'))}</button></div>`:''}${r.status==='cancelled'||r.status==='declined'?`<div class="stack"><button class="btn ghost danger" data-delreq="${esc(r.id)}">${esc(t('tr.del'))}</button></div>`:''}
    ${r.status==='declined'?`<p class="note">${esc(t('tr.declined'))}</p>`:''}${r.status==='new'&&r.avail==='yes'?`<div class="ok" style="background:color-mix(in srgb,var(--good) 12%,var(--surface));border:1px solid var(--good);border-radius:12px;padding:10px 14px">${esc(t('tr.avail'))}</div>`:''}
    ${r.status==='new'?`<p class="note">${esc(t('tr.send'))}</p>${r.guestEmail?`<p class="note">${esc(t('tr.mail',{email:r.guestEmail}))}</p>`:''}<div class="stack"><button class="btn ghost" data-copyreq="${esc(r.id)}">${esc(t('tr.copy'))}</button></div>`:''}
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
let ADLIM=100,ADT='dashboard',ADFLT='all',ADQ='',ADS={k:'',d:1},ADSEL=new Set();
const ADTABS=[['dashboard','Dashboard'],['overview','Tasks'],['vehicles','Vehicles'],['bookings','Bookings'],['users','Users'],['payouts','Payouts'],['settings','Settings']];
const commOf=r=>Math.round(r.total*SETTINGS.commission),ownerGets=r=>r.total-commOf(r);
const csvCell=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
const toCSV=rows=>'﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');
function parseCSV(text){
  text=String(text||'').replace(/^﻿/,'');const rows=[];let row=[],cur='',q=false;
  for(let i=0;i<text.length;i++){const ch=text[i];
    if(q){if(ch==='"'){if(text[i+1]==='"'){cur+='"';i++}else q=false}else cur+=ch}
    else if(ch==='"')q=true;
    else if(ch===','){row.push(cur);cur=''}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cur);cur='';if(row.some(x=>x.trim()!==''))rows.push(row);row=[]}
    else cur+=ch}
  row.push(cur);if(row.some(x=>x.trim()!==''))rows.push(row);return rows}
const lkind=l=>l.status==='approved'&&l.active===false?'paused':l.status;
const D8=ts=>iso(new Date(ts||Date.now()));
/* table definitions: one place describes the columns, filters, bulk actions and CSV of each tab */
function adDef(tab){
  const me=ST.me()||{},acts=(a)=>`<div class="ract">${a}</div>`,b=(attr,label,on)=>`<button class="chip${on?' on':''}" ${attr}>${label}</button>`;
  if(tab==='vehicles')return{name:'vehicles',id:l=>l.id,rows:()=>ST.listings,
    filters:[['all','All'],['pending','Waiting'],['approved','Live'],['rejected','Not approved'],['paused','Paused']],fit:(l,f)=>f==='all'||lkind(l)===f,
    cols:[{h:'Vehicle',v:l=>`<b>${esc(l.name)}</b><small>${esc(l.id)}</small>`,s:l=>l.name.toLowerCase(),c:l=>l.name},
      {h:'Type',v:l=>esc(l.type),s:l=>l.type,c:l=>l.type},{h:'Area',v:l=>esc(l.area),s:l=>l.area,c:l=>l.area},
      {h:'Price/day',v:l=>php(l.price),s:l=>l.price,c:l=>l.price,num:1},{h:'Status',v:l=>pill(lkind(l)),s:l=>lkind(l),c:l=>lkind(l)},
      {h:'Owner',v:l=>esc(l.ownerName),s:l=>(l.ownerName||'').toLowerCase(),c:l=>l.ownerName},{h:'Added',v:l=>fmt(D8(l.createdAt)),s:l=>l.createdAt||0,c:l=>D8(l.createdAt)}],
    extra:[['id',l=>l.id],['kind',l=>l.kind],['seats',l=>l.seats],['service',l=>l.service],['deposit',l=>(l.specs&&l.specs.deposit)||''],['lat',l=>l.pos?l.pos[0]:''],['lng',l=>l.pos?l.pos[1]:''],['color',l=>l.color||''],['description',l=>l.description||''],['features',l=>(l.features||[]).join('; ')],['year',l=>(l.specs&&l.specs.year)||''],['transmission',l=>(l.specs&&l.specs.transmission)||'']],
    act:l=>{const k=lkind(l);return acts(`<button class="chip" data-open="${esc(l.id)}">View</button>${k==='pending'?b(`data-lapp="${esc(l.id)}"`,'Approve',1)+b(`data-lrej="${esc(l.id)}"`,'Reject'):''}${k==='rejected'?b(`data-lapp="${esc(l.id)}"`,'Approve',1):''}${k==='approved'?b(`data-lact="${esc(l.id)}|pause"`,'Pause'):''}${k==='paused'?b(`data-lact="${esc(l.id)}|resume"`,'Resume',1):''}${b(`data-ldel="${esc(l.id)}"`,'Delete')}`)},
    bulk:[['approve','Approve'],['reject','Reject'],['pause','Pause'],['resume','Resume'],['delete','Delete']]};
  if(tab==='bookings')return{name:'bookings',id:r=>r.id,rows:()=>ST.requests,
    filters:[['all','All'],['new','Requested'],['confirmed','Paid'],['completed','Completed'],['cancelled','Cancelled'],['declined','Declined']],fit:(r,f)=>f==='all'||r.status===f,
    cols:[{h:'Booking',v:r=>`<b>${esc(r.id)}</b><small>${esc(r.carName)}</small>`,s:r=>r.id,c:r=>r.id},{h:'Vehicle',v:r=>esc(r.carName),s:r=>r.carName,c:r=>r.carName},
      {h:'Guest',v:r=>`${esc(r.guestName)}<small>${esc(r.guestPhone||'')}</small>`,s:r=>(r.guestName||'').toLowerCase(),c:r=>r.guestName},
      {h:'Pickup',v:r=>fmt(r.from)+(r.time?`<small>${tl(r.time)}</small>`:''),s:r=>r.from+(r.time||''),c:r=>r.from},{h:'Return',v:r=>fmt(r.to),s:r=>r.to,c:r=>r.to},
      {h:'Rental',v:r=>php(r.total),s:r=>r.total,c:r=>r.total,num:1},{h:'Deposit',v:r=>php(r.deposit),s:r=>r.deposit,c:r=>r.deposit,num:1},
      {h:'Status',v:r=>pill(r.status)+(r.status==='new'?`<small>${r.avail==='yes'?'owner confirmed':'owner pending'}</small>`:''),s:r=>r.status,c:r=>r.status},{h:'Owner',v:r=>esc(r.hostName),s:r=>(r.hostName||'').toLowerCase(),c:r=>r.hostName}],
    extra:[['pickup_time',r=>r.time||''],['extra_hours',r=>r.extraH||0],['extra_fee',r=>r.extraFee||0],['days',r=>r.days],['guest_phone',r=>r.guestPhone],['guest_email',r=>r.guestEmail],['pickup_spot',r=>r.spot||''],['created',r=>D8(r.createdAt)]],
    act:r=>acts(`${r.status==='new'?b(`data-rset="${esc(r.id)}|confirmed"`,'Payment received',1):''}${r.status==='confirmed'?b(`data-rset="${esc(r.id)}|completed"`,'Mark completed',1):''}${(r.status==='new'||r.status==='confirmed')?b(`data-rset="${esc(r.id)}|cancelled"`,'Cancel'):''}${b(`data-rdel="${esc(r.id)}"`,'Delete')}`),
    bulk:[['confirmed','Payment received'],['completed','Mark completed'],['cancelled','Cancel'],['delete','Delete']]};
  if(tab==='users')return{name:'users',id:u=>u.id,rows:()=>ST.users,
    filters:[['all','All'],['admin','Admins'],['host','Owners'],['suspended','Suspended']],fit:(u,f)=>f==='all'||(f==='suspended'?!!u.suspended:has(u,f)),
    cols:[{h:'Name',v:u=>`<b>${esc(u.name)}</b>${u.id===me.id?' (you)':''}<small>${esc(u.id)}</small>`,s:u=>u.name.toLowerCase(),c:u=>u.name},{h:'Login',v:u=>esc(u.provider||'demo'),s:u=>u.provider||'',c:u=>u.provider},
      {h:'Roles',v:u=>(has(u,'admin')?'<span class="pill b">Admin</span>':'')+(has(u,'host')?'<span class="pill g">Owner</span>':'')+(u.suspended?'<span class="pill r">Suspended</span>':'')||'Renter',s:u=>u.roles.join(),c:u=>u.roles.join(' ')+(u.suspended?' suspended':'')},
      {h:'Vehicles',v:u=>ST.listings.filter(l=>l.ownerId===u.id).length,s:u=>ST.listings.filter(l=>l.ownerId===u.id).length,c:u=>ST.listings.filter(l=>l.ownerId===u.id).length,num:1},
      {h:'Requests',v:u=>ST.requests.filter(r=>r.guestId===u.id).length,s:u=>ST.requests.filter(r=>r.guestId===u.id).length,c:u=>ST.requests.filter(r=>r.guestId===u.id).length,num:1},
      {h:'Joined',v:u=>fmt(D8(u.createdAt)),s:u=>u.createdAt||0,c:u=>D8(u.createdAt)}],
    extra:[['email',u=>u.email||''],['phone',u=>u.phone||'']],
    act:u=>u.id===me.id?'':acts(`${has(u,'host')?b(`data-ownview="${esc(u.id)}"`,'Dashboard'):''}${b(`data-uadm="${esc(u.id)}"`,has(u,'admin')?'Remove admin':'Make admin')}${b(`data-usus="${esc(u.id)}"`,u.suspended?'Reactivate':'Suspend')}${b(`data-udel="${esc(u.id)}"`,'Delete')}`),
    bulk:[['makeadmin','Make admin'],['rmadmin','Remove admin'],['suspend','Suspend'],['reactivate','Reactivate'],['delete','Delete']],skip:u=>u.id===me.id};
  if(tab==='payouts')return{name:'payouts',id:r=>r.id,rows:()=>ST.requests.filter(r=>r.status==='confirmed'||r.status==='completed'),
    filters:[['all','All'],['owe','Owner unpaid'],['paid','Owner paid'],['held','Deposit held'],['back','Deposit returned']],fit:(r,f)=>f==='all'||(f==='owe'?!r.paid:f==='paid'?!!r.paid:f==='held'?!r.depBack:!!r.depBack),
    cols:[{h:'Booking',v:r=>`<b>${esc(r.id)}</b><small>${esc(r.carName)}</small>`,s:r=>r.id,c:r=>r.id},{h:'Owner',v:r=>esc(r.hostName),s:r=>(r.hostName||'').toLowerCase(),c:r=>r.hostName},
      {h:'Pickup',v:r=>fmt(r.from)+(r.time?`<small>${tl(r.time)}</small>`:''),s:r=>r.from,c:r=>r.from},{h:'Payout due',v:r=>fmt(addD(r.from,1)),s:r=>r.from,c:r=>addD(r.from,1)},
      {h:'Rental',v:r=>php(r.total),s:r=>r.total,c:r=>r.total,num:1},{h:'Commission',v:r=>php(commOf(r)),s:r=>commOf(r),c:r=>commOf(r),num:1},{h:'Owner gets',v:r=>`<b>${php(ownerGets(r))}</b>`,s:r=>ownerGets(r),c:r=>ownerGets(r),num:1},
      {h:'Deposit',v:r=>php(r.deposit),s:r=>r.deposit,c:r=>r.deposit,num:1},{h:'Owner paid',v:r=>r.paid?'<span class="pill g">Paid</span>':'<span class="pill w">To pay</span>',s:r=>r.paid?1:0,c:r=>r.paid?'yes':'no'},
      {h:'Deposit',v:r=>r.depBack?'<span class="pill g">Returned</span>':'<span class="pill w">Held</span>',s:r=>r.depBack?1:0,c:r=>r.depBack?'returned':'held'}],extra:[],
    act:r=>acts(`${b(`data-rpay="${esc(r.id)}"`,r.paid?'Undo payout':'Mark owner paid',!r.paid)}${b(`data-rdep="${esc(r.id)}"`,r.depBack?'Undo deposit':'Deposit returned',!r.depBack)}`),
    bulk:[['paid','Mark owner paid'],['unpaid','Undo owner paid'],['depback','Deposit returned'],['depheld','Undo deposit']]};
  return null}
function adRows(def){
  const q=ADQ.trim().toLowerCase();let rows=def.rows().filter(r=>def.fit(r,ADFLT));
  if(q)rows=rows.filter(r=>def.cols.some(c=>String(c.c(r)==null?'':c.c(r)).toLowerCase().includes(q))||String(def.id(r)).toLowerCase().includes(q));
  if(ADS.k!==''){const c=def.cols[+ADS.k];if(c)rows=rows.slice().sort((a,b)=>{const x=c.s(a),y=c.s(b);return (x>y?1:x<y?-1:0)*ADS.d})}
  return rows}
function adTable(){
  const def=adDef(ADT);if(!def)return;const rows=adRows(def),box=$('#adtbl');if(!box)return;
  const ids=new Set(def.rows().map(def.id));ADSEL.forEach(i=>{if(!ids.has(i))ADSEL.delete(i)});
  const all=rows.length&&rows.every(r=>ADSEL.has(def.id(r)));
  box.innerHTML=`${ADSEL.size?`<div class="bulkbar"><b>${ADSEL.size} selected</b>${def.bulk.map(x=>`<button type="button" class="chip${x[0]==='delete'?'':' on'}" data-adbulk="${x[0]}">${x[1]}</button>`).join('')}<button type="button" class="chip" data-adclr>Clear</button></div>`:''}
  <div class="tw"><table class="at"><thead><tr><th class="ck"><input type="checkbox" data-adall aria-label="Select all"${all?' checked':''}></th>${def.cols.map((c,i)=>`<th${c.num?' class="num"':''}><button type="button" data-adsort="${i}">${c.h}${ADS.k===String(i)?(ADS.d>0?' ▲':' ▼'):''}</button></th>`).join('')}<th></th></tr></thead>
  <tbody>${rows.length?rows.slice(0,ADLIM).map(r=>{const id=def.id(r),sk=def.skip&&def.skip(r);return `<tr class="${ADSEL.has(id)?'sel':''}"><td class="ck">${sk?'':`<input type="checkbox" data-adck="${esc(id)}"${ADSEL.has(id)?' checked':''} aria-label="Select ${esc(id)}">`}</td>${def.cols.map(c=>`<td${c.num?' class="num"':''}>${c.v(r)}</td>`).join('')}<td class="ra">${def.act(r)}</td></tr>`}).join(''):`<tr><td colspan="${def.cols.length+2}" class="emp">Nothing here.</td></tr>`}</tbody></table></div>
  <p class="note">${Math.min(rows.length,ADLIM)} of ${def.rows().length} shown${ADQ?' for "'+esc(ADQ)+'"':''}.${rows.length>ADLIM?' <button type="button" class="chip" data-admore>Show 100 more</button>':''}</p>`;
}
function renderAdmin(){
  const pend=ST.listings.filter(l=>l.status==='pending'),rs=ST.requests,booked=rs.filter(r=>r.status==='confirmed'||r.status==='completed');
  const val=booked.reduce((s,r)=>s+r.total,0);
  const head=`<h1>Arkila admin</h1><p class="lead">Backoffice for vehicles, bookings, users and payouts. Search, sort, bulk edit and CSV in and out. Only admin logins can open this screen.</p>
  <div class="chips adtabs" role="tablist">${ADTABS.map(x=>`<button type="button" class="chip" role="tab" data-adtab="${x[0]}" aria-pressed="${ADT===x[0]}">${x[1]}${x[0]==='vehicles'&&pend.length?` (${pend.length})`:''}</button>`).join('')}</div>`;
  let body='';
  if(ADT==='dashboard'){body=adDash()}
  else if(ADT==='ownerdash'){body=ownDash(ADOWN,true)}
  else if(ADT==='overview'){
    const liveN=ST.listings.filter(l=>l.status==='approved'&&l.active!==false).length,due=booked.filter(r=>r.status==='completed'&&!r.paid),soon=booked.filter(r=>r.status==='confirmed'&&r.from<=addD(todayIso(),2)&&r.from>=todayIso()),payReq=rs.filter(r=>r.status==='new'&&r.avail==='yes');
    const item=(txt,tab,btn)=>`<div class="lrow"><div class="lmain">${txt}</div><button class="chip on" data-adtab="${tab}">${btn}</button></div>`;
    const todo=[pend.length?item(`<b>${pend.length}</b> vehicle${pend.length>1?'s':''} waiting for approval`,'vehicles','Review'):'',payReq.length?item(`<b>${payReq.length}</b> request${payReq.length>1?'s':''} where the owner confirmed the dates. Waiting for the renter to pay`,'bookings','Open'):'',soon.length?item(`<b>${soon.length}</b> paid pickup${soon.length>1?'s':''} in the next 2 days`,'bookings','Open'):'',due.length?item(`<b>${due.length}</b> completed trip${due.length>1?'s':''} with the owner payout still to send`,'payouts','Open'):''].join('');
    body=`<div class="stats"><div class="stat"><span>Users</span><b>${ST.users.length}</b></div><div class="stat"><span>Owners</span><b>${ST.users.filter(u=>has(u,'host')).length}</b></div><div class="stat"><span>Live vehicles</span><b>${liveN+CARS.length}</b></div><div class="stat"><span>Waiting approval</span><b>${pend.length}</b></div><div class="stat"><span>Requests</span><b>${rs.length}</b></div><div class="stat"><span>Paid bookings</span><b>${booked.length}</b></div><div class="stat"><span>Booking value</span><b>${php(val)}</b></div><div class="stat"><span>Commission (${Math.round(SETTINGS.commission*100)}%)</span><b>${php(val*SETTINGS.commission)}</b></div></div>
    <section class="step"><h2>Needs your attention</h2>${todo||'<div class="empty">All clear.</div>'}</section>
    <section class="step"><h2>CSV</h2><p class="note" style="margin:0 0 8px">Export any list to open in Excel or Google Sheets. Vehicles can also be imported in bulk.</p><div class="chips"><button class="chip" data-adexp="vehicles">Export vehicles</button><button class="chip" data-adexp="bookings">Export bookings</button><button class="chip" data-adexp="users">Export users</button><button class="chip" data-adexp="payouts">Export payouts</button><button class="chip on" data-adimp>Import vehicles</button></div></section>
    <section class="step"><h2>Latest requests</h2>${rs.slice(0,5).map(r=>`<div class="lrow"><div class="lmain"><b>${esc(r.carName)}</b> ${pill(r.status)}<p class="sub">${esc(r.id)} · ${dr(r)} · ${php(r.total)} · ${esc(r.guestName)}</p></div></div>`).join('')||'<div class="empty">No requests yet.</div>'}</section>`;
  }else if(ADT==='settings'){
    const row=(k,v)=>`<div class="lrow"><div class="lmain"><b>${esc(k)}</b><p class="sub">${esc(typeof v==='object'?JSON.stringify(v):String(v)||'not set')}</p></div></div>`;
    body=`<section class="step"><h2>Settings</h2><p class="note" style="margin:0 0 8px">These come from config.js. Change them there and re-upload the file. The real site will get editable settings in Phase 2.</p>${Object.entries(SETTINGS).map(([k,v])=>row(k,v)).join('')}<h2 style="margin-top:16px">Brand</h2>${Object.entries(BRAND).map(([k,v])=>row(k,v===''?'not set':v)).join('')}</section>
    <section class="step"><h2>Test load</h2><p class="note" style="margin:0 0 8px">Fills the site with about 40 owners, 60 renters, 120 vehicles and 600 bookings over the past year so you can see the dashboards. Demo records are tagged and removed by Clear. Real records are never touched. Now loaded: ${dmDemoCount().users} users, ${dmDemoCount().listings} vehicles, ${dmDemoCount().requests} bookings.</p><div class="chips"><button class="chip on" data-demoload>${dmDemoCount().requests?'Reload':'Load'} demo data</button>${dmDemoCount().requests?'<button class="chip" data-democlear>Clear demo data</button>':''}</div></section>
    <section class="step"><h2>Backup</h2><p class="note" style="margin:0 0 8px">Download everything saved on this device (accounts, vehicles, bookings, reviews) as one file. Restore it later or on another device.</p><div class="chips"><button class="chip on" data-bkdl>Download backup</button><button class="chip" data-bkrs>Restore from file</button></div><input type="file" id="bkin" accept="application/json,.json" hidden></section>
    <section class="step"><h2>Reset</h2><p class="note">Clears every account, vehicle and request saved on this device.</p><button class="chip" data-areset>Reset demo data</button></section>`;
  }else{
    const def=adDef(ADT);
    body=`<div class="adbar"><input id="adq" type="search" placeholder="Search ${def.name}" value="${esc(ADQ)}" aria-label="Search"><div class="chips">${def.filters.map(f=>`<button type="button" class="chip" data-adf="${f[0]}" aria-pressed="${ADFLT===f[0]}">${f[1]}</button>`).join('')}</div><div class="chips"><button type="button" class="chip" data-adexp="${def.name}">Export CSV</button>${ADT==='vehicles'?'<button type="button" class="chip on" data-adimp>Import CSV</button>':''}</div></div><div id="adtbl"></div>`;
  }
  $('#v-admin').innerHTML=head+body;if(!['dashboard','ownerdash','overview','settings'].includes(ADT))adTable();
}
/* ---- CSV dialogs ---- */
const xdlg=$('#xdlg');
function adExport(name){
  const def=adDef(name);if(!def)return;const rows=adRows(def);
  let head=def.cols.map(c=>c.h).concat(def.extra.map(x=>x[0])),body=rows.map(r=>def.cols.map(c=>c.c(r)).concat(def.extra.map(x=>x[1](r))));
  if(name==='vehicles'){/* same columns as the import, so an export can be edited and imported back */
    const G={id:l=>l.id,name:l=>l.name,kind:l=>l.kind,type:l=>l.type,seats:l=>l.seats,service:l=>l.service,area:l=>l.area,lat:l=>l.pos?l.pos[0]:'',lng:l=>l.pos?l.pos[1]:'',price:l=>l.price,hourly:l=>hourlyOf(l),deposit:l=>(l.specs&&l.specs.deposit!=null)?l.specs.deposit:'',color:l=>l.color||'',description:l=>l.description||'',features:l=>(l.features||[]).join('; '),year:l=>(l.specs&&l.specs.year)||'',transmission:l=>(l.specs&&l.specs.transmission)||'',fuel:l=>(l.specs&&l.specs.fuel)||'',bags:l=>(l.specs&&l.specs.bags!=null)?l.specs.bags:'',cc:l=>(l.specs&&l.specs.cc)||'',helmets:l=>(l.specs&&l.specs.helmets!=null)?l.specs.helmets:'',distance:l=>(l.specs&&l.specs.mileage)||'',status:l=>l.status,owner:l=>l.ownerName||''};
    head=IMPCOLS;body=rows.map(r=>IMPCOLS.map(k=>G[k](r)))}
  const csv=toCSV([head].concat(body));
  const file='arkila-'+name+'-'+todayIso()+'.csv';
  $('#xbody').innerHTML=`<h2 id="xtitle">Export ${name}</h2><p class="note">${rows.length} row${rows.length===1?'':'s'}${ADQ||ADFLT!=='all'?' (current search and filter)':''}. Open the file in Excel or Google Sheets.</p><textarea class="xta" readonly rows="8" id="xta">${esc(csv.replace(/^﻿/,''))}</textarea><div class="crow"><button type="button" class="lnk" data-xcopy>Copy</button><button type="button" class="btn" data-xdl="${esc(file)}">Download ${esc(file)}</button></div><p class="note" id="xnote"></p>`;
  xdlg.dataset.csv=csv;if(!xdlg.open)xdlg.showModal()}
const IMPCOLS=['id','name','kind','type','seats','service','area','lat','lng','price','hourly','deposit','color','description','features','year','transmission','fuel','bags','cc','helmets','distance','status','owner'];
const IMPEX=[['','Toyota Vios 2021','car','Sedan',5,'Self-drive','City Proper','','',1800,360,5000,'#C0392B','Clean and cool. Good for a family trip around the city.','Air conditioning; Bluetooth audio',2021,'Automatic','Gasoline',3,'','','','approved','Arkila'],['','Honda Click 125i','motor','Scooter',2,'Self-drive','Sabang','10.1578','118.8369',600,120,2000,'#2E86DE','Easy to ride, light on fuel, good for the coast road.','Helmet included',2022,'Automatic','Gasoline','',125,2,'Unlimited','approved','Arkila']];
let IMPPLAN=[];
function adImportOpen(){
  $('#xbody').innerHTML=`<h2 id="xtitle">Import vehicles from CSV</h2><p class="note">Upload a file or paste rows. Columns: ${IMPCOLS.join(', ')}. Leave <b>id</b> empty to add a new vehicle, or use an existing id to update it. Features are separated with a semicolon. Area can be one of ${Object.keys(AREAS).join(', ')}, or any name with lat and lng.</p>
  <div class="crow" style="justify-content:flex-start;gap:8px;flex-wrap:wrap"><label class="chip" style="cursor:pointer">Choose file<input type="file" id="xfile" accept=".csv,text/csv" hidden></label><button type="button" class="chip" data-xtpl>Use the template</button></div>
  <textarea class="xta" id="xin" rows="8" placeholder="Paste CSV here"></textarea><div id="xprev"></div><div class="crow"><button type="button" class="lnk" data-xcheck>Check</button><button type="button" class="btn" id="xgo" data-xgo disabled>Import</button></div>`;
  IMPPLAN=[];if(!xdlg.open)xdlg.showModal()}
function adImportCheck(){
  const rows=parseCSV($('#xin').value),prev=$('#xprev'),go=$('#xgo');IMPPLAN=[];go.disabled=true;
  if(rows.length<2){prev.innerHTML='<p class="err">Add a header row and at least one vehicle.</p>';return}
  const head=rows[0].map(h=>h.trim().toLowerCase()),ix=k=>head.indexOf(k),errs=[];
  ['name','kind','type','seats','service','area','price','hourly','deposit','description','year','transmission','fuel'].forEach(k=>{if(ix(k)<0)errs.push('Missing column: '+k)});if(errs.length){prev.innerHTML=errs.map(e=>`<p class="err">${esc(e)}</p>`).join('');return}
  const motorT=KIND_OPTS.motor.types,carT=KIND_OPTS.car.types;let add=0,upd=0;
  rows.slice(1).forEach((r,n)=>{
    const g=k=>{const i=ix(k);return i<0?'':String(r[i]==null?'':r[i]).trim()},line='Row '+(n+2)+': ',e=[];
    const name=g('name'),price=+g('price'),type=g('type'),kind=g('kind').toLowerCase();
    if(name.length<3)e.push('name needs 3+ letters');if(!(price>=300))e.push('price must be 300 or more');
    if(kind!=='car'&&kind!=='motor')e.push('kind is required: car or motor');
    const tl2=(kind==='motor'?motorT:carT),tt=tl2.find(x=>x.toLowerCase()===type.toLowerCase());if(!tt)e.push('type is required, one of '+tl2.join(', '));
    const seats=+g('seats');if(!(seats>=1))e.push('seats is required');else if(kind==='motor'&&seats>2)e.push('riders must be 1 or 2');
    const hourly=+g('hourly');if(!(hourly>=1))e.push('hourly (extra hour price) is required');else if(hourly>price)e.push('hourly must be less than the daily price');
    if(g('description').length<20)e.push('description is required (20+ characters)');
    const yr=+g('year');if(!(yr>=1995&&yr<=2030))e.push('year is required (1995 to 2030)');
    const trl=(kind==='motor'?KIND_OPTS.motor:KIND_OPTS.car).trans,tr=trl.find(x=>x.toLowerCase()===g('transmission').toLowerCase());if(!tr)e.push('transmission is required, one of '+trl.join(', '));
    const FUELS=['Gasoline','Diesel','Hybrid','Electric'],fu=FUELS.find(x=>x.toLowerCase()===g('fuel').toLowerCase());if(!fu)e.push('fuel is required, one of '+FUELS.join(', '));
    if(kind==='car'&&g('bags')==='')e.push('bags is required for cars');
    if(kind==='motor'){if(!(+g('cc')>=50))e.push('cc is required for motorbikes');if(g('helmets')===''||!(+g('helmets')>=0&&+g('helmets')<=2))e.push('helmets is required (0 to 2)');if(!g('distance'))e.push('distance is required (for example Unlimited)')}
    if(g('deposit')===''||!(+g('deposit')>=0))e.push('deposit is required (0 or more)');
    const area=g('area');let pos=null;const ak=Object.keys(AREAS).find(a=>a.toLowerCase()===area.toLowerCase());
    if(ak)pos=AREAS[ak].slice();else if(g('lat')&&g('lng')&&!isNaN(+g('lat'))&&!isNaN(+g('lng')))pos=[+g('lat'),+g('lng')];
    if(!area)e.push('area is required');else if(!pos)e.push('area "'+area+'" needs lat and lng');
    const svc=g('service');if(svc!=='Self-drive'&&svc!=='With driver')e.push('service is required: Self-drive or With driver');
    const st=(g('status')||'approved').toLowerCase();if(!['approved','pending','rejected'].includes(st))e.push('status must be approved, pending or rejected');
    const id=g('id'),ex=id?ST.listings.find(l=>l.id===id):null;if(id&&!ex)e.push('id "'+id+'" not found (leave empty to add)');
    if(e.length){errs.push(line+e.join('; '));return}
    const dep=Math.max(0,+g('deposit')||0),mo=kind==='motor';
    const l={id:ex?ex.id:'u-'+Date.now().toString(36)+n,kind,name,type:tt,seats,service:svc,area:ak||area,pos,place:{n:ak||area,s:''},price,hourly:Math.round(hourly),color:g('color')||'#2E86DE',active:true,description:g('description'),
      specs:mo?{year:yr,transmission:tr,cc:+g('cc'),fuel:fu,helmets:+g('helmets'),mileage:g('distance'),deposit:dep}:{year:yr,transmission:tr,fuel:fu,bags:+g('bags'),aircon:'Yes',deposit:dep},
      features:g('features').split(';').map(s=>s.trim()).filter(Boolean),images:ex?ex.images||[]:[],ownerId:ex?ex.ownerId:'arkila',ownerName:g('owner')||(ex?ex.ownerName:'Arkila'),status:st,createdAt:ex?ex.createdAt:Date.now()};
    if(ex)upd++;else add++;IMPPLAN.push({l,ex});
  });
  prev.innerHTML=`<p class="note"><b>${IMPPLAN.length}</b> ready (${add} new, ${upd} updated)${errs.length?', <b>'+errs.length+'</b> with problems':''}.</p>${errs.slice(0,8).map(e=>`<p class="err" style="margin:2px 0">${esc(e)}</p>`).join('')}${errs.length>8?`<p class="note">…and ${errs.length-8} more.</p>`:''}`;
  go.disabled=!IMPPLAN.length;go.textContent=IMPPLAN.length?`Import ${IMPPLAN.length} vehicle${IMPPLAN.length>1?'s':''}`:'Import'}
xdlg.addEventListener('click',e=>{
  if(e.target===xdlg||e.target.closest('[data-xclose]')){xdlg.close();return}
  const dl=e.target.closest('[data-xdl]');
  if(dl){try{const u=URL.createObjectURL(new Blob([xdlg.dataset.csv||''],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download=dl.dataset.xdl;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);$('#xnote').textContent='If nothing downloaded, use Copy and paste into a spreadsheet.'}catch(x){$('#xnote').textContent='Download is not available here. Use Copy and paste into a spreadsheet.'}return}
  if(e.target.closest('[data-xcopy]')){const t0=$('#xta');t0.select();(navigator.clipboard?navigator.clipboard.writeText(t0.value):Promise.reject()).then(()=>toast('Copied.')).catch(()=>{try{document.execCommand('copy');toast('Copied.')}catch(x){toast('Select the text and copy.')}});return}
  if(e.target.closest('[data-xtpl]')){$('#xin').value=toCSV([IMPCOLS].concat(IMPEX)).replace(/^﻿/,'');adImportCheck();return}
  if(e.target.closest('[data-xcheck]')){adImportCheck();return}
  if(e.target.closest('[data-xgo]')){if(!IMPPLAN.length)return;const n=IMPPLAN.length;IMPPLAN.forEach(p=>{if(p.ex){const i=ST.listings.indexOf(p.ex);ST.listings[i]=Object.assign({},p.ex,p.l)}else ST.listings.unshift(p.l)});ST.save();IMPPLAN=[];xdlg.close();ADT='vehicles';ADFLT='all';ADQ='';renderAdmin();refreshHome();toast(n+' vehicle'+(n>1?'s':'')+' imported.');return}
});
xdlg.addEventListener('change',e=>{if(e.target.id==='xfile'&&e.target.files[0]){const fr=new FileReader();fr.onload=()=>{$('#xin').value=String(fr.result||'');adImportCheck()};fr.readAsText(e.target.files[0])}});
/* ---- admin actions ---- */
function adApply(tab,act,ids){
  const me=ST.me();let n=0;
  ids.forEach(id=>{
    if(tab==='vehicles'){const l=ST.listings.find(x=>x.id===id);if(!l)return;n++;
      if(act==='approve'){l.status='approved';delete l.active}else if(act==='reject')l.status='rejected';else if(act==='pause'){if(l.status==='approved')l.active=false}else if(act==='resume')l.active=true}
    else if(tab==='bookings'){const r=ST.requests.find(x=>x.id===id);if(!r)return;n++;r.status=act}
    else if(tab==='users'){const u=ST.users.find(x=>x.id===id);if(!u||(me&&u.id===me.id))return;n++;
      if(act==='makeadmin'&&!has(u,'admin'))u.roles.push('admin');else if(act==='rmadmin')u.roles=u.roles.filter(r=>r!=='admin');else if(act==='suspend')u.suspended=true;else if(act==='reactivate')u.suspended=false}
    else if(tab==='payouts'){const r=ST.requests.find(x=>x.id===id);if(!r)return;n++;if(act==='paid')r.paid=true;else if(act==='unpaid')r.paid=false;else if(act==='depback')r.depBack=true;else if(act==='depheld')r.depBack=false}
  });
  ST.save();return n}
function adDelete(tab,ids){
  if(tab==='vehicles'){ST.listings=ST.listings.filter(x=>!ids.includes(x.id));ST.favs=ST.favs.filter(x=>!ids.includes(x))}
  else if(tab==='bookings')ST.requests=ST.requests.filter(x=>!ids.includes(x.id));
  else if(tab==='users'){const me=ST.me();ids=ids.filter(i=>!me||i!==me.id);ST.users=ST.users.filter(x=>!ids.includes(x.id));ST.listings=ST.listings.filter(x=>!ids.includes(x.ownerId))}
  ST.save();ADSEL.clear();renderAdmin();renderNav();refreshHome()}
$('#v-admin').addEventListener('input',e=>{if(e.target.id==='adq'){ADQ=e.target.value;adTable()}});
$('#v-admin').addEventListener('change',e=>{
  if(e.target.matches('[data-adck]')){e.target.checked?ADSEL.add(e.target.dataset.adck):ADSEL.delete(e.target.dataset.adck);adTable()}
  else if(e.target.matches('[data-adall]')){const def=adDef(ADT);adRows(def).forEach(r=>{const id=def.id(r);if(def.skip&&def.skip(r))return;e.target.checked?ADSEL.add(id):ADSEL.delete(id)});adTable()}});
$('#v-admin').addEventListener('click',e=>{
  const a=e.target.closest('[data-adtab],[data-adf],[data-adsort],[data-adbulk],[data-adclr],[data-adexp],[data-adimp],[data-lapp],[data-lrej],[data-lact],[data-ldel],[data-rset],[data-rdel],[data-rpay],[data-rdep],[data-uadm],[data-usus],[data-udel],[data-areset]');if(!a)return;
  const d=a.dataset,me=ST.me();
  if(d.adtab){ADLIM=100;ADT=d.adtab;ADFLT='all';ADQ='';ADS={k:'',d:1};ADSEL.clear();renderAdmin();window.scrollTo({top:0});return}
  if(d.adf){ADFLT=d.adf;ADSEL.clear();renderAdmin();return}
  if(d.adsort!==undefined){ADS=ADS.k===d.adsort?{k:d.adsort,d:-ADS.d}:{k:d.adsort,d:1};adTable();return}
  if(d.adclr!==undefined){ADSEL.clear();adTable();return}
  if(d.adexp){adExport(d.adexp);return}
  if(d.adimp!==undefined){adImportOpen();return}
  if(d.adbulk){const ids=[...ADSEL],act=d.adbulk;
    if(act==='delete'){confirmBox({title:'Delete '+ids.length+' selected?',text:'They will be removed for everyone. This cannot be undone.',go:'Delete',back:'Keep them',ok:()=>{adDelete(ADT,ids);toast('Deleted.')}});return}
    const n=adApply(ADT,act,ids);ADSEL.clear();renderAdmin();refreshHome();renderNav();toast(n+' updated.');return}
  if(d.areset){confirmBox({title:'Reset demo data?',text:'This clears every account, vehicle and request saved on this device. It cannot be undone.',go:'Reset everything',back:'Keep my data',ok:()=>{Object.keys(localStorage).filter(k=>k.startsWith('arkila2-')).forEach(k=>localStorage.removeItem(k));location.hash='home';location.reload()}});return}
  if(d.lapp||d.lrej){adApply('vehicles',d.lapp?'approve':'reject',[d.lapp||d.lrej]);toast(d.lapp?'Approved. It is now live.':'Rejected.')}
  else if(d.lact){const [id,act]=d.lact.split('|');adApply('vehicles',act,[id]);toast(act==='pause'?'Paused.':'Resumed.')}
  else if(d.ldel){const l=ST.listings.find(x=>x.id===d.ldel);if(l)confirmBox({title:'Delete this vehicle?',text:l.name+' will be removed from the site. Existing requests are kept.',go:'Delete vehicle',back:'Keep it',ok:()=>{adDelete('vehicles',[l.id]);toast('Vehicle deleted.')}});return}
  else if(d.rdel){confirmBox({title:'Delete this booking?',text:d.rdel+' will be removed for everyone. This cannot be undone.',go:'Delete booking',back:'Keep it',ok:()=>{adDelete('bookings',[d.rdel]);toast('Booking deleted.')}});return}
  else if(d.rpay){const r=ST.requests.find(x=>x.id===d.rpay);if(r){adApply('payouts',r.paid?'unpaid':'paid',[r.id]);toast(r.paid?'Marked as paid to the owner.':'Payout undone.')}}
  else if(d.rdep){const r=ST.requests.find(x=>x.id===d.rdep);if(r){adApply('payouts',r.depBack?'depheld':'depback',[r.id]);toast(r.depBack?'Deposit marked as returned.':'Deposit undone.')}}
  else if(d.uadm||d.usus||d.udel){const id=d.uadm||d.usus||d.udel,u=ST.users.find(x=>x.id===id);if(!u||(me&&u.id===me.id))return;
    if(d.uadm){adApply('users',has(u,'admin')?'rmadmin':'makeadmin',[id]);toast(has(u,'admin')?u.name+' is now an admin.':'Admin removed.')}
    else if(d.usus){adApply('users',u.suspended?'reactivate':'suspend',[id]);toast(u.suspended?'Account suspended.':'Account reactivated.')}
    else{confirmBox({title:'Delete this account?',text:u.name+' and their vehicles will be removed. Their past requests are kept.',go:'Delete account',back:'Keep it',ok:()=>{adDelete('users',[u.id]);toast('Account deleted.')}});return}}
  else if(d.rset){const [id,st]=d.rset.split('|');setReq(id,st)}
  renderAdmin();refreshHome();renderNav();
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
  else if(e.target.closest('[data-logout]')){closeMenu();ST.sid=null;ST.save();$('#fn').value='';$('#ln').value='';$('#phone').value='';$('#email').value='';renderNav();toast(t('l.out'));if(location.hash.slice(1)!=='home')location.hash='home';else route()}
});
function route(){
  const h=location.hash.slice(1),v=ROUTES.includes(h)?h:'home',me=ST.me();
  if(v!=='home'&&v!=='saved'&&v!=='terms'&&v!=='privacy'&&!me){history.replaceState(null,'','#home');openLogin(t('l.need'));return route()}
  if(v==='admin'&&!has(me,'admin')){location.hash='home';return}
  ROUTES.forEach(r=>{$('#v-'+r).hidden=r!==v});
  if(v==='home')refreshHome();else if(v==='saved')renderSaved();else if(v==='host')renderHost();else if(v==='trips')renderTrips();else if(v==='account')renderAccount();else if(v==='terms'||v==='privacy')renderLegal(v);else renderAdmin();
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
