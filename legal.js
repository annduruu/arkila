/* Public legal text: Terms of Service, Privacy Notice and renter notice. PHASE 1 version.
   Phase 1 flow: renter sends a request, Arkila replies on Messenger to confirm, the renter pays Arkila AFTER confirmation, then pickup. Nothing is charged online at request time.
   The owner declaration and any online payment, held-deposit or owner-payout rules belong to Phase 2 and are not shown to renters.
   English is the version people agree to. Items in [square brackets] are decisions still to be made and show highlighted.
   A Philippine lawyer should review it before real bookings. */
const LEGAL_VERSION='2026-11-06';

const phf=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\[([^\]]+)\]/g,'<mark class="ph">[$1]</mark>');
const money0=n=>'₱'+Number(n).toLocaleString('en-PH');
const capOf=c=>SETTINGS.damageCap[(c&&isMotor(c))?'motor':'car'];

/* ---------------- renter notice ---------------- */
function renterNotice(c,ctx){
  const fig=ctx?`For this request, the rental fee is **${money0(ctx.total)}**. Arkila confirms the final price on Messenger before you pay anything.`:`The listing shows the daily rate. Arkila confirms the final price on Messenger before you pay anything.`;
  return {title:'Renter notice',
  intro:'Please read this properly. It is the most important part of your request. By ticking the box you confirm every point below. If you do not understand a point, ask Arkila before you tick.',
  groups:[
  {h:'1. Money',items:[
   '**Nothing is charged when you send a request.** Arkila replies on Messenger to confirm the vehicle is free for your dates. Only after that confirmation do you pay Arkila, by [GCash, Maya, bank transfer or cash: decide], before or at pickup. Arkila tells you how.',
   fig,
   `A security deposit of [${money0(SETTINGS.deposit.car)} for cars and ${money0(SETTINGS.deposit.motor)} for motorbikes: decide whether Arkila asks for one] may be asked at pickup. If asked, it is returned when you bring the vehicle back, less any damage, fuel shortfall or fine, shown with dated photos.`,
   `You pay for damage you cause, up to a damage cap of [${money0(SETTINGS.damageCap.car)} for cars and ${money0(SETTINGS.damageCap.motor)} for motorbikes: decide]. [The cap may not apply if the damage came from a breach such as drunk riding or unauthorised use: decide.]`,
   `Cancelling: tell Arkila on Messenger as early as you can. If you cancel [14] or more days before pickup, you owe nothing. If you cancel later, you may owe [20% to 100%] of the rental fee, never more than [3] days' rental: Arkila will tell you the exact rule before you agree to the booking. If you do not show up, you may owe up to [100%] of the first day.`,
   `You also pay traffic fines, tolls, parking and any fuel shortfall during the rental. Late returns are charged at the daily rate after [30 minutes'] grace. Ask Arkila before the end time if you need more days.`]},
  {h:'2. Insurance and risk',items:[
   'Arkila does not provide insurance. It does not insure the vehicle, you, your passenger or anyone you might harm. A deposit or damage cap, if any, covers damage to the vehicle only. It does not cover injury, medical costs, harm to other people or their property, or loss of your belongings.',
   'We advise you to buy your own travel and medical insurance before you ride or drive. You are responsible for your own injuries and for harm you cause to others, as the law provides. The owner may have their own policy, but it may exclude rentals, so ask.',
   'You know that riding or driving carries real risks, including collision, falling, skidding on wet or unpaved roads, animals on the road, theft, damage, bad weather including typhoons, and injury or death. A motorbike gives you no protection in a crash. You accept these risks.']},
  {h:'3. Licence and legal use',items:[
   'You hold a valid licence for this type of vehicle. For a motorbike you need a motorcycle licence, and a car licence alone is not enough. A foreign licence must be in English, or come with an official translation or an International Driving Permit shown with your home licence. It is generally accepted for up to 90 days from your arrival. Longer stays need a Philippine LTO licence.',
   'You are 18 or older for motorbikes [and 21 or 25 for cars: decide]. You show your licence and a valid ID at pickup (foreign renters a passport, Filipino renters two valid government IDs). Arkila may refuse a rental if the checks do not pass.',
   'You wear an approved helmet and require your passenger to wear one, as Philippine law requires. You follow traffic laws, carry no more riders or passengers than the listing allows, and do not ride or drive under the influence of alcohol or drugs. You do not race, tow, sublet or lend the vehicle. Only the renter named in the rental agreement drives or rides, unless Arkila allows another person in writing. You do not take the vehicle off-road or outside Palawan unless Arkila allows it in writing.',
   'You return the vehicle on time, in the condition you received it apart from normal wear, with the agreed fuel level.']},
  {h:'4. Pickup and return',items:[
   `At pickup you and Arkila (or the owner's representative) complete a handover checklist together. You photograph any existing damage, record the fuel level and odometer, and check the brakes, lights, tyres and horn, and the helmets for motorbikes. Do not take a vehicle you think is unsafe. The checklist and dated photos are the evidence used in any damage claim.`,
   'You complete the checklist again at return. Normal wear and tear is not damage.']},
  {h:'5. If something goes wrong',items:[
   'Accident: get safe and get medical help first. Call the police for any accident with injury, a third party or major damage. Tell Arkila as soon as you can and take photos.',
   'Theft or lost keys: report it to the police within [24 hours] and tell Arkila immediately. You pay for theft up to the damage cap, unless you followed the checklist and reported promptly. [Decide: whether prompt reporting reduces the charge.]',
   'Breakdown: if the vehicle breaks down or becomes unsafe through no fault of yours, tell Arkila straight away. Arkila fixes or swaps the vehicle where possible. If not, you are not charged for the unused days or the breakdown.',
   'Disputes: we try to settle first, using the photos, the checklist and the messages. You have [48] hours to reply to a damage claim. You can still take the matter to court.']},
  {h:'6. Your information',items:[
   'Arkila keeps your details and any ID or licence photos you give it secure, uses them only for your rental and its checks, shares your name and contact number with the owner only once the booking is confirmed, and deletes them as set out in the Privacy Notice.']},
  {h:'7. What Arkila is',items:[
   `Arkila is a vehicle rental marketplace for Puerto Princesa. It lists vehicles, takes requests and arranges the handover. It does not guarantee any vehicle or outcome, and its checks are basic. [Decide: whether Arkila or the vehicle owner is the rental provider in the rental agreement.] Arkila's liability is limited as set out in the Terms of Service, but never for fraud, intentional wrongdoing, or anything the law does not allow to be limited.`,
   'You have read this in a language you understand and you agree freely.']}],
  foot:`Each of us is responsible for our own acts. Nothing here limits any liability that the law does not allow to be limited, including liability for fraud or intentional wrongdoing. Arkila confirms the price, payment method and cancellation rule with you on Messenger before you pay.`};
}

