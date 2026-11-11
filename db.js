/* DATA LAYER. Three modes, picked automatically from config.js:
   1. Supabase backend (SUPABASE.url + key): shared database, renters see status changes by themselves, Admin signs in.
   2. Google Sheet inbox (REQUEST_ENDPOINT): requests are copied to a Sheet, Admin imports them.
   3. Test mode: everything stays in this browser (store.js).
   The pages call the hooks at the bottom (pushRequest, pushListing, pushBlocks, pullAll), so nothing else changes between modes. */
const _ep=()=>typeof REQUEST_ENDPOINT!=='undefined'&&REQUEST_ENDPOINT?String(REQUEST_ENDPOINT):'';
const _sb=()=>typeof SUPABASE!=='undefined'&&SUPABASE&&SUPABASE.url&&SUPABASE.key?{url:String(SUPABASE.url).replace(/\/+$/,''),key:String(SUPABASE.key)}:null;
const _T=x=>!!(x&&(x._test||String(x.id!=null?x.id:x).startsWith('T-')));
const _ob=()=>{const a=lsg('outbox',[]);return Array.isArray(a)?a:[]};
const _ST=()=>typeof ST!=='undefined'?ST:{requests:[],listings:[],blocks:{}};
const _now=()=>Date.now();
/* numbers that get shown on screens are forced to numbers, so a hand-made request can never inject HTML */
const _num=d=>{['days','extraH','extraFee','total','deposit'].forEach(k=>{if(k in d){const n=+d[k];d[k]=isFinite(n)?n:0}});if(!(d.days>=1))d.days=1;return d};
const _q=ids=>'('+ids.map(i=>'"'+String(i).replace(/"/g,'')+'"').join(',')+')';
const _tok=()=>{try{const a=new Uint8Array(18);crypto.getRandomValues(a);return Array.from(a,x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return (Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)+'0123456789abcdef').slice(0,36)}};
const DB={
  mode:'local',cfg:{url:'',key:''},P:{},
  supa:()=>!!_sb(),
  on:()=>!!_sb()||!!_ep(),
  pending:id=>_ob().includes(id),
  newToken:_tok,
  /* ---- Supabase plumbing ---- */
  sess:()=>{const s=lsg('sbsession',null);return s&&s.access_token?s:null},
  /* only the Admin page acts as staff. owner.html has no sign-in of its own, so it must never borrow an Admin session. */
  staff:()=>!!(_sb()&&DB.sess()&&/(^|\/)admin(\.html)?$/.test(location.pathname)),
  /* a staff call without a live session is an error, never a silent "nothing changed" */
  hdr:async(auth)=>{const c=_sb(),h={apikey:c.key,'Content-Type':'application/json'};if(auth){const s=await DB.fresh();if(!s)throw new Error('noauth');h.Authorization='Bearer '+s.access_token}return h},
  rest:async(path,opt)=>{const c=_sb();opt=opt||{};const h=await DB.hdr(opt.auth);Object.assign(h,opt.h||{});
    const r=await fetch(c.url+'/rest/v1/'+path,{method:opt.m||'GET',headers:h,body:opt.b!==undefined?JSON.stringify(opt.b):undefined});
    if(!r.ok)throw new Error('http '+r.status);const t=await r.text();return t?JSON.parse(t):null},
  rpc:(name,args)=>DB.rest('rpc/'+name,{m:'POST',b:args}),
  login:async(email,pw)=>{const c=_sb();const r=await fetch(c.url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:c.key,'Content-Type':'application/json'},body:JSON.stringify({email,password:pw})});
    const j=await r.json().catch(()=>({}));if(!r.ok||!j.access_token)throw new Error(r.status===400||r.status===401?'bad':'net');
    lss('sbsession',{access_token:j.access_token,refresh_token:j.refresh_token,exp:_now()+(j.expires_in||3600)*1000,email});return true},
  oauth:p=>{const c=_sb();if(!c)return;location.href=c.url+'/auth/v1/authorize?provider='+encodeURIComponent(p)+'&redirect_to='+encodeURIComponent(location.origin+location.pathname)},
  fromHash:async()=>{const m=/access_token=([^&]+).*?refresh_token=([^&]+)/.exec(location.hash)||/refresh_token=([^&]+).*?access_token=([^&]+)/.exec(location.hash);if(!m||!_sb())return false;
    const hp=new URLSearchParams(location.hash.slice(1)),at=hp.get('access_token'),rt=hp.get('refresh_token'),ex=+(hp.get('expires_in')||3600);history.replaceState(null,'',location.pathname+location.search);if(!at)return false;
    let em='',nm='';try{const c=_sb(),r=await fetch(c.url+'/auth/v1/user',{headers:{apikey:c.key,Authorization:'Bearer '+at}}),j=await r.json();em=j.email||'';nm=(j.user_metadata&&(j.user_metadata.full_name||j.user_metadata.name))||''}catch(e){}
    lss('sbsession',{access_token:at,refresh_token:rt,exp:_now()+ex*1000,email:em,name:nm});return true},
  /* true = on the staff list, false = signed in but not staff (or session gone), null = could not check (no signal) */
  isStaff:async()=>{try{const r=await DB.rest('staff?select=email',{auth:true});return Array.isArray(r)&&r.length>0}catch(e){return /noauth|http 40[13]/.test(String(e&&e.message))?false:null}},
  logout:()=>{lss('sbsession',null)},
  fresh:async()=>{const s=DB.sess();if(!s)return null;if(s.exp-_now()>60000)return s;const c=_sb();
    try{const r=await fetch(c.url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:c.key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});
      const j=await r.json();if(!r.ok||!j.access_token){lss('sbsession',null);return null}
      const n={access_token:j.access_token,refresh_token:j.refresh_token||s.refresh_token,exp:_now()+(j.expires_in||3600)*1000,email:s.email};lss('sbsession',n);return n}catch(e){return s}},
  /* ---- sending ---- */
  post:async r=>{
    if(_sb()){try{
      if(DB.staff()){const u=await DB.rest('requests?id=eq.'+encodeURIComponent(r.id),{m:'PATCH',auth:1,h:{Prefer:'return=representation'},b:{status:r.status,paid:!!r.paid,data:r,updated_at:new Date(r.updatedAt||_now()).toISOString()}});if(Array.isArray(u)&&!u.length&&r.status==='new')await DB.rpc('submit_request',{p:r});return true}
      if(r.status==='cancelled'){await DB.rpc('cancel_request',{p_id:r.id,p_track:r.track||''});return true}
      await DB.rpc('submit_request',{p:r});return true}catch(e){return false}}
    try{await fetch(_ep(),{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({hp:'',req:r})});return true}catch(e){return false}},
  send:id=>{const r=(_ST().requests||[]).find(x=>x.id===id);if(!r||!DB.on()||_T(r))return Promise.resolve(true);
    return DB.P[id]=DB.post(r).then(ok=>{const o=_ob().filter(x=>x!==id);if(!ok)o.push(id);lss('outbox',o);return ok})},
  wait:id=>DB.P[id]||Promise.resolve(!DB.pending(id)),
  retry:()=>{if(!DB.on())return Promise.resolve(true);return Promise.all(_ob().map(DB.send)).then(a=>a.every(Boolean))},
  /* ---- Google Sheet inbox (mode 2): Admin asks the Sheet for requests it does not have yet ---- */
  fetchNew:async key=>{const j=await (await fetch(_ep()+(_ep().includes('?')?'&':'?')+'key='+encodeURIComponent(key))).json();
    if(!j||!Array.isArray(j.rows))throw new Error(j&&j.error||'bad reply');
    const have=new Set(_ST().requests.map(x=>x.id)),seen=new Set();
    return j.rows.filter(r=>r&&r.id&&!have.has(r.id)&&!seen.has(r.id)&&seen.add(r.id))},
  /* ---- receiving: renter gets status updates, Admin gets new requests. Returns true if anything changed. ---- */
  /* listings: a light check every poll (ids + last change), full records (with photos) only for vehicles that changed */
  LU:{},
  pullListings:async auth=>{const S0=_ST(),lite=await DB.rest('listings?select=id,status,active,updated_at',{auth})||[];
    const need=lite.filter(w=>DB.LU[w.id]!==w.updated_at||!S0.listings.some(x=>x.id===w.id&&x._r)).map(w=>w.id),full={};
    for(let i=0;i<need.length;i+=40){const f=await DB.rest('listings?select=id,data,status,active,updated_at&id=in.'+_q(need.slice(i,i+40)),{auth})||[];f.forEach(w=>{full[w.id]=w})}
    Object.values(full).forEach(w=>{DB.LU[w.id]=w.updated_at});
    return lite.map(w=>full[w.id]||{id:w.id,status:w.status,active:w.active,data:(()=>{const d=Object.assign({},S0.listings.find(x=>x.id===w.id)||{});delete d._r;return d})()})},
  pullAll:async()=>{if(!_sb())return false;const S0=_ST();let ch=false;
    try{await DB.retry()}catch(e){}  /* anything that failed to send earlier goes first */
    try{
      if(DB.staff()){
        const rows=await DB.rest('requests?select=id,data,status,paid,updated_at&order=created_at.desc&limit=2000',{auth:1});
        const m=new Map(S0.requests.map(x=>[x.id,x]));
        rows.forEach(w=>{const t=Date.parse(w.updated_at)||0,l=m.get(w.id),d=_num(Object.assign({},w.data,{id:w.id,status:w.status,paid:!!w.paid,updatedAt:t}));
          if(!l){S0.requests.push(d);ch=true}else if(!DB.pending(w.id)&&t>(l.updatedAt||0)&&(l.status!==w.status||!!l.paid!==!!w.paid)){Object.assign(l,{status:w.status,paid:!!w.paid,updatedAt:t});ch=true}});
        S0.requests.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
        const ls=await DB.pullListings(1);ch=DB.mergeListings(ls,true)||ch;
      }else{
        const mine=S0.requests.filter(r=>r.track);const tk=[...new Set(mine.map(r=>r.track))];
        if(tk.length){const rows=await DB.rpc('my_requests',{tokens:tk});(rows||[]).forEach(w=>{const l=mine.find(x=>x.id===w.id);if(l&&!(l.status==='cancelled'&&DB.pending(l.id))&&(l.status!==w.status||!!l.paid!==!!w.paid)){l.status=w.status;l.paid=!!w.paid;ch=true}if(l&&w.reason!=null&&(l.reason||'')!==(w.reason||'')){l.reason=w.reason||'';ch=true}})}
        const ls=await DB.pullListings(0);ch=DB.mergeListings(ls,false)||ch;
      }
      const kv=await DB.rest('kv?select=key,data');(kv||[]).forEach(k=>{
        if(k.key==='blocks'&&k.data&&typeof k.data==='object'){const keep=Object.fromEntries(Object.entries(S0.blocks||{}).filter(e=>String(e[0]).startsWith('T-'))),nb=Object.assign({},k.data,keep),cur=Object.fromEntries(Object.entries(S0.blocks||{}).filter(e=>!String(e[0]).startsWith('T-')));if(JSON.stringify(cur)!==JSON.stringify(k.data)){S0.blocks=nb;if(typeof ST!=='undefined')ST.blocks=nb;ch=true}}
        if(k.key==='booked'&&k.data&&typeof k.data==='object'&&JSON.stringify(lsg('booked',{}))!==JSON.stringify(k.data)){lss('booked',k.data);ch=true}
        if(k.key==='vact'&&k.data&&typeof k.data==='object'&&JSON.stringify(lsg('vact',{}))!==JSON.stringify(k.data)){lss('vact',k.data);ch=true}});
      if(ch)S0.save&&S0.save();
    }catch(e){DB.err=String(e&&e.message||e);return false}
    DB.err='';DB.at=_now();return ch},
  mergeListings:(rows,staff)=>{const S0=_ST();let ch=false;const seen=new Set();
    (rows||[]).forEach(w=>{const d=Object.assign({},w.data,{id:w.id,status:w.status,active:w.active});seen.add(w.id);const i=S0.listings.findIndex(x=>x.id===w.id);
      if(i<0){S0.listings.unshift(Object.assign(d,{_r:1}));ch=true}else if(JSON.stringify(Object.assign({},S0.listings[i],{_r:0}))!==JSON.stringify(Object.assign({},d,{_r:0}))){if(!staff||S0.listings[i]._r)S0.listings[i]=Object.assign(d,{_r:1});ch=true}});
    if(!staff){const n=S0.listings.filter(x=>!x._r||seen.has(x.id)||_T(x));if(n.length!==S0.listings.length){S0.listings.splice(0,S0.listings.length,...n);ch=true}}
    return ch},
  /* ---- Admin writes ---- */
  pushRequest:r=>{if(!r||!DB.on()||_T(r))return;if(_sb()){if(DB.staff()){r.updatedAt=_now();if(!_ob().includes(r.id))lss('outbox',_ob().concat(r.id));DB.send(r.id);return}
      if(r.status==='new'||r.status==='cancelled'){if(!_ob().includes(r.id))lss('outbox',_ob().concat(r.id));DB.send(r.id)}return}
    if(r.status==='new'&&!r._in){if(!_ob().includes(r.id))lss('outbox',_ob().concat(r.id));DB.send(r.id)}},
  pushListing:l=>{if(!_sb()||!DB.staff()||!l||_T(l))return;const d=Object.assign({},l);delete d._r;
    DB.rest('listings',{m:'POST',auth:1,h:{Prefer:'resolution=merge-duplicates'},b:{id:l.id,data:d,status:l.status||'approved',active:l.active!==false,updated_at:new Date().toISOString()}}).catch(()=>{})},
  pushBooked:map=>{if(!_sb()||!DB.staff())return;DB.rest('kv',{m:'POST',auth:1,h:{Prefer:'resolution=merge-duplicates'},b:{key:'booked',data:map,updated_at:new Date().toISOString()}}).catch(()=>{})},
  pushBlocks:(id,days)=>{if(!_sb()||!DB.staff())return;DB.rest('kv',{m:'POST',auth:1,h:{Prefer:'resolution=merge-duplicates'},b:{key:'blocks',data:Object.fromEntries(Object.entries(_ST().blocks||{}).filter(e=>!String(e[0]).startsWith('T-'))),updated_at:new Date().toISOString()}}).catch(()=>{})},
  delRequests:ids=>{ids=(ids||[]).filter(i=>!_T(String(i)));if(!_sb()||!DB.staff()||!ids.length)return;DB.rest('requests?id=in.'+_q(ids),{m:'DELETE',auth:1}).catch(()=>{try{toast('Delete not saved online. Sign in again and retry.')}catch(e){}})},
  delListing:id=>{if(!_sb()||!DB.staff()||_T(String(id)))return;DB.rest('listings?id=eq.'+encodeURIComponent(id),{m:'DELETE',auth:1}).catch(()=>{})},
  pushVact:map=>{if(!_sb()||!DB.staff())return;DB.rest('kv',{m:'POST',auth:1,h:{Prefer:'resolution=merge-duplicates'},b:{key:'vact',data:map,updated_at:new Date().toISOString()}}).catch(()=>{})}
};
window.addEventListener('online',()=>{try{DB.retry()}catch(e){}});
