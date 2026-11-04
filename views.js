/* Login, owner, trips and admin screens. Demo only: no real Facebook or Google yet. */
const ROUTES=['home','saved','host','trips','account','admin','terms','privacy'];
const STATUS={new:['Requested','w'],confirmed:['Paid and confirmed','b'],completed:['Completed','g'],cancelled:['Cancelled','r'],declined:['Declined by owner','r'],pending:['Waiting for approval','w'],approved:['Live','g'],rejected:['Not approved','r'],paused:['Paused','']};
const dr=r=>r.time?fmt(r.from)+', '+tl(r.time)+' to '+fmt(r.to)+', '+tl(r.time):fmt(r.from)+' to '+fmt(r.to);
const pill=k=>{const s=STATUS[k]||[k,''];return `<span class="pill ${s[1]}">${esc(t('st.'+k)===('st.'+k)?s[0]:t('st.'+k))}</span>`};
const has=(u,r)=>!!(u&&u.roles.includes(r));
const first=n=>String(n||'').split(' ')[0];

/* ---- requests ---- */
function saveRequest(q,name,phone,notes,spot,msg,email){
  const me=ST.me();let id;do{id='REQ-'+(1000+Math.floor(Math.random()*9000))}while(ST.requests.some(r=>r.id===id));
  const r={id,carId:q.c.id,carName:q.c.name,hostId:q.c.ownerId,hostName:q.c.ownerName,guestId:me.id,guestName:name,guestPhone:phone,guestEmail:email||'',from:q.a,to:q.b,time:q.time||'',days:q.d,total:q.total,deposit:q.dep,spot,notes,msg,status:'new',ack:{renterNotice:Date.now(),v:'2026-11-03'},createdAt:Date.now()};
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
const ACF=[['name','Legal name','Your name as it appears on your driving licence.','text',2],['pname','Preferred first name','What owners call you on chat.','text',0],['email','Email','Used only for invoices and booking confirmations.','email',1],['phone','Mobile number','Include the country code, for example +639171234567.','tel',3],['addr','Home address','Where you live. Optional.','text',0],['emer','Emergency contact','Name and number of someone we can reach. Optional.','text',0]];
function acctVal(me,k){return k==='name'?me.name:(me[k]||'')}
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
  if(k==='name'&&val.length<2)m='Please enter your full name.';
  else if(k==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val))m='Please enter a valid email address.';
  else if(k==='phone'&&!/^\+?\d{8,15}$/.test(val.replace(/[\s-]/g,'')))m='Please enter a valid mobile number with the country code.';
  if(m){er.textContent=X(m);return}
  me[k]=k==='phone'?val.replace(/[\s-]/g,''):val;
  if(k==='name'||k==='email'||k==='phone'){const c=lsg('contact',{});lss('contact',Object.assign({},c&&typeof c==='object'&&!Array.isArray(c)?c:{},{name:me.name,phone:me.phone||(c&&c.phone)||'',email:me.email||(c&&c.email)||''}))}
  ST.save();ACE=null;renderNav();renderAccount();toast(X('Saved'));
});

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
  if(u.suspended){$('#lerr').textContent='This account is suspended. Please contact Arkila.';return}
  if(provider==='admin'&&!has(u,'admin'))u.roles.push('admin');
  if(wantHost&&!has(u,'host'))u.roles.push('host');
  ST.sid=id;ST.save();$('#name').value=(provider==='admin'?'':name);ldlg.close();renderNav();toast(t('l.in',{n:first(name)}));
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
  el.innerHTML=`<h1>Owner dashboard</h1><p class="lead">New vehicles are checked by the Arkila team before renters can see them.</p>${hostSteps()}
  <section class="step"><h2>Your vehicles</h2>${mine.length?mine.map(l=>{const k=l.status==='approved'&&l.active===false?'paused':l.status;return `<div class="lrow"><div class="lthumb">${imgsOf(l)[0]}</div><div class="lmain"><b>${esc(l.name)}</b> ${pill(k)}<p class="sub">${esc(l.type)} · ${l.seats} ${l.kind==='motor'?'riders':'seats'} · ${esc(l.service)} · ${esc(l.area)} · ${php(l.price)}/day</p></div><div class="row2" style="gap:6px"><button class="chip" data-open="${esc(l.id)}">View</button>${l.status==='approved'?`<button class="chip" data-hcal="${esc(l.id)}">${HCAL.has(l.id)?'Hide calendar':'Calendar'}</button><button class="chip" data-hpause="${esc(l.id)}">${l.active===false?'Resume':'Pause'}</button>`:''}<button class="chip" data-hdel="${esc(l.id)}">Delete</button></div></div>${l.status==='approved'?`<div class="calwrap">${HCAL.has(l.id)?`<div class="cal" id="cal-h-${esc(l.id)}" data-key="h-${esc(l.id)}" data-car="${esc(l.id)}" data-mode="host">${calInner('h-'+l.id,l.id,'host')}</div><p class="note">Tap a free day to block it, tap again to unblock. Booked days update by themselves when Arkila confirms a booking.</p>`:''}</div>`:''}`}).join(''):'<div class="empty">No vehicles yet. Add your first one below.</div>'}</section>
  <section class="step"><h2>Add a vehicle</h2><form class="form" id="hf" novalidate>
    <label><span class="lab">Category</span><select id="hk"><option value="car">Car, van or pickup</option><option value="motor">Motorbike or scooter</option></select></label>
    <label><span class="lab">Vehicle name</span><input id="hn" placeholder="Toyota Vios 2021"></label>
    <div class="f2"><label><span class="lab">Type</span><select id="ht">${['Sedan','Hatchback','SUV','Van','Pickup'].map(t=>`<option>${t}</option>`).join('')}</select></label>
    <label><span class="lab" id="hsl">Seats</span><input id="hs" type="number" min="1" max="20" value="5"></label></div>
    <div class="f2"><label><span class="lab">Service</span><select id="hv"><option>Self-drive</option><option>With driver</option></select></label>
    <div class="ppick"><span class="lab" id="hpl-l">Pickup location</span><div class="ppw"><input id="hpl" role="combobox" aria-labelledby="hpl-l" aria-expanded="false" aria-controls="hpop" autocomplete="off" placeholder="Search a town, airport or place" value="${esc(HF.place?HF.place.n:'')}"><div class="ppop" id="hpop" role="listbox" hidden></div></div><p class="note" id="hpn" style="margin:4px 0 0">${HF.place?'Pinned: '+esc(HF.place.n)+(HF.place.s?', '+esc(HF.place.s):''):'Pick one from the list so renters can find you on the map.'}</p></div></div>
    <div class="f2"><label><span class="lab">Price per day (PHP)</span><input id="hp" type="number" min="300" step="50" placeholder="1800"></label>
    <label><span class="lab">Color</span><select id="hc">${COLORS.map(c=>`<option value="${c[0]}">${c[1]}</option>`).join('')}</select></label></div>
    <label><span class="lab">Description</span><textarea id="hd" rows="4" maxlength="600" placeholder="Tell renters about the vehicle: its condition, what is included, and tips for the trip"></textarea></label>
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
  const k=$('#hk').value,o=KIND_OPTS[k];const dp=$('#hsd');if(dp&&!dp.dataset.t)dp.value=SETTINGS.deposit[k==='motor'?'motor':'car'];
  $('#ht').innerHTML=o.types.map(t=>`<option>${t}</option>`).join('');$('#hm').innerHTML=o.trans.map(t=>`<option>${t}</option>`).join('');
  $('#hs').max=o.seats[1];$('#hs').value=o.seats[0];$('#hsl').textContent=o.seats[2];$('#hn').placeholder=o.ph;
  document.querySelectorAll('#hf .mo').forEach(e=>e.hidden=k!=='motor');document.querySelectorAll('#hf .ca').forEach(e=>e.hidden=k==='motor');
  $('#hp').placeholder=k==='motor'?'600':'1800';
}
async function addHostListing(){
  const me=ST.me(),v=id=>$('#'+id).value.trim(),err=$('#herr');err.textContent='';
  const name=v('hn'),price=+v('hp'),seats=+v('hs');
  if(name.length<3){err.textContent=X('Add the vehicle name.');return}
  if(!HF.place){err.textContent=X('Search and pick the pickup location from the list.');return}
  if(!$('#hack').checked){err.textContent=X('Tick the owner declaration to submit.');return}
  if(!(price>=300)){err.textContent='Enter a price per day, at least ₱300.';return}
  const mo=v('hk')==='motor';
  if(!(seats>=1)||(mo&&seats>2)){err.textContent=mo?'Riders must be 1 or 2.':'Enter the number of seats.';return}
  const l={id:'u-'+Date.now().toString(36),kind:mo?'motor':'car',name,type:v('ht'),seats,service:v('hv'),area:HF.place.n,pos:HF.place.p,place:{n:HF.place.n,s:HF.place.s||''},price,color:v('hc'),active:true,description:v('hd'),
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
  if(e.target.id!=='hph')return;const files=[...e.target.files].slice(0,4-HF.photos.length);
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
let ADT='overview',ADF='all',ADV='all';
const ADTABS=[['overview','Overview'],['vehicles','Vehicles'],['bookings','Bookings'],['users','Users'],['payouts','Payouts'],['settings','Settings']];
const commOf=r=>Math.round(r.total*SETTINGS.commission),ownerGets=r=>r.total-commOf(r);
function renderAdmin(){
  const pend=ST.listings.filter(l=>l.status==='pending'),rs=ST.requests,booked=rs.filter(r=>r.status==='confirmed'||r.status==='completed');
  const val=booked.reduce((s,r)=>s+r.total,0),me=ST.me()||{};
  const head=`<h1>Arkila admin</h1><p class="lead">Everything in one place: vehicles, bookings, users and payouts. Only admin logins can open this screen.</p>
  <div class="chips adtabs" role="tablist">${ADTABS.map(x=>`<button type="button" class="chip" role="tab" data-adtab="${x[0]}" aria-pressed="${ADT===x[0]}">${x[1]}${x[0]==='vehicles'&&pend.length?` (${pend.length})`:''}</button>`).join('')}</div>`;
  let body='';
  if(ADT==='overview'){
    const liveN=ST.listings.filter(l=>l.status==='approved'&&l.active!==false).length,due=booked.filter(r=>r.status==='completed'&&!r.paid),soon=booked.filter(r=>r.status==='confirmed'&&r.from<=addD(todayIso(),2)&&r.from>=todayIso()),payReq=rs.filter(r=>r.status==='new'&&r.avail==='yes');
    const item=(txt,tab,btn)=>`<div class="lrow"><div class="lmain">${txt}</div><button class="chip on" data-adtab="${tab}">${btn}</button></div>`;
    const todo=[pend.length?item(`<b>${pend.length}</b> vehicle${pend.length>1?'s':''} waiting for approval`,'vehicles','Review'):'',payReq.length?item(`<b>${payReq.length}</b> request${payReq.length>1?'s':''} where the owner confirmed the dates. Waiting for the renter to pay`,'bookings','Open'):'',soon.length?item(`<b>${soon.length}</b> paid pickup${soon.length>1?'s':''} in the next 2 days`,'bookings','Open'):'',due.length?item(`<b>${due.length}</b> completed trip${due.length>1?'s':''} with the owner payout still to send`,'payouts','Open'):''].join('');
    body=`<div class="stats"><div class="stat"><span>Users</span><b>${ST.users.length}</b></div><div class="stat"><span>Owners</span><b>${ST.users.filter(u=>has(u,'host')).length}</b></div><div class="stat"><span>Live vehicles</span><b>${liveN+CARS.length}</b></div><div class="stat"><span>Waiting approval</span><b>${pend.length}</b></div><div class="stat"><span>Requests</span><b>${rs.length}</b></div><div class="stat"><span>Paid bookings</span><b>${booked.length}</b></div><div class="stat"><span>Booking value</span><b>${php(val)}</b></div><div class="stat"><span>Commission (${Math.round(SETTINGS.commission*100)}%)</span><b>${php(val*SETTINGS.commission)}</b></div></div>
    <section class="step"><h2>Needs your attention</h2>${todo||'<div class="empty">All clear.</div>'}</section>
    <section class="step"><h2>Latest requests</h2>${rs.slice(0,5).map(r=>`<div class="lrow"><div class="lmain"><b>${esc(r.carName)}</b> ${pill(r.status)}<p class="sub">${esc(r.id)} · ${dr(r)} · ${php(r.total)} · ${esc(r.guestName)}</p></div></div>`).join('')||'<div class="empty">No requests yet.</div>'}</section>`;
  }
  if(ADT==='vehicles'){
    const fl={all:'All',pending:'Waiting',approved:'Live',rejected:'Not approved',paused:'Paused'},kind=l=>l.status==='approved'&&l.active===false?'paused':l.status,list=ST.listings.filter(l=>ADV==='all'||kind(l)===ADV);
    body=`<div class="chips">${Object.keys(fl).map(k=>`<button type="button" class="chip" data-adv="${k}" aria-pressed="${ADV===k}">${fl[k]}</button>`).join('')}</div>
    <section class="step"><h2>Owner vehicles (${list.length})</h2>${list.length?list.map(l=>{const k=kind(l);return `<div class="lrow"><div class="lthumb">${imgsOf(l)[0]}</div><div class="lmain"><b>${esc(l.name)}</b> ${pill(k)}<p class="sub">${esc(l.type)} · ${l.seats} ${l.kind==='motor'?'riders':'seats'} · ${esc(l.area)} · ${php(l.price)}/day · owner ${esc(l.ownerName)}</p></div><div class="row2" style="gap:6px"><button class="chip" data-open="${esc(l.id)}">View</button>${k==='pending'?`<button class="chip on" data-lapp="${esc(l.id)}">Approve</button><button class="chip" data-lrej="${esc(l.id)}">Reject</button>`:''}${k==='rejected'?`<button class="chip on" data-lapp="${esc(l.id)}">Approve</button>`:''}${k==='approved'?`<button class="chip" data-lact="${esc(l.id)}|pause">Pause</button>`:''}${k==='paused'?`<button class="chip on" data-lact="${esc(l.id)}|resume">Resume</button>`:''}<button class="chip" data-ldel="${esc(l.id)}">Delete</button></div></div>`}).join(''):'<div class="empty">No vehicles here.</div>'}<p class="note">The ${CARS.length} sample vehicles come from config.js and are not listed here.</p></section>`;
  }
  if(ADT==='bookings'){
    const fl=['all','new','confirmed','completed','cancelled','declined'],list=rs.filter(r=>ADF==='all'||r.status===ADF);
    body=`<div class="chips">${fl.map(k=>`<button type="button" class="chip" data-adf="${k}" aria-pressed="${ADF===k}">${k==='all'?'All':(STATUS[k]||[k])[0]}</button>`).join('')}<button type="button" class="chip" data-adcsv>Export CSV</button></div>
    <section class="step"><h2>Bookings (${list.length})</h2>${list.length?list.map(r=>`<div class="lrow"><div class="lmain"><b>${esc(r.carName)}</b> ${pill(r.status)}<p class="sub">${esc(r.id)} · ${dr(r)} · ${php(r.total)} · deposit ${php(r.deposit)} · to pay ${php(r.total+r.deposit)}</p><p class="sub">Guest ${esc(r.guestName)} ${esc(r.guestPhone)}${r.guestEmail?' · '+esc(r.guestEmail):''} · owner ${esc(r.hostName)}${r.status==='new'?(r.avail==='yes'?' · owner confirmed dates':' · owner not confirmed yet'):''}${r.spot&&r.spot!=='not set'?' · pickup '+esc(r.spot.split(',')[0]):''}</p></div><div class="row2" style="gap:6px">${r.status==='new'?`<button class="chip on" data-rset="${esc(r.id)}|confirmed">Payment received</button>`:''}${r.status==='confirmed'?`<button class="chip on" data-rset="${esc(r.id)}|completed">Mark completed</button>`:''}${(r.status==='new'||r.status==='confirmed')?`<button class="chip" data-rset="${esc(r.id)}|cancelled">Cancel</button>`:''}<button class="chip" data-rdel="${esc(r.id)}">Delete</button></div></div>`).join(''):'<div class="empty">No bookings here.</div>'}</section>`;
  }
  if(ADT==='users'){
    body=`<section class="step"><h2>Users (${ST.users.length})</h2>${ST.users.length?ST.users.map(u=>{const self=u.id===me.id,nl=ST.listings.filter(l=>l.ownerId===u.id).length,nt=ST.requests.filter(r=>r.guestId===u.id).length;return `<div class="lrow"><div class="lmain"><b>${esc(u.name)}</b>${self?' (you)':''} ${has(u,'admin')?'<span class="pill b">Admin</span>':''}${has(u,'host')?'<span class="pill g">Owner</span>':''}${u.suspended?'<span class="pill r">Suspended</span>':''}<p class="sub">${esc(u.provider||'demo')} · joined ${fmt(iso(new Date(u.createdAt||Date.now())))} · ${nl} vehicle${nl===1?'':'s'} · ${nt} request${nt===1?'':'s'}${u.email?' · '+esc(u.email):''}${u.phone?' · '+esc(u.phone):''}</p></div>${self?'':`<div class="row2" style="gap:6px"><button class="chip" data-uadm="${esc(u.id)}">${has(u,'admin')?'Remove admin':'Make admin'}</button><button class="chip" data-usus="${esc(u.id)}">${u.suspended?'Reactivate':'Suspend'}</button><button class="chip" data-udel="${esc(u.id)}">Delete</button></div>`}</div>`}).join(''):'<div class="empty">No users yet.</div>'}</section>`;
  }
  if(ADT==='payouts'){
    const list=booked,owed=list.filter(r=>!r.paid&&r.status==='completed').reduce((s,r)=>s+ownerGets(r),0),held=list.filter(r=>!r.depBack).reduce((s,r)=>s+r.deposit,0);
    body=`<div class="stats"><div class="stat"><span>Owner payouts to send</span><b>${php(owed)}</b></div><div class="stat"><span>Deposits held</span><b>${php(held)}</b></div></div>
    <section class="step"><h2>Owner payouts and deposits</h2><p class="note" style="margin:0 0 8px">Owners are paid ${SETTINGS.commission?'the rental fee minus the '+Math.round(SETTINGS.commission*100)+'% commission':''} 24 hours after pickup. Deposits go back after the return check.</p>${list.length?list.map(r=>`<div class="lrow"><div class="lmain"><b>${esc(r.carName)}</b> ${pill(r.status)}${r.paid?'<span class="pill g">Owner paid</span>':''}${r.depBack?'<span class="pill g">Deposit returned</span>':''}<p class="sub">${esc(r.id)} · pickup ${fmt(r.from)}${r.time?', '+tl(r.time):''} · payout due ${fmt(addD(r.from,1))}</p><p class="sub">Owner ${esc(r.hostName)} gets ${php(ownerGets(r))} (rental ${php(r.total)} − commission ${php(commOf(r))}) · deposit ${php(r.deposit)}</p></div><div class="row2" style="gap:6px"><button class="chip${r.paid?'':' on'}" data-rpay="${esc(r.id)}">${r.paid?'Undo payout':'Mark owner paid'}</button><button class="chip${r.depBack?'':' on'}" data-rdep="${esc(r.id)}">${r.depBack?'Undo deposit':'Deposit returned'}</button></div></div>`).join(''):'<div class="empty">No paid bookings yet.</div>'}</section>`;
  }
  if(ADT==='settings'){
    const row=(k,v)=>`<div class="lrow"><div class="lmain"><b>${esc(k)}</b><p class="sub">${esc(typeof v==='object'?JSON.stringify(v):String(v)||'not set')}</p></div></div>`;
    body=`<section class="step"><h2>Settings</h2><p class="note" style="margin:0 0 8px">These come from config.js. Change them there and re-upload the file. The real site will get editable settings in Phase 2.</p>${Object.entries(SETTINGS).map(([k,v])=>row(k,v)).join('')}<h2 style="margin-top:16px">Brand</h2>${Object.entries(BRAND).map(([k,v])=>row(k,v===''?'not set':v)).join('')}</section>
    <section class="step"><h2>Demo data</h2><p class="note">Clears every account, vehicle and request saved on this device.</p><button class="chip" data-areset>Reset demo data</button></section>`;
  }
  $('#v-admin').innerHTML=head+body;
}
$('#v-admin').addEventListener('click',e=>{
  const a=e.target.closest('[data-adtab],[data-adf],[data-adv],[data-lapp],[data-lrej],[data-lact],[data-ldel],[data-rset],[data-rdel],[data-rpay],[data-rdep],[data-uadm],[data-usus],[data-udel],[data-adcsv],[data-areset]');if(!a)return;
  const d=a.dataset,me=ST.me();
  if(d.adtab){ADT=d.adtab;renderAdmin();window.scrollTo({top:0});return}
  if(d.adf){ADF=d.adf;renderAdmin();return}
  if(d.adv){ADV=d.adv;renderAdmin();return}
  if(d.adcsv){const rows=[['id','status','vehicle','guest','guest phone','guest email','owner','pickup date','return date','time','days','rental','deposit']].concat(ST.requests.map(r=>[r.id,r.status,r.carName,r.guestName,r.guestPhone,r.guestEmail,r.hostName,r.from,r.to,tl(r.time),r.days,r.total,r.deposit]));
    const csv=rows.map(x=>x.map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(',')).join('\n');try{const u=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),l=document.createElement('a');l.href=u;l.download='arkila-bookings.csv';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);toast('Exported.')}catch(x){toast('Could not export here.')}return}
  if(d.areset){confirmBox({title:'Reset demo data?',text:'This clears every account, vehicle and request saved on this device. It cannot be undone.',go:'Reset everything',back:'Keep my data',ok:()=>{Object.keys(localStorage).filter(k=>k.startsWith('arkila2-')).forEach(k=>localStorage.removeItem(k));location.hash='home';location.reload()}});return}
  if(d.lapp||d.lrej){const l=ST.listings.find(x=>x.id===(d.lapp||d.lrej));if(l){l.status=d.lapp?'approved':'rejected';if(d.lapp)delete l.active;ST.save();toast(d.lapp?'Approved. It is now live.':'Rejected.')}}
  else if(d.lact){const [id,act]=d.lact.split('|'),l=ST.listings.find(x=>x.id===id);if(l){l.active=act==='resume';ST.save();toast(act==='pause'?'Paused.':'Resumed.')}}
  else if(d.ldel){const l=ST.listings.find(x=>x.id===d.ldel);if(l){confirmBox({title:'Delete this vehicle?',text:l.name+' will be removed from the site. Existing requests are kept.',go:'Delete vehicle',back:'Keep it',ok:()=>{ST.listings=ST.listings.filter(x=>x.id!==l.id);ST.favs=ST.favs.filter(x=>x!==l.id);ST.save();renderAdmin();refreshHome();toast('Vehicle deleted.')}})}return}
  else if(d.rdel){confirmBox({title:'Delete this booking?',text:d.rdel+' will be removed for everyone. This cannot be undone.',go:'Delete booking',back:'Keep it',ok:()=>{ST.requests=ST.requests.filter(x=>x.id!==d.rdel);ST.save();renderAdmin();renderNav();refreshHome();toast('Booking deleted.')}});return}
  else if(d.rpay){const r=ST.requests.find(x=>x.id===d.rpay);if(r){r.paid=!r.paid;ST.save();toast(r.paid?'Marked as paid to the owner.':'Payout undone.')}}
  else if(d.rdep){const r=ST.requests.find(x=>x.id===d.rdep);if(r){r.depBack=!r.depBack;ST.save();toast(r.depBack?'Deposit marked as returned.':'Deposit undone.')}}
  else if(d.uadm||d.usus||d.udel){const id=d.uadm||d.usus||d.udel,u=ST.users.find(x=>x.id===id);if(!u||(me&&u.id===me.id))return;
    if(d.uadm){if(has(u,'admin'))u.roles=u.roles.filter(r=>r!=='admin');else u.roles.push('admin');ST.save();toast(has(u,'admin')?u.name+' is now an admin.':'Admin removed.')}
    else if(d.usus){u.suspended=!u.suspended;ST.save();toast(u.suspended?'Account suspended.':'Account reactivated.')}
    else{confirmBox({title:'Delete this account?',text:u.name+' and their vehicles will be removed. Their past requests are kept.',go:'Delete account',back:'Keep it',ok:()=>{ST.users=ST.users.filter(x=>x.id!==u.id);ST.listings=ST.listings.filter(x=>x.ownerId!==u.id);ST.save();renderAdmin();refreshHome();toast('Account deleted.')}});return}}
  else{const [id,st]=d.rset.split('|');setReq(id,st)}
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
  else if(e.target.closest('[data-logout]')){closeMenu();ST.sid=null;ST.save();$('#name').value='';$('#phone').value='';$('#email').value='';renderNav();toast(t('l.out'));if(location.hash.slice(1)!=='home')location.hash='home';else route()}
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