/* ---------------- owner declaration: PHASE 2, kept for later, not shown to renters ---------------- */
function hostDeclaration(){
  return {title:'Owner declaration (Phase 2, not used yet)',
  intro:'Please read this properly. By ticking the box you confirm every point below, now and again on each confirmed booking. If you do not understand a point, ask Arkila before you tick.',
  groups:[
  {h:'1. Your right to rent and your documents',items:[
   `You own the vehicle or have the owner's written permission to rent it out. Its registration is current and you have told Arkila whether it is registered as private or for hire. [Arkila to confirm whether vehicles must be registered for hire before they can be rented out.]`,
   `You have given Arkila your ID, a photo of the registration (OR/CR) and four real photos of the vehicle, and you can show the OR/CR on request. Arkila may ask for more.`,
   `Your listing is honest: the photos are real and yours to use, and the price, seats or riders, transmission, fuel, mileage, deposit, rules and existing damage are accurate. You do not call a vehicle safe, insured or inspected unless that is true.`,
   `The vehicle is roadworthy, with working brakes, lights, tyres and horn, and is safe on public roads. For motorbikes you supply one approved helmet per rider.`]},
  {h:'2. Bookings',items:[
   `You reply to Arkila's availability checks within [2 hours] between [8am and 8pm], or mark the vehicle unavailable. You avoid cancelling a confirmed booking except for a real emergency. If you cancel, the renter gets a full refund and repeated cancellations may lead to suspension.`,
   `You do not use Arkila to meet a renter and then book or pay outside Arkila to avoid the fee. If you do, you still owe the fee and Arkila may suspend your account. You make no hidden charges: anything beyond the listing needs the renter's agreement in advance.`,
   `You treat renters fairly, with no discrimination or harassment. You use a renter's name, contact number and dates only for that booking, and you do not share them or keep them afterwards.`]},
  {h:'3. Money',items:[
   `Arkila holds the booking money and pays you the rental fee less Arkila's fee [10% of the rental fee, with a ₱100 minimum]. Payment comes 24 hours after pickup, if you and the renter completed the handover checklist with dated photos and the renter has not reported a problem. An owner's confirmation alone, without the checklist, does not release the payout.`,
   `Arkila may deduct refunds owed to renters from your later payouts, for example for a breakdown, a vehicle not as listed, or a payment that is reversed or charged back. If you have no later payouts, you repay it within [7] days. If you keep a cancellation fee, Arkila's fee applies to it as it does to the rental fee.`,
   `The renter's deposit stays with Arkila, not with you. To claim damage, a fuel shortfall or a fine, report it within [24 hours] of return with dated photos from the handover and the return. The renter has [48] hours to reply. Charges are limited to the repair cost with a receipt or quote, up to the damage cap, and normal wear and tear is not damage. The claimed amount stays held until the claim is agreed or decided.`,
   `Damage above the deposit is the renter's to pay, up to the damage cap. Arkila will help you collect it but does not guarantee any amount above the deposit. This does not limit Arkila's duties to release and return held money as the Terms set out.`]},
  {h:'4. Handover, insurance and the law',items:[
   `You complete Arkila's handover checklist with the renter at pickup and at return, with dated photos of condition, fuel and odometer.`,
   `Arkila does not provide insurance. You have checked what your own policy covers when the vehicle is rented, and you tell renters about any exclusions.`,
   `You are responsible for any licences, permits and taxes that apply to renting out your vehicle in the Philippines. Arkila does not give tax or legal advice.`,
   `You will follow Arkila's owner standards and the Terms of Service, and you accept that Arkila makes the decision on how held money is released in a dispute, as set out there. You can still take a matter to court.`]}],
  foot:`Each of us is responsible for our own acts. Nothing here limits any liability that the law does not allow to be limited, including liability for fraud or intentional wrongdoing.`};
}

