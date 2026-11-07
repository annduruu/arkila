/* CSV tools shared by admin.html and owner.html: export requests and vehicles, import vehicles (admin only).
   Needs the page's open(), head(), toast(), esc(), ST, AREAS, V. Opens in the same side sheet as everything else. */
const csvCell=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
const toCSV=rows=>'﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');
function parseCSV(text){text=String(text||'').replace(/^﻿/,'');const rows=[];let row=[],cur='',q=false;
 for(let i=0;i<text.length;i++){const ch=text[i];
  if(q){if(ch==='"'){if(text[i+1]==='"'){cur+='"';i++}else q=false}else cur+=ch}
  else if(ch==='"')q=true;else if(ch===','){row.push(cur);cur=''}
  else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cur);cur='';if(row.some(x=>x.trim()!==''))rows.push(row);row=[]}
  else cur+=ch}
 row.push(cur);if(row.some(x=>x.trim()!==''))rows.push(row);return rows}
const csvToday=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
/* spreadsheet apps run text starting with = + - @ as a formula: prefix those so exported names can never execute */
const csvSafe=v=>typeof v==='string'&&/^[=+\-@\t\r]/.test(v)?"'"+v:v;
let CSVDATA='';
function csvSheet(title,note,rows,file){const csv=toCSV(rows.map((r,i)=>i?r.map(csvSafe):r));CSVDATA=csv;
 open(`${head(title)}<div class="sh-b"><p class="sub" style="margin:0 0 10px">${note}</p><textarea id="xta" readonly rows="9" style="width:100%;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:12px;padding:10px;font:12px/1.4 ui-monospace,Menlo,monospace">${esc(csv.replace(/^﻿/,''))}</textarea><p class="sub" id="xnote" style="margin:8px 0 0"></p></div><div class="sh-f"><button class="btn g" data-act="xcopy">Copy</button><button class="btn" data-act="xdl" data-arg="${esc(file)}">Download ${esc(file)}</button></div>`)}
