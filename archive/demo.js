/* Demo data: a test load so the dashboards have something to show.
   Everything made here is tagged demo:true and removed again by "Clear demo data". Real records are never touched. */
function demoRng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const DM_FIRST=['Maria','Jose','Ana','Juan','Rina','Carlo','Liza','Mark','Joy','Paolo','Grace','Ben','Nina','Rico','Tess','Dan','Mae','Lito','Gia','Noel','Ella','Jun','Cathy','Arnel','Bea','Rey','Dina','Migs','Lara','Toto'];
const DM_LAST=['Santos','Reyes','Cruz','Bautista','Garcia','Mendoza','Torres','Flores','Ramos','Aquino','Dela Cruz','Villanueva','Castro','Navarro','Salazar','Pascual','Rivera','Soriano','Lim','Tan'];
const DM_MODELS={
  motor:[['Honda Click 125i','Scooter',2,420],['Yamaha Mio i 125','Scooter',2,400],['Honda Beat','Scooter',2,380],['Yamaha NMAX','Scooter',2,650],['Honda ADV 160','Scooter',2,850],['Suzuki Raider 150','Motorcycle',2,500]],
  car:[['Toyota Wigo','Hatchback',5,1300],['Toyota Vios','Sedan',5,1800],['Mitsubishi Mirage','Hatchback',5,1400],['Suzuki Ertiga','SUV',7,2400],['Toyota Innova','SUV',7,2800],['Toyota Fortuner','SUV',7,3800],['Toyota Hiace','Van',12,3600],['Nissan Urvan','Van',14,3400],['Toyota Hilux','Pickup',5,3200],['Honda City','Sedan',5,2000]]};
const dmDemoCount=()=>({users:ST.users.filter(u=>u.demo).length,listings:ST.listings.filter(l=>l.demo).length,requests:ST.requests.filter(r=>r.demo).length});
function demoClear(quiet){
  const ids=new Set(ST.users.filter(u=>u.demo).map(u=>u.id));
  ST.users=ST.users.filter(u=>!u.demo);ST.listings=ST.listings.filter(l=>!l.demo);ST.requests=ST.requests.filter(r=>!r.demo);ST.reviews=ST.reviews.filter(r=>!r.demo);
  ST.favs=ST.favs.filter(f=>!String(f).startsWith('demo-'));
  if(ids.has(ST.sid))ST.sid=null;
  if(!quiet)ST.save()}