/* small text pieces of the notice. Uses the page translator t() when it has the key, otherwise the English below.
   The Filipino summary (nt.rintro, nt.r1..nt.r6) only shows once those keys are written. */
const _LT={'nt.rnote':'Full rules:','nt.hnote':'Full rules:','ack.terms':'Terms of Service','nt.privacy':'Privacy Notice','close':'Close','nt.fullen':'The English text above is the full version.'};
const _lt=k=>{let v='';try{v=typeof t==='function'?t(k):''}catch(e){}return v||_LT[k]||''};
function noticeHtml(kind,ctx){
  const h=kind==='host',n=h?hostDeclaration():renterNotice(ctx&&ctx.c,ctx);
  let k=0;
  const fil=(PREF.lang==='fil'&&_lt('nt.rintro'))?`<div class="banner" style="margin:10px 0"><b>Buod sa Filipino.</b> ${esc(t(h?'nt.hintro':'nt.rintro'))}<ol>${Array.from({length:h?5:6},(_,i)=>`<li>${esc(t((h?'nt.h':'nt.r')+(i+1)))}</li>`).join('')}</ol><span class="note">${esc(t('nt.fullen'))}</span></div>`:'';
  return `<h2 id="ntitle">${esc(n.title)}</h2><p style="margin:0">${esc(n.intro)}</p>${fil}`+n.groups.map(g=>`<h3 class="h3">${esc(g.h)}</h3><ol class="nl" start="${k+1}">${g.items.map(x=>{k++;return `<li>${phf(x)}</li>`}).join('')}</ol>`).join('')+`<p>${esc(n.foot)}</p><p class="note">${esc(_lt(h?'nt.hnote':'nt.rnote'))} <button type="button" class="lnk" data-act="legal" data-arg="terms">${esc(_lt('ack.terms'))}</button> · <button type="button" class="lnk" data-act="legal" data-arg="privacy">${esc(_lt('nt.privacy'))}</button></p><div class="stack"><button type="button" class="btn cta" data-nclose data-act="close">${esc(_lt('close'))}</button></div>`;
}