const CSVA={
 xcopy:()=>{const n=document.getElementById('xnote');(navigator.clipboard?navigator.clipboard.writeText(CSVDATA.replace(/^﻿/,'')):Promise.reject()).then(()=>toast('Copied')).catch(()=>{const t=document.getElementById('xta');if(t){t.select();if(n)n.textContent='Press Ctrl+C (or long-press) to copy.'}})},
 xdl:file=>{const n=document.getElementById('xnote');try{const u=URL.createObjectURL(new Blob([CSVDATA],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download=file;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);if(n)n.textContent='If nothing downloaded, use Copy and paste into a spreadsheet.'}catch(e){if(n)n.textContent='Download is not available here. Use Copy and paste into a spreadsheet.'}}};
function exportRequests(list,mine){const rows=[['id','status','paid','guest','phone','email','vehicle','owner','from','to','days','extra_hours','pickup_time','pickup_area','pickup_address','pickup_pin','going_to','trip_note','total','arkila_fee','owner_gets','sent']];
 list.forEach(r=>{const x=r._r||r,fee=Math.round((+x.total||0)*SETTINGS.commission),st=x.status==='approved'?'confirmed':x.status==='rejected'?'declined':x.status;
  rows.push([x.id,st,x.paid?'yes':'no',x.guestName||'',x.guestPhone||'',x.guestEmail||'',x.carName||'',x.hostName||'',x.from,x.to,x.days,x.extraH||0,x.time||'',x.spot||'',tripOf(x).addr,tripOf(x).pin?tripOf(x).pin.join(','):'',tripDest(x).join('; '),tripOf(x).note,x.total,fee,(+x.total||0)-fee,x.createdAt?new Date(x.createdAt).toISOString().slice(0,10):''])});
 csvSheet('Export requests',rows.length-1+' request'+(rows.length===2?'':'s')+(mine?' (yours)':'')+', current search and filter. Open in Excel or Google Sheets.',rows,'arkila-requests-'+csvToday()+'.csv')}
const VCOLS=['id','name','kind','type','seats','service','area','lat','lng','price','color','description','features','year','transmission','fuel','bags','cc','helmets','status','owner'];
function vehicleRow(l){const s=l.specs||{};return [l.id,l.name,l.kind==='motor'?'motor':'car',l.type,l.seats,l.service,l.area,l.pos?l.pos[0]:'',l.pos?l.pos[1]:'',l.price,l.color||'',l.description||'',(l.features||[]).join('; '),s.year||'',s.transmission||'',s.fuel||'',s.bags!=null?s.bags:'',s.cc||'',s.helmets!=null?s.helmets:'',l.status||'approved',l.ownerName||'']}
function exportVehicles(list,mine){csvSheet('Export vehicles',list.length+' vehicle'+(list.length===1?'':'s')+(mine?' (yours)':'')+'. Same columns as the import, so you can edit the file and import it back.',[VCOLS].concat(list.map(vehicleRow)),'arkila-vehicles-'+csvToday()+'.csv')}
/* ---- import (admin) ---- */
const IMPEX=[['','Toyota Vios 2021','car','Sedan',5,'Self-drive','City Proper','','',1800,'#C0392B','Clean and cool. Good for a family trip around the city.','Air conditioning; Bluetooth audio',2021,'Automatic','Gasoline',3,'','','approved','Arkila'],['','Honda Click 125i','motor','Scooter',2,'Self-drive','Sabang','10.1578','118.8369',600,'#2E86DE','Easy to ride, light on fuel, good for the coast road.','Helmet included',2022,'Automatic','Gasoline','',125,2,'approved','Arkila']];
const CAR_T=['Hatchback','Sedan','SUV','Van','Pickup'],MOTOR_T=['Scooter','Underbone','Mid-size','Big bike'];
let IMPPLAN=[];
function importSheet(){IMPPLAN=[];
 open(`${head('Import vehicles')}<div class="sh-b"><p class="sub" style="margin:0 0 8px">Paste CSV rows. Columns: ${VCOLS.join(', ')}. Leave <b>id</b> empty to add, or use an existing id to update. Features are separated with a semicolon. Area is one of ${Object.keys(AREAS).join(', ')} (or any name with lat and lng).</p><div class="acts" style="justify-content:flex-start;margin-bottom:8px"><label class="btn g sm" style="cursor:pointer">Choose file<input type="file" id="xfile" accept=".csv,text/csv" hidden></label><button class="btn g sm" data-act="xtpl">Use the template</button></div><textarea id="xin" rows="8" placeholder="Paste CSV here" style="width:100%;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:12px;padding:10px;font:12px/1.4 ui-monospace,Menlo,monospace"></textarea><div id="xprev" style="margin-top:8px"></div></div><div class="sh-f"><button class="btn g" data-act="xcheck">Check</button><button class="btn" id="xgo" data-act="xgo" disabled>Import</button></div>`)}
function importCheck(){const rows=parseCSV(document.getElementById('xin').value),prev=document.getElementById('xprev'),go=document.getElementById('xgo');IMPPLAN=[];go.disabled=true;go.textContent='Import';
 const bad=m=>`<p style="color:var(--bad);margin:2px 0;font-size:13px">${esc(m)}</p>`;
 if(rows.length<2){prev.innerHTML=bad('Add a header row and at least one vehicle.');return}
 const head=rows[0].map(h=>h.trim().toLowerCase()),ix=k=>head.indexOf(k),errs=[];
 ['name','kind','type','seats','service','area','price'].forEach(k=>{if(ix(k)<0)errs.push('Missing column: '+k)});if(errs.length){prev.innerHTML=errs.map(bad).join('');return}
 let add=0,upd=0;const seen=new Set();
 rows.slice(1).forEach((r,n)=>{const g=k=>{const i=ix(k);return i<0?'':String(r[i]==null?'':r[i]).trim()},e=[];
  const name=g('name'),price=+g('price'),kind=g('kind').toLowerCase(),type=g('type'),seats=+g('seats');
  if(name.length<3)e.push('name needs 3+ letters');if(!(price>=300))e.push('price must be 300 or more');
  if(kind!=='car'&&kind!=='motor')e.push('kind must be car or motor');
  const tl=kind==='motor'?MOTOR_T:CAR_T,tt=tl.find(x=>x.toLowerCase()===type.toLowerCase());if(!tt)e.push('type must be one of '+tl.join(', '));
  if(!(seats>=1&&seats<=20))e.push('seats must be 1 to 20');else if(kind==='motor'&&seats>2)e.push('riders must be 1 or 2');
  const svc=g('service');if(svc!=='Self-drive'&&svc!=='With driver')e.push('service must be Self-drive or With driver');
  const area=g('area'),ak=Object.keys(AREAS).find(a=>a.toLowerCase()===area.toLowerCase());let pos=null;
  if(ak)pos=AREAS[ak].slice();else if(g('lat')&&g('lng')&&isFinite(+g('lat'))&&isFinite(+g('lng')))pos=[+g('lat'),+g('lng')];
  if(!area)e.push('area is required');else if(!pos)e.push('area "'+area+'" needs lat and lng');
  const st=(g('status')||'approved').toLowerCase();if(!['approved','pending','rejected'].includes(st))e.push('status must be approved, pending or rejected');
  const id=g('id'),ex=id?ST.listings.find(l=>l.id===id):null;if(id&&!ex)e.push('id "'+id+'" not found (leave empty to add)');if(id&&seen.has(id))e.push('id "'+id+'" appears twice');if(id)seen.add(id);
  const yr=g('year');if(yr&&!(+yr>=1995&&+yr<=2035))e.push('year looks wrong');
  if(e.length){errs.push('Row '+(n+2)+': '+e.join('; '));return}
  const mo=kind==='motor',sp=Object.assign({},ex&&ex.specs);if(yr)sp.year=+yr;if(g('transmission'))sp.transmission=g('transmission');if(g('fuel'))sp.fuel=g('fuel');
  if(mo){if(g('cc'))sp.cc=+g('cc');if(g('helmets')!=='')sp.helmets=+g('helmets')}else if(g('bags')!=='')sp.bags=+g('bags');
  const l=Object.assign({},ex||{},{id:ex?ex.id:'u-'+Date.now().toString(36)+n,name,type:tt,seats,service:svc,area:ak||area,pos,price,color:g('color')||(ex&&ex.color)||'#2E86DE',active:ex?ex.active!==false:true,description:g('description')||(ex&&ex.description)||'',specs:sp,features:g('features')?g('features').split(';').map(s=>s.trim()).filter(Boolean):(ex&&ex.features)||[],images:ex?ex.images||[]:[],ownerId:ex?ex.ownerId:'arkila',ownerName:g('owner')||(ex&&ex.ownerName)||'Arkila',status:st});
  if(mo)l.kind='motor';else delete l.kind;
  if(ex)upd++;else add++;IMPPLAN.push(l)});
 prev.innerHTML=`<p class="sub" style="margin:0 0 4px"><b>${IMPPLAN.length}</b> ready (${add} new, ${upd} updated)${errs.length?', <b>'+errs.length+'</b> with problems':''}.</p>${errs.slice(0,8).map(bad).join('')}${errs.length>8?`<p class="sub">...and ${errs.length-8} more.</p>`:''}`;
 go.disabled=!IMPPLAN.length;go.textContent=IMPPLAN.length?'Import '+IMPPLAN.length+' vehicle'+(IMPPLAN.length>1?'s':''):'Import'}
function importGo(){if(!IMPPLAN.length)return;const before=JSON.stringify(ST.listings);
 IMPPLAN.forEach(l=>{const i=ST.listings.findIndex(x=>x.id===l.id);if(i>=0)ST.listings[i]=l;else ST.listings.unshift(l)});
 if(!ST.save()){ST.listings=JSON.parse(before);toast('Could not save. Browser storage is full or blocked.');return}
 IMPPLAN.forEach(l=>{try{DB.pushListing(l)}catch(e){}});const n=IMPPLAN.length;IMPPLAN=[];return n}
Object.assign(CSVA,{xtpl:()=>{document.getElementById('xin').value=toCSV([VCOLS].concat(IMPEX)).replace(/^﻿/,'');importCheck()},xcheck:importCheck});
document.addEventListener('change',e=>{if(e.target.id!=='xfile')return;const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;if(f.size>2e6){toast('That file is too big.');return}
 const rd=new FileReader();rd.onload=()=>{document.getElementById('xin').value=String(rd.result||'').replace(/^﻿/,'');importCheck()};rd.onerror=()=>toast('Could not read that file.');rd.readAsText(f)});