function demoLoad(){
  demoClear(true);
  const R=demoRng(20261105),pick=a=>a[Math.floor(R()*a.length)],int=(a,b)=>a+Math.floor(R()*(b-a+1));
  const today=todayIso(),areas=Object.keys(AREAS),name=()=>pick(DM_FIRST)+' '+pick(DM_LAST);
  const ts=s=>new Date(s+'T12:00:00').getTime();
  /* owners (40) and renters (60) */
  const owners=[],renters=[];
  for(let i=1;i<=40;i++)owners.push({id:'demo-o'+i,name:i===1?'Demo Owner':name(),first:i===1?'Demo':undefined,last:i===1?'Owner':undefined,provider:'demo',roles:['guest','host'],createdAt:ts(addD(today,-int(40,520))),email:'owner'+i+'@example.test',phone:'09'+int(100000000,999999999),demo:true});
  for(let i=1;i<=60;i++)renters.push({id:'demo-r'+i,name:name(),provider:'demo',roles:['guest'],createdAt:ts(addD(today,-int(0,360))),email:'renter'+i+'@example.test',phone:'09'+int(100000000,999999999),demo:true});
  /* vehicles (120): most owners have 2 to 4 */
  const cars=[];let n=0;
  owners.forEach((o,oi)=>{const k=oi===0?5:oi<30?int(2,4):int(3,5);for(let j=0;j<k&&n<120;j++,n++){
    const mo=R()<0.5,m=pick(DM_MODELS[mo?'motor':'car']),area=pick(areas),jit=()=>(R()-.5)*0.02,price=Math.round(m[3]*(0.85+R()*0.35)/50)*50,st=n>=114?'pending':'approved';
    cars.push({id:'demo-l'+(n+1),kind:mo?'motor':'car',name:m[0],type:m[1],seats:m[2],service:mo||R()<.6?'Self-drive':'With driver',area,pos:[AREAS[area][0]+jit(),AREAS[area][1]+jit()],place:{n:area,s:''},price,hourly:0,color:pick(COLORS)[0],active:true,
      description:'Demo vehicle for testing the dashboards. '+m[0]+' kept clean and serviced, ready for pickup in '+area+'.',specs:mo?{year:int(2018,2025),transmission:'Automatic',cc:m[0].includes('160')?160:125,fuel:'Gasoline',helmets:2,mileage:'Unlimited'}:{year:int(2016,2025),transmission:R()<.6?'Automatic':'Manual',fuel:'Gasoline',bags:int(2,6),aircon:'Yes'},features:[],images:[],
      ownerId:o.id,ownerName:o.name,status:st,createdAt:ts(addD(today,-int(20,480))),demo:true})}});
  /* bookings (about 600): past 12 months plus the next 30 days, busier Dec to May and on weekends, no overlaps per vehicle */
  const live=cars.filter(c=>c.status==='approved'),busy={},reqs=[],reviews=[];
  const season=m=>[1.35,1.3,1.4,1.45,1.25,.8,.7,.7,.8,.95,1.0,1.5][m];
  const LAST=addD(today,30);let tries=0,id0=1000;
  while(reqs.length<610&&tries++<9000){
    const c=pick(live),back=int(0,365),start=addD(today,-back+ (R()<.08?int(10,30):0)),m=+start.slice(5,7)-1,dow=new Date(start+'T12:00:00').getDay();
    if(R()>season(m)/1.5)continue;if((dow===5||dow===6||dow===0)?false:R()<.28)continue;
    const mo=c.kind==='motor',d=mo?pick([1,1,2,2,3,3,4,5,7]):pick([1,2,2,3,3,4,5,6]),end=addD(start,d);if(end>LAST)continue;
    const b=busy[c.id]||(busy[c.id]=[]);if(b.some(x=>start<=x[1]&&end>=x[0]))continue;
    const past=end<today,roll=R();let status;
    if(past)status=roll<.84?'completed':roll<.92?'cancelled':'declined';else if(start<=today)status='confirmed';else status=roll<.62?'confirmed':'new';
    const blocks=(status==='completed'||status==='confirmed');if(blocks)b.push([start,end]);
    const xh=R()<.28?int(1,XMAX):0,fee=xh?Math.min(c.price,hourlyOf(c)*xh):0,total=c.price*d+fee,g=pick(renters),time=pick(['07:00','08:00','08:30','09:00','09:30','10:00','10:30','11:00','13:00','14:00','16:00']);
    const r={id:'DEMO-'+(id0++),carId:c.id,carName:c.name,hostId:c.ownerId,hostName:c.ownerName,guestId:g.id,guestName:g.name,guestPhone:g.phone,guestEmail:g.email,from:start,to:end,time,extraH:xh,extraFee:fee,days:d,total,deposit:depositOf(c),spot:c.area,notes:'',msg:'',status,createdAt:ts(addD(start,-int(1,25))),demo:true};
    if(status==='new'&&R()<.5)r.avail='yes';
    if(status==='completed'){r.paid=end<addD(today,-3)?R()<.96:false;r.depBack=end<addD(today,-2)?R()<.97:false;
      if(R()<.5)reviews.push({id:'demo-rv'+reviews.length,carId:c.id,reqId:r.id,guestName:g.name,rating:Math.min(5,Math.max(2,Math.round(4.4+(R()-.5)*3))),text:pick(['Clean and easy pickup.','Great value for the trip.','Owner was friendly and on time.','Smooth rental, would book again.','Good bike for the island roads.']),createdAt:ts(end),demo:true})}
    reqs.push(r)}
  /* the demo owner (demo-o1): one paused and one pending vehicle, plus a few fresh requests waiting for an answer */
  const mine=cars.filter(c=>c.ownerId==='demo-o1');if(mine[3])mine[3].active=false;if(mine[4])mine[4].status='pending';
  const mlive=mine.filter(c=>c.status==='approved'&&c.active!==false);let mk=0,mt=0;
  while(mk<4&&mt++<200&&mlive.length){const c=pick(mlive),start=addD(today,int(3,24)),end=addD(start,pick([1,2,3])),b=busy[c.id]||(busy[c.id]=[]);if(b.some(x=>start<=x[1]&&end>=x[0]))continue;
    const g=pick(renters),d=days(start,end),mo=c.kind==='motor';
    reqs.push({id:'DEMO-'+(id0++),carId:c.id,carName:c.name,hostId:c.ownerId,hostName:c.ownerName,guestId:g.id,guestName:g.name,guestPhone:g.phone,guestEmail:g.email,from:start,to:end,time:'09:00',extraH:0,extraFee:0,days:d,total:c.price*d,deposit:depositOf(c),spot:c.area,notes:'',msg:'',status:'new',createdAt:Date.now()-mk*3600e3,demo:true});mk++}
  reqs.sort((a,b)=>b.createdAt-a.createdAt);
  ST.users.push(...owners,...renters);ST.listings.push(...cars);ST.requests.push(...reqs);ST.reviews.push(...reviews);
  return ST.save()}