/* ---------------- Terms of Service ---------------- */
const TERMS=[
{id:'tos1',h:'1. About these terms',b:[
 ['p','By using Arkila\'s website or sending a request, you agree to these terms. Highlighted items are decisions still to be made.'],
 ['ul',[
  '**Who we are.** Arkila is [Business name], based in Puerto Princesa, Palawan, Philippines. Contact: [email], [phone], [Facebook page].',
  '**What Arkila does.** Arkila lists cars and motorbikes for rent in Puerto Princesa. Renters send a request on the site, Arkila replies on Messenger to confirm, and the vehicle is handed over at pickup.',
  '**What Arkila does not do.** We do not insure the vehicles or the people using them. [Decide who the rental provider is in the rental agreement: Arkila or the vehicle owner.]',
  '**Words we use.** Renter: a person who requests a vehicle. Listing: a vehicle\'s page, with its price and rules. Request: a renter\'s request for dates. Booking: a request that Arkila has confirmed on Messenger.',
  '**Who can use Arkila.** You must be 18 or older and able to make a binding contract. You must give true information about yourself.']]]},
{id:'tos2',h:'2. Renter terms',b:[
 ['p','As a renter you are responsible for how you use the vehicle and for keeping to this section.'],
 ['ol',[
  '**Eligibility.** You must be 18 or older for motorbikes [and 21 or 25 for cars: decide]. You must hold a valid licence for the vehicle type. A foreign licence must be in English, or come with an official translation or an International Driving Permit shown with your home licence, and is generally accepted for up to 90 days from arrival. Longer stays need a Philippine LTO licence.',
  '**Identity.** Show your licence and a valid ID at pickup. Foreign renters show a passport. Filipino renters show two valid government IDs. [Decide: whether Arkila asks for photos before confirming.]',
  '**Requests are not bookings.** A booking exists only when Arkila confirms it on Messenger. Arkila may decline a request, for example if the vehicle is not free.',
  '**Pickup and handover.** Complete the handover checklist: photograph any existing damage and record the fuel level and odometer. Do not take a vehicle you think is unsafe, and tell Arkila if you find a problem.',
  '**Using the vehicle.** Follow traffic laws. Wear an approved helmet, and require your passenger to wear one. Do not carry more riders or passengers than the listing allows. Do not ride or drive under the influence, race, tow, sublet, or use the vehicle off-road or outside Palawan unless Arkila allows it in writing. Only the renter named in the rental agreement drives or rides, unless Arkila allows another person in writing.',
  '**Care and return.** Return the vehicle on time, in the condition you received it apart from normal wear, with the agreed fuel level. If you will be late, tell Arkila first.',
  '**Costs you cover.** You pay for damage, theft, fuel shortfalls, traffic fines and tolls during the rental, up to the damage cap [decide] for damage. You keep paying the daily rate while the vehicle is out of service because of damage you caused.',
  '**Your own insurance.** Arkila does not provide insurance. We recommend you buy travel and medical insurance. You are responsible for your own injuries and for harm you cause to others, as the law provides.',
  '**Risk.** You know that riding or driving carries real risks, including collision, falling, theft, damage, road conditions, weather and injury, and you accept them as described in the renter notice in section 6.']]]},
{id:'tos3',h:'3. Requests, payment and cancellation',b:[
 ['p','Nothing is charged online when you send a request. You pay Arkila after it confirms your booking on Messenger.'],
 ['ol',[
  '**Request.** The renter picks dates on the vehicle\'s calendar. Dates already booked or blocked are greyed out and cannot be picked. The renter sends contact details and ticks the renter notice in section 6.',
  '**Confirmation.** Arkila replies on Messenger, usually within [2 hours] between [8am and 8pm], to confirm availability, the final price, the pickup place and how to pay. If Arkila cannot confirm, no booking is made and nothing is owed.',
  '**Payment.** After confirmation the renter pays Arkila by [GCash, Maya, bank transfer or cash: decide], before or at pickup. Arkila gives a receipt. [Decide: whether the dates are held for a set time while the renter pays.]',
  '**Deposit.** [Decide whether a security deposit is asked at pickup.] If one is asked, it is returned at return, less any damage, fuel shortfall or fine shown with dated photos, within [5 days].',
  '**24-hour days.** Each rental day is 24 hours from the pickup time the renter chose, and the renter returns the vehicle at the same time on the last day. The renter may add up to [6] extra hours at booking, charged at [20%] of the daily rate for each extra hour, up to a full day, and the return time moves later by the same hours. Arkila keeps a [3-hour] break between two rentals of the same vehicle for cleaning, checks and fuel.',
  '**Renter cancellation.** Cancel on Messenger. If the renter cancels [14] or more days before pickup, nothing is owed. If they cancel later, they may owe [20%, 50% or up to 100%] of the rental fee depending on how late, never more than [3] days\' rental. If the renter does not show up within [2 hours] of the pickup time and has not contacted Arkila, it counts as a no-show. Arkila tells the renter the exact rule when it confirms.',
  '**Arkila cancellation.** If Arkila cancels a confirmed booking, the renter gets a full refund of anything paid, and Arkila helps find a similar vehicle where possible.',
  '**Late return and extensions.** Ask Arkila before the end time. Late returns are charged at the daily rate after [30 minutes\'] grace.',
  '**Breakdown.** If the vehicle breaks down or becomes unsafe through no fault of the renter, the renter tells Arkila straight away. Arkila fixes or swaps the vehicle where possible. If not, the renter is not charged for the unused days or the breakdown, and any amount already paid for them is refunded. If the renter caused it, section 2 applies.',
  '**Bad weather.** [If typhoon warnings stop travel, the booking is moved or refunded. Decide.]',
  '**Refunds.** Arkila refunds by the same method the renter paid with, within [5] days. [Decide who pays any payment transfer fees.]']]]},
{id:'tos4',h:'4. Reviews, photos and content',b:[
 ['ul',[
  '**Honest reviews.** After a rental, a renter may leave a review. Reviews must be truthful, from a real rental, and free of abuse or private information. No paid or fake reviews. Arkila may remove reviews that break these rules.',
  '**Vehicle photos.** Photos on listings are real photos of the vehicle where possible. Illustrations may be shown while a photo is being added.',
  '**Arkila\'s name and logo.** Do not use Arkila\'s name or logo in a way that suggests we endorse you.']]]},
{id:'tos5',h:'5. Platform rules',b:[
 ['ol',[
  '**No fake requests.** Only request vehicles you really plan to rent, with your own real details.',
  '**No scraping or misuse.** Do not copy the site\'s data in bulk, break its security, or send spam.',
  '**Keep it lawful.** No use of Arkila for anything illegal, abusive or harmful, including harassment of other people.',
  '**Fees.** Renters pay the price Arkila confirms and no separate booking fee. [Decide whether this will change later.]']]]},
{id:'tos6',h:'6. Accidents, damage, notice and disputes',b:[
 ['h','Accidents'],
 ['ol',['Get safe and get medical help first.','Call the police for any accident with injury, a third party, or major damage.','Tell Arkila as soon as you can, and take photos.','If the vehicle is stolen or the keys are lost, tell the police and report it within [24] hours, and tell Arkila immediately. Costs are handled under "Costs you cover" in section 2, up to the damage cap, unless the renter followed the checklist and reported it promptly. [Decide: whether prompt reporting reduces the charge.]']],
 ['h','Damage reports'],
 ['ol',['Arkila reports damage within [24] hours of return, with dated photos from the handover and return.','The renter has [48] hours to reply. Charges are limited to repair cost with a receipt or quote, up to the damage cap [decide].','Normal wear and tear is not damage.']],
 ['h','Insurance'],
 ['ol',['Arkila does not provide insurance. A deposit or damage cap, if any, does not cover injuries or harm to other people.','[Later: Arkila plans to add insurance through an insurer partner. These terms will be updated first.]']],
 ['h','Renter notice'],
 ['notice','renter'],
 ['h','For both sides'],
 ['p','Each of us is responsible for our own acts. Nothing here limits any liability that the law does not allow to be limited, including liability for fraud or intentional wrongdoing.'],
 ['h','Disputes'],
 ['p','We try to settle first, looking at the photos, handover checklist and messages. Either side may still take the matter to court. [If it is not settled: courts of Puerto Princesa City.]']]},
{id:'tos7',h:'7. Suspension and ending use',b:[
 ['ul',[
  '**You can stop.** You can stop using Arkila at any time. Confirmed bookings still need to be honoured or properly cancelled first.',
  '**We can refuse or stop service.** Arkila may decline a request or stop serving a person who breaks these terms, puts people at risk, gives false information, or has repeated complaints. Where we can, we tell you why.',
  '**What survives.** Duties about money owed, damage, privacy and disputes continue afterwards.']]]},
{id:'tos8',h:'8. Arkila\'s role, liability and indemnity',b:[
 ['ol',[
  '**A rental marketplace.** Arkila lists vehicles and gives renters a standard process. We do not guarantee any vehicle, trip or outcome.',
  '**Checks have limits.** Our checks of vehicles and renters are basic. They do not guarantee a vehicle\'s condition or a renter\'s behaviour.',
  '**Our responsibility.** We take reasonable care in running the service. To the extent the law allows, Arkila is not liable for losses such as vehicle damage, injury, theft or delay, and our liability for a booking is limited to [the amount the renter paid for it], except for anything the law does not allow to be limited.',
  '**What is never limited.** Nothing here limits liability for fraud, intentional wrongdoing, or anything the law does not allow to be limited.',
  '**Indemnity.** [Each renter agrees to cover Arkila\'s reasonable losses from a third party\'s claim caused by that renter\'s breach of these terms or unlawful act.]',
  '**Service availability.** The site may go down or change. We do not promise it will always be available.']]]},
{id:'tos9',h:'9. Privacy, notices, changes, law and contact',b:[
 ['ul',[
  '**Privacy.** We collect the personal data needed to run bookings and explain it in the Arkila Privacy Notice, which follows the Philippine Data Privacy Act. We do not sell your data.',
  '**Notices.** Requests, questions and support happen on Facebook Messenger or by phone. Keep your contact details up to date.',
  '**Changes.** We may update these terms. For changes that matter, we give at least [14] days\' notice on the site. Bookings already confirmed keep the terms they were made under.',
  '**Governing law.** Philippine law applies. [Courts of Puerto Princesa City, Palawan.]',
  '**If one part fails.** If a court finds part of these terms unenforceable, the rest still applies.',
  '**Language.** [A Filipino version will be provided. If they differ, the version you agreed to applies.]',
  '**Contact.** [Business name], [address], [email], [phone], [Facebook page].']]]}
];

