/* Demo data layer. Everything is saved in this browser only. A real backend (Supabase) replaces this file later. */
const mem={};
const lsg=(k,d)=>{try{const v=localStorage.getItem('arkila2-'+k);return v?JSON.parse(v):(k in mem?mem[k]:d)}catch(e){return k in mem?mem[k]:d}};
const lss=(k,v)=>{mem[k]=v;try{localStorage.setItem('arkila2-'+k,JSON.stringify(v));return true}catch(e){return false}};
const ST={users:lsg('users',[]),listings:lsg('listings',[]),requests:lsg('requests',[]),sid:lsg('sid',null),favs:lsg('favs',[]),reviews:lsg('reviews',[]),
  save(){return [lss('users',this.users),lss('listings',this.listings),lss('requests',this.requests),lss('sid',this.sid),lss('favs',this.favs),lss('reviews',this.reviews)].every(Boolean)},
  me(){return this.users.find(u=>u.id===this.sid)||null}};
const allCars=()=>[...CARS.map(c=>Object.assign({ownerId:'sample',ownerName:'Arkila sample',status:'approved'},c)),...ST.listings];
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30);
const reviewsOf=c=>ST.reviews.filter(r=>r.carId===c.id);
const ratingOf=c=>{const r=reviewsOf(c);return r.length?{avg:r.reduce((s,x)=>s+x.rating,0)/r.length,n:r.length}:null};
const stars=n=>'★'.repeat(Math.round(n))+'☆'.repeat(5-Math.round(n));
