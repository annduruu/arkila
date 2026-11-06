/* Availability calendar for the Blocked dates sheet (admin and owner). Tap a day to block or unblock it.
   Dark = blocked by you, striped = already booked (confirmed), light outline = a request still waiting. Needs ST, dayList(). */
let CALM=null;
const CALN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const isoOf=(y,m,d)=>y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
function calHtml(v,i){const t=new Date(),ty=t.getFullYear(),tm=t.getMonth(),td=isoOf(ty,tm,t.getDate());
 if(!CALM||CALM.id!==v.id)CALM={id:v.id,y:ty,m:tm};
 const {y,m}=CALM,first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate(),bl=new Set(ST.blocks[v.id]||[]),bk=new Set(),wt=new Set();
 ST.requests.filter(r=>r.carId===v.id&&r.from&&r.to).forEach(r=>{const s=['confirmed','approved','completed'].includes(r.status)?bk:r.status==='new'?wt:null;if(!s)return;dayList(r.from,r.to).forEach(d=>s.add(d))});
 let cells='';for(let k=0;k<first;k++)cells+='<i></i>';
 for(let d=1;d<=n;d++){const k=isoOf(y,m,d),past=k<td,cls=(bl.has(k)?'cb-bl ':'')+(bk.has(k)?'cb-bk ':'')+(wt.has(k)?'cb-wt ':'')+(k===td?'cb-td':'');
  cells+=`<button type="button" class="${cls}" ${past||bk.has(k)?'disabled':''} data-act="caltog" data-arg="${i}|${k}" aria-label="${k}${bl.has(k)?' blocked':bk.has(k)?' booked':''}">${d}</button>`}
 return `<div class="acal"><div class="ach"><button type="button" class="x" data-act="calnav" data-arg="${i}|-1" aria-label="Previous month">&lsaquo;</button><b>${CALN[m]} ${y}</b><button type="button" class="x" data-act="calnav" data-arg="${i}|1" aria-label="Next month">&rsaquo;</button></div><div class="acg">${'SMTWTFS'.split('').map(x=>`<em>${x}</em>`).join('')}${cells}</div><div class="acl"><span><i class="cb-bl"></i>Blocked</span><span><i class="cb-bk"></i>Booked</span><span><i class="cb-wt"></i>Request waiting</span></div></div>`}
Object.assign(CSVA,{
 calnav:a=>{const [i,d]=a.split('|');if(!CALM)return;CALM.m+=+d;if(CALM.m<0){CALM.m=11;CALM.y--}if(CALM.m>11){CALM.m=0;CALM.y++}blockSheet(i)},
 caltog:a=>{const [i,k]=a.split('|'),v=V[+i];if(!v)return;const cur=new Set(ST.blocks[v.id]||[]);cur.has(k)?cur.delete(k):cur.add(k);ST.blocks[v.id]=[...cur].sort();ST.save();try{DB.pushBlocks(v.id,ST.blocks[v.id])}catch(e){}blockSheet(i);renderView()}});
(function(){const st=document.createElement('style');st.textContent=`.acal{margin:12px 0}.ach{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.acg{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center}.acg em{font-style:normal;font-size:12px;color:var(--muted);padding:3px 0}
.acg button{height:38px;border-radius:10px;border:1px solid transparent;background:var(--bg);color:var(--ink);font:inherit;font-size:14px;cursor:pointer}
.acg button:hover:not(:disabled){border-color:var(--accent)}.acg button.cb-td{box-shadow:inset 0 -2px 0 var(--accent)}
.acg button.cb-bl{background:var(--ink);color:var(--surface);font-weight:700}
.acg button.cb-bk{background:repeating-linear-gradient(135deg,var(--line) 0 4px,var(--bg) 4px 8px);color:var(--muted);text-decoration:line-through}
.acg button.cb-wt{border-color:var(--sun)}.acg button:disabled{cursor:not-allowed;opacity:.5}
.acl{display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;font-size:12px;color:var(--muted)}.acl i{display:inline-block;width:12px;height:12px;border-radius:4px;margin-right:5px;vertical-align:-1px;background:var(--bg);border:1px solid var(--line)}
.acl i.cb-bl{background:var(--ink)}.acl i.cb-bk{background:repeating-linear-gradient(135deg,var(--line) 0 3px,var(--bg) 3px 6px)}.acl i.cb-wt{border-color:var(--sun)}`;document.head.appendChild(st)})();