/* ---------------- Privacy Notice ---------------- */
const PRIVACY=[
{id:'pv0',h:'About this notice',b:[
 ['p','This notice explains what personal information Arkila collects when you request a car or motorbike in Puerto Princesa, why we need it, who sees it, and your rights. It follows the Philippine Data Privacy Act of 2012 (Republic Act 10173). Highlighted items are decisions still to be made.'],
 ['p','**In short:** we collect only what we need to run your request and rental. We do not sell your data.'],
 ['p','**Who we are.** [Business name], Puerto Princesa, Palawan, Philippines, is the personal information controller. Data Protection contact: [name or "Arkila owner"], [email], [phone].']]},
{id:'pv1',h:'1. What we collect',b:[
 ['ul',['Name, mobile number and email that you type into a request.','Your pickup place, dates, time and any note you add.','Your Facebook or Messenger name and messages, if you contact us there.','At pickup: your licence and ID shown to us, and handover photos, fuel and odometer records and any accident or damage report. [Decide whether Arkila keeps copies of ID and licence photos.]','Payment details Arkila records: the amount, date, method and reference. We do not store card numbers or wallet passwords.','Basic technical data such as browser type, and the preferences stored on your own device (section 6).'],],
 ['p','We do not knowingly collect data from anyone under 18.']]},
{id:'pv2',h:'2. Why we collect it',b:[
 ['p','We use your information only to:'],
 ['ul',['reply to your request and confirm your booking on Messenger;','check that renters are allowed to drive the vehicle;','prepare the handover, take payment, and keep records of who paid what;','settle accidents, damage claims and disputes fairly, using photos and checklists;','keep the service safe: stop fake requests, fraud and misuse;','meet our legal duties, such as tax and accounting records.']],
 ['p','**Our basis.** We process your information because you agree to it when you tick the renter notice and send a request, because we need it to carry out the booking you asked for, and because we have a legitimate interest in preventing fraud. You may withdraw your consent, but then we cannot complete a booking that needs that information.']]},
{id:'pv3',h:'3. Who sees your information',b:[
 ['ul',['**Arkila** sees everything above, only for the purposes in section 2.','**The vehicle owner** may see your name, contact number and dates once the booking is confirmed. They do not get your ID or licence photos unless needed to settle a dispute.','**Payment providers** such as GCash or a bank see what they need to move the money, under their own privacy rules.','**Authorities and courts** if the law requires it, for example after an accident or theft.','**Our own helpers**, such as a lawyer or accountant, only as needed and under a duty to keep it confidential.','**Service providers that run the website**: Supabase (database, Singapore) stores requests; Meta (Facebook Messenger) carries the messages you send us; GitHub Pages hosts the site; Google Fonts and Cloudflare (cdnjs) deliver fonts and the map code, and see your device\'s internet address when the page loads. Some of these are outside the Philippines. [Lawyer: confirm the cross-border transfer wording.]'],],
 ['p','**Map and place search.** When you type a place in the search bar, the text is sent to OpenStreetMap-based search services (Photon, run by komoot) to show suggestions. When you drop a pin, its map position is sent to the same service to look up the place name. The map tiles come from OpenStreetMap. We do not send your name or contact details to them.'],
 ['p','We do not sell your data and we do not use it for advertising by other companies.']]},
{id:'pv4',h:'4. How long we keep it',b:[
 ['ul',['**Request details and messages:** kept [1 year] after the rental, in case of a later claim, then deleted.','**Handover and damage photos and checklists:** kept [1 year] after the rental, then deleted. If there is an open claim or dispute, we keep them until it is settled.','**ID and licence copies, if any are kept:** deleted [90 days] after the rental ends, unless there is an open claim.','**Booking and payment records:** kept as long as tax and accounting rules require. [Period to be confirmed.]'],],
 ['p','When the time is up we delete the files and remove them from our backups where we can.']]},
{id:'pv5',h:'5. How we protect it',b:[
 ['ul',['Any ID or licence photos are stored in [a private, access-controlled place] and never on a public page.','Only [the Arkila owner and named helpers] can open them, and only to do the jobs in section 2.','We use strong passwords and two-step sign-in on the accounts that hold your data.','If there is a data breach that puts you at real risk, we will tell you and the National Privacy Commission as the law requires.']]]},
{id:'pv6',h:'6. Website storage',b:[
 ['p','The Arkila website saves some choices, such as language, currency, your saved details and saved vehicles, on your own device. It does not send them to us unless you send a request. You can clear them in your browser settings.'],
 ['p','**Where requests are kept.** When you send a request, your name, mobile number, optional email, dates, pickup and trip details are stored in Arkila\'s online database (Supabase, servers in Singapore), so the Arkila team can see and confirm it. Only signed-in Arkila staff can read it. A copy also stays on your device so you can follow your request. [Confirm retention period and storage location with your lawyer.]']]},
{id:'pv7',h:'7. Your rights',b:[
 ['p','Under the Data Privacy Act you can:'],
 ['ul',['**be informed** about how we use your data, which is what this notice does;','**access** the data we hold about you and get a copy;','**correct** anything wrong or out of date;','**object** to how we use it, or withdraw your consent, as long as we are not required to keep it;','**ask us to delete or block** your data when it is no longer needed, was collected unlawfully, or you withdraw consent, apart from records the law or an open claim requires us to keep;','**move your data** in a common format where it applies;','**claim damages** if you are harmed by inaccurate, unlawfully obtained or misused data;','**complain** to us first, and to the National Privacy Commission (privacy.gov.ph) if we do not resolve it.']],
 ['p','**How to use them.** Message us at [email] or [phone] with your name and the booking. We reply within [15] days. We may ask you to prove it is you before we release or delete anything.']]},
{id:'pv8',h:'8. Changes and contact',b:[
 ['p','**Changes.** We may update this notice. For changes that matter, we tell you on the site before they apply, and the date at the top changes.'],
 ['p','**Contact.** [Business name], [address], [email], [phone], [Facebook page].']]}
];

function legalBlock(b){
  const [k,v]=b;
  if(k==='p')return `<p>${phf(v)}</p>`;
  if(k==='h')return `<h3 class="h3">${esc(v)}</h3>`;
  if(k==='ul')return `<ul class="lg">${v.map(x=>`<li>${phf(x)}</li>`).join('')}</ul>`;
  if(k==='ol')return `<ol class="lg">${v.map(x=>`<li>${phf(x)}</li>`).join('')}</ol>`;
  if(k==='notice'){const n=v==='host'?hostDeclaration():renterNotice(null,null);let i=0;return `<p>${esc(n.intro)}</p>`+n.groups.map(g=>`<p><strong>${esc(g.h)}</strong></p><ol class="lg nl" start="${i+1}">${g.items.map(x=>{i++;return `<li>${phf(x)}</li>`}).join('')}</ol>`).join('')+`<p>${esc(n.foot)}</p>`}
  return '';
}
function renderLegal(kind){
  const isT=kind==='terms',secs=isT?TERMS:PRIVACY,el=$('#v-'+kind);
  el.innerHTML=`<h1>${isT?'Terms of Service':'Privacy Notice'}</h1><p class="lead">${isT?'How renting a vehicle through Arkila works in Puerto Princesa.':'What we collect, why, who sees it, and your rights.'} Last updated ${esc(fmtEn(LEGAL_VERSION))}.</p>
  <div class="banner">Draft for review. Highlighted items in [brackets] are decisions still to be made, and a Philippine lawyer will check this before real bookings start.</div>
  <section class="step legal"><h2>Contents</h2><ol class="toc">${secs.map(s=>`<li><a href="#${kind}" data-lsec="${s.id}">${esc(s.h)}</a></li>`).join('')}</ol></section>`+
  secs.map(s=>`<section class="step legal" id="${s.id}"><h2>${esc(s.h)}</h2>${s.b.map(legalBlock).join('')}</section>`).join('');
}
document.addEventListener('click',e=>{const a=e.target.closest('[data-lsec]');if(!a)return;e.preventDefault();const s=document.getElementById(a.dataset.lsec);if(s)s.scrollIntoView({behavior:'smooth',block:'start'})});
