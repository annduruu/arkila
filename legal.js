/* Public legal text: Terms of Service, Privacy Notice, renter notice and owner declaration.
   English is the version people agree to. Items in [square brackets] are decisions still to be made and show highlighted.
   Keep this file in step with the Terms of Service and Privacy Notice documents. A Philippine lawyer should review it before real payments. */
const LEGAL_VERSION='2026-11-03';

const phf=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\[([^\]]+)\]/g,'<mark class="ph">[$1]</mark>');
const money0=n=>'₱'+Number(n).toLocaleString('en-PH');
const capOf=c=>SETTINGS.damageCap[(c&&isMotor(c))?'motor':'car'];

/* ---------------- renter notice and owner declaration ---------------- */
function renterNotice(c,ctx){
  const fig=ctx?`For this booking, the rental fee is **${money0(ctx.total)}**, the refundable security deposit is **${money0(ctx.dep)}**, and the total you pay online is **${money0(ctx.total+ctx.dep)}**. The damage cap for this vehicle is **${money0(capOf(c))}**.`:`The listing and your confirmation offer show the rental fee, the refundable security deposit and the damage cap for your vehicle. Default amounts: deposit ${money0(SETTINGS.deposit.car)} for cars and ${money0(SETTINGS.deposit.motor)} for motorbikes, damage cap [${money0(SETTINGS.damageCap.car)} for cars and ${money0(SETTINGS.damageCap.motor)} for motorbikes].`;
  return {title:'Renter notice',
  intro:'Please read this properly. It is the most important part of your booking. By ticking the box you confirm every point below. If you do not understand a point, ask Arkila before you tick.',
  groups:[
  {h:'1. Money',items:[
   'You pay Arkila online (GCash, Maya or another method Arkila lists) the rental fee plus a refundable security deposit, after the owner confirms the vehicle is free for your dates. There is no pay-later and no cash at pickup. Arkila holds this money in [a business account used only for booking funds] until the handover.',
   fig,
   'Your deposit comes back within [5 days] after you return the vehicle, less any damage, fuel or fine the owner claims within [24 hours] of return with dated photos. Only the claimed amount stays held until the claim is settled. The rest is still returned within the [5 days].',
   `If damage costs more than your deposit, you pay the difference, up to the damage cap, within [7] days of Arkila's decision. Arkila will help the owner collect it but does not guarantee any amount above the deposit. [The cap may not apply if the damage came from a breach such as drunk riding or unauthorised use: decide.]`,
   `Cancelling: if you cancel [14] or more days before pickup you get a full refund of the rental fee. If you cancel [7 to 13] days before, the owner may keep [20%] of the rental fee. If you cancel [2 to 6] days before, the owner may keep [50%]. If you cancel with less than [48 hours] to go, or do not show up, the owner may keep up to [100%], but never more than [3] days' rental. Arkila refunds the rest to the method you paid with, less a [5%] processing fee. Your deposit is always refunded in full when you cancel before pickup. If you book less than [48 hours] before pickup, you can cancel free of charge only within [1 hour] of paying. The listing shows the final rules.`,
   `You also pay traffic fines, tolls, parking and any fuel shortfall during the rental. Late returns are charged at the daily rate in the listing after [30 minutes'] grace. Ask the owner before the end time if you need more days, and pay any extension online to Arkila.`]},
  {h:'2. Insurance and risk',items:[
   'Arkila does not provide insurance. It does not insure the vehicle, you, your passenger or anyone you might harm. The deposit and the damage cap cover damage to the vehicle only. They do not cover injury, medical costs, harm to other people or their property, or loss of your belongings.',
   `We advise you to buy your own travel and medical insurance before you ride or drive. You are responsible for your own injuries and for harm you cause to others, as the law provides. The owner may have their own policy, but it may exclude rentals, so ask.`,
   'You know that riding or driving carries real risks, including collision, falling, skidding on wet or unpaved roads, animals on the road, theft, damage, bad weather including typhoons, and injury or death. A motorbike gives you no protection in a crash. You accept these risks.']},
  {h:'3. Licence and legal use',items:[
   `You hold a valid licence for this type of vehicle. For a motorbike you need a motorcycle licence, and a car licence alone is not enough. A foreign licence must be in English, or come with an official translation or an International Driving Permit shown with your home licence. It is generally accepted for up to 90 days from your arrival. Longer stays need a Philippine LTO licence.`,
   `You are 18 or older for motorbikes [and 21 or 25 for cars: decide]. The licence and ID you upload are real and yours, and Arkila may refuse a booking if the checks do not pass.`,
   `You wear an approved helmet and require your passenger to wear one, as Philippine law requires. You follow traffic laws, carry no more riders or passengers than the listing allows, and do not ride or drive under the influence of alcohol or drugs. You do not race, tow, sublet or lend the vehicle. Only the renter named in the rental agreement drives or rides, unless the owner allows another person in writing. You do not take the vehicle off-road or outside Palawan unless the owner allows it in writing.`,
   'You return the vehicle on time, in the condition you received it apart from normal wear, with the agreed fuel level.']},
  {h:'4. Pickup, return and payout',items:[
   `At pickup you and the owner complete Arkila's handover checklist together. You photograph any existing damage, record the fuel level and odometer, and check the brakes, lights, tyres and horn, and the helmets for motorbikes. Do not take a vehicle you think is unsafe. The checklist and dated photos are the evidence used in any damage claim.`,
   'You complete the checklist again at return. Normal wear and tear is not damage.',
   `Arkila pays the owner 24 hours after pickup unless you report a problem. A problem means the vehicle is not as listed, is unsafe, or the handover did not happen as recorded. Report it within those 24 hours on Messenger or the number Arkila gives you. If you report one, the payout waits for Arkila's decision.`]},
  {h:'5. If something goes wrong',items:[
   'Accident: get safe and get medical help first. Call the police for any accident with injury, a third party or major damage. Tell the owner and Arkila as soon as you can and take photos.',
   `Theft or lost keys: report it to the police within [24 hours], and tell the owner and Arkila immediately. You pay for theft as set out under costs you cover in the Terms, up to the damage cap, unless you followed the checklist and reported promptly. [Decide: whether prompt reporting reduces the charge.]`,
   'Breakdown: if the vehicle breaks down or becomes unsafe through no fault of yours, tell the owner and Arkila straight away. The owner fixes or swaps the vehicle where possible. If not, Arkila refunds the unused days and you are not charged for the breakdown.',
   `Disputes: renter and owner try to settle first. Arkila then looks at the photos, the checklist and the messages and decides how the money it holds is released, within [3] working days and with reasons. You have [48] hours to reply to a damage claim. You can still take the matter to court.`]},
  {h:'6. Your information',items:[
   `Arkila keeps your ID and licence photos secure, uses them only for the booking and its checks, shares your name and contact number with the owner only once the booking is confirmed, and deletes them as set out in the Privacy Notice.`]},
  {h:'7. What Arkila is',items:[
   `Arkila is a booking and payment service. It is not the owner and is not a party to the rental contract between you and the owner. It does not guarantee any vehicle, owner or outcome, and its checks are basic. Arkila's liability is limited as set out in the Terms of Service, but never for fraud, intentional wrongdoing, or anything the law does not allow to be limited. Arkila must release or return the money it holds as the Terms set out.`,
   'You have read this in a language you understand and you agree freely.']}],
  foot:`Each of us is responsible for our own acts. Nothing here limits any liability that the law does not allow to be limited, including liability for fraud or intentional wrongdoing. You will see the price, deposit, damage cap and cancellation rules again before you pay, and confirm again then.`};
}

function hostDeclaration(){
  return {title:'Owner declaration',
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

function noticeHtml(kind,ctx){
  const h=kind==='host',n=h?hostDeclaration():renterNotice(ctx&&ctx.c,ctx);
  let k=0;
  const fil=(PREF.lang==='fil')?`<div class="banner" style="margin:10px 0"><b>Buod sa Filipino.</b> ${esc(t(h?'nt.hintro':'nt.rintro'))}<ol>${Array.from({length:h?5:6},(_,i)=>`<li>${esc(t((h?'nt.h':'nt.r')+(i+1)))}</li>`).join('')}</ol><span class="note">${esc(t('nt.fullen'))}</span></div>`:'';
  return `<h2 id="ntitle">${esc(n.title)}</h2><p style="margin:0">${esc(n.intro)}</p>${fil}`+n.groups.map(g=>`<h3 class="h3">${esc(g.h)}</h3><ol class="nl" start="${k+1}">${g.items.map(x=>{k++;return `<li>${phf(x)}</li>`}).join('')}</ol>`).join('')+`<p>${esc(n.foot)}</p><p class="note">${esc(t(h?'nt.hnote':'nt.rnote'))} <a href="#terms" target="_blank" rel="noopener">${esc(t('ack.terms'))}</a> · <a href="#privacy" target="_blank" rel="noopener">${esc(t('nt.privacy'))}</a></p><div class="stack"><button type="button" class="btn" data-nclose>${esc(t('close'))}</button></div>`;
}

/* ---------------- Terms of Service ---------------- */
const TERMS=[
{id:'tos1',h:'1. About these terms',b:[
 ['p','By using Arkila\'s website or sending a request, you agree to these terms. Items in [brackets] are decisions still to be made.'],
 ['ul',[
  '**Who we are.** Arkila is [Business name], based in Puerto Princesa, Palawan, Philippines. Contact: [email], [phone], [Facebook page].',
  '**What Arkila does.** Arkila is a booking service for cars and motorbikes. We list vehicles, pass renter requests to owners, check owners\' and renters\' documents, prepare the rental agreement and handover checklist for every booking, and confirm bookings. Owners and renters follow Arkila\'s standards, and Arkila handles the process and paperwork so owners don\'t have to.',
  '**What Arkila does not do.** We do not own, drive, inspect or insure the vehicles. The rental contract is between the renter and the owner. Arkila is not a party to it, but acts as the booking and payment agent: it prepares the paperwork, holds the money for both sides, and decides how held money is released if there is a dispute. The rental fee and deposit are paid online up front to Arkila, which holds them as set out in sections 4 and 9. This is a payment hold, not insurance.',
  '**Words we use.** Renter: a person who requests a vehicle. Owner: a person who lists a vehicle. Listing: a vehicle\'s page, with its price, deposit and rules. Request: a renter\'s request for dates. Booking: a request that Arkila has confirmed after the owner confirmed availability and the renter paid.',
  '**Who can use Arkila.** You must be 18 or older and able to make a binding contract. You must give true information about yourself.']]]},
{id:'tos2',h:'2. Renter terms',b:[
 ['p','As a renter you are responsible for how you use the vehicle and for keeping to this section.'],
 ['ol',[
  '**Eligibility.** You must be 18 or older for motorbikes [and 21 or 25 for cars: decide]. You must hold a valid licence for the vehicle type. A foreign licence must be in English, or come with an official translation or an International Driving Permit shown with your home licence, and is generally accepted for up to 90 days from arrival. Longer stays need a Philippine LTO licence.',
  '**Identity.** Upload your licence and a valid ID before booking, and show them at pickup. Foreign renters show a passport. Filipino renters show two valid government IDs.',
  '**Requests are not bookings.** A booking exists only when Arkila confirms it after the owner confirms availability and the renter pays. The owner may decline a request.',
  '**Pickup and handover.** Complete Arkila\'s handover checklist with the owner: photograph any existing damage, and record the fuel level and odometer. Do not take a vehicle you think is unsafe, and tell the owner and Arkila if you find a problem.',
  '**Using the vehicle.** Follow traffic laws. Wear an approved helmet, and require your passenger to wear one. Do not carry more riders or passengers than the listing allows. Do not ride or drive under the influence, race, tow, sublet, or use the vehicle off-road or outside Palawan unless the owner allows it in writing. Only the renter named in the rental agreement drives or rides, unless the owner allows another person in writing.',
  '**Care and return.** Return the vehicle on time, in the condition you received it apart from normal wear, with the agreed fuel level. If you will be late, tell the owner first.',
  '**Costs you cover.** You pay for damage, theft, fuel shortfalls, traffic fines and tolls during the rental. Damage is covered first from your deposit, then up to the damage cap shown on the listing and in your rental agreement. You keep paying the daily rate while the vehicle is out of service because of damage you caused.',
  '**Your own insurance.** Arkila does not yet provide insurance. Your deposit and the damage cap cover damage to the vehicle only. We recommend you buy travel and medical insurance. You are responsible for your own injuries and for harm you cause to others, as the law provides.',
  '**Risk.** You know that riding or driving carries real risks, including collision, falling, theft, damage, road conditions, weather and injury, and you accept them as described in the renter notice in section 7.']]]},
{id:'tos3',h:'3. Owner terms',b:[
 ['p','As an owner you rent your vehicle to renters under these terms and Arkila\'s owner standards. Arkila prepares the rental agreement, handover checklist and renter checks for each booking, so your job is to meet the standards below.'],
 ['ol',[
  '**Right to rent.** You own the vehicle or have the owner\'s written permission to rent it out. Its registration is current, and you tell Arkila whether it is registered as private or for hire. You can show your OR/CR on request. [Arkila to confirm whether vehicles must be registered for hire before they can be rented out.]',
  '**Owner checks.** Before a listing goes live, you give Arkila your ID, a photo of your registration, and four real photos of the vehicle. Arkila may ask for more.',
  '**Honest listings.** Photos are real and yours to use. Price, seats or riders, transmission, fuel, mileage, deposit, rules and existing damage are stated accurately. Do not call a vehicle safe, insured or inspected unless that is true.',
  '**Roadworthy.** The vehicle has working brakes, lights, tyres and horn, and is safe to use on public roads. For motorbikes you supply one approved helmet per rider.',
  '**Handover.** You complete Arkila\'s handover checklist with the renter at pickup and return, with dated photos of condition, fuel and odometer.',
  '**Responding.** You reply to availability checks within [2 hours] between [8am and 8pm], or mark the vehicle unavailable. Avoid cancelling a confirmed booking except for a real emergency. Repeated cancellations may lead to suspension.',
  '**Insurance.** Arkila does not yet provide insurance. Damage is covered by the renter\'s deposit and the damage cap shown on the listing and in the agreement. You check what your own policy covers when the vehicle is rented, and you tell renters about any exclusions.',
  '**Laws, permits and tax.** You are responsible for any licences, permits and taxes that apply to renting out your vehicle in the Philippines. Arkila does not give tax or legal advice.',
  '**Treating renters fairly.** No discrimination, harassment or hidden charges. Charges beyond the listing are not allowed unless the renter agreed in advance.',
  '**Renters\' details.** Use a renter\'s name, contact number and dates only for that booking. Do not share them or keep them afterwards.']]]},
{id:'tos4',h:'4. Booking, payment and cancellation',b:[
 ['p','The rental fee and deposit are paid online up front to Arkila, which holds them until handover and releases them as set out here and in section 9. This payment hold is not insurance.'],
 ['ol',[
  '**Owner approval.** Each vehicle is approved by Arkila and its owner before it is listed.',
  '**Request.** The renter picks dates on the vehicle\'s calendar. Dates already booked or blocked are greyed out and cannot be picked. The renter sends contact details and the documents Arkila asks for.',
  '**Document check.** Arkila checks the renter\'s licence and ID and tells the renter if they are approved.',
  '**Availability.** Arkila asks the owner to confirm the vehicle is free for those dates. The owner replies within [2 hours] or the request lapses.',
  '**Confirmation offer.** Arkila sends the renter an invoice by email with the price, the deposit, the damage cap, the cancellation rules, and the terms and renter notice in section 7.',
  '**Agree and pay.** The renter ticks the renter notice in section 7, then pays the rental fee and deposit to Arkila online (GCash or another method Arkila lists). The dates are held for [2 hours] while the renter pays. Pay-later and cash at pickup are not used.',
  '**Booking final.** When payment arrives, Arkila emails the renter a booking confirmation and receipt, confirms the booking, blocks the dates on the calendar, and sends both sides the rental agreement and handover checklist.',
  '**Handover and payout.** Renter and owner complete the handover checklist at pickup. Once both confirm the vehicle is in use, the renter has 24 hours to report a problem: the vehicle is not as listed, is unsafe, or the handover did not happen as recorded. If there is no report, Arkila pays the owner the rental fee minus the Arkila fee when that window ends. If only one side confirms, Arkila releases the payout 24 hours after the pickup time only if the handover checklist with dated photos has been submitted and the renter has not reported a problem. Without the checklist, Arkila contacts both sides before releasing anything. If the renter reports a problem, the dispute rules in section 7 apply, and the payout waits for the decision.',
  '**Deposit.** The deposit stays with Arkila during the rental. If the owner claims damage, fuel or fines within [24] hours of return, Arkila returns the deposit minus the amount claimed within [5 days] of return, and the claimed amount stays held until the claim is agreed or decided. If there is no claim, the full deposit is returned within [5 days]. Charges need photos as proof.',
  '**Renter cancellation.** The rental fee is refunded by how early the renter cancels before pickup: [14] or more days, full refund; [7 to 13] days, the owner may keep [20%]; [2 to 6] days, the owner may keep [50%]; less than [48 hours], or a no-show, the owner may keep up to [100%], capped at [3] days\' rental. A booking made less than [48 hours] before pickup can be cancelled free of charge only within [1 hour] of payment. Arkila refunds the rest by the same method the renter paid with, less a [5%] processing fee. The deposit is always refunded in full when a renter cancels before pickup. No-show: [the owner holds the vehicle for 2 hours, then it counts as a no-show]. The owner reports the no-show with a photo or screenshot, the renter has [24] hours to dispute it, and then Arkila pays the owner the kept amount and refunds the rest, including the deposit. Final rules are shown on each listing.',
  '**Owner cancellation.** If an owner cancels, the renter gets a full refund within [3] days, and Arkila helps find a similar vehicle where possible.',
  '**24-hour days.** Each rental day is 24 hours from the pickup time the renter chose. The renter returns the vehicle at the same time on the last day. Arkila keeps a [3-hour] break between two rentals of the same vehicle for cleaning, checks and fuel, so a booking cannot start or end inside that break.',
  '**Late return and extensions.** Ask the owner before the end time. Late returns are charged at the rate in the listing, after [30 minutes\'] grace.',
  '**Breakdown.** If the vehicle breaks down or becomes unsafe through no fault of the renter, the renter tells the owner and Arkila straight away. The owner fixes or swaps the vehicle where possible. If not, Arkila refunds the unused days, and the renter is not charged for the breakdown. If the owner has already been paid, Arkila refunds the renter first and may deduct that amount from the owner\'s later payouts. If the owner has no later payouts, the owner repays it within [7] days. If the renter caused it, section 2 applies.',
  '**Bad weather.** [If typhoon warnings stop travel, the booking is moved or refunded. Decide.]',
  '**Refunds and other money details.** Arkila refunds by the same method the renter paid with. Payment gateway or transfer fees, if any, are [shown to the renter before paying, or paid by Arkila: decide]. If a payment fails, is reversed or charged back, the booking is cancelled unless the renter pays again, and Arkila may deduct any amount already paid out for it from the owner\'s later payouts. Extensions are paid online to Arkila before the original end time, on the same terms. If Arkila suspends a listing, its confirmed bookings are honoured or refunded in full. If the owner keeps a cancellation fee, Arkila\'s fee applies to it as it does to the rental fee.']]]},
{id:'tos5',h:'5. Reviews, photos and content',b:[
 ['ul',[
  '**Honest reviews.** After a rental, renter and owner may review each other. Reviews must be truthful, from a real booking, and free of abuse or private information. No paid or fake reviews. Arkila may remove reviews that break these rules.',
  '**Your content.** You keep ownership of the photos and text you upload. You give Arkila permission to show them on its website, Facebook and Instagram pages and in the app to promote the listing, for as long as the listing is live.',
  '**Only upload what you own.** Upload only photos and text you made or have permission to use. You are responsible for any claim that your content infringes someone else\'s rights.',
  '**Arkila\'s name and logo.** Do not use Arkila\'s name or logo in a way that suggests we endorse you beyond your listing.']]]},
{id:'tos6',h:'6. Fees and platform rules',b:[
 ['ol',[
  '**Arkila fee.** Arkila deducts its fee [10% of the rental fee, with a ₱100 minimum] from the owner\'s payout for each booking that came through Arkila. Renters pay no fee to Arkila in Phase 1.',
  '**No bypassing.** Do not use Arkila to meet a renter or owner and then book or pay outside Arkila to avoid the fee. If you do, the owner still owes the fee, and Arkila may suspend the account.',
  '**No fake or duplicate accounts.** One person, one account, real details only.',
  '**No fake listings.** No listings for vehicles you do not have, or that are stolen, unregistered, or unsafe.',
  '**No scraping or misuse.** Do not copy the site\'s data in bulk, break its security, or send spam.',
  '**Keep it lawful.** No use of Arkila for anything illegal, abusive or harmful, including harassment of other users.',
  '**Changes to fees.** Arkila will tell owners at least [14] days before a fee change.']]]},
{id:'tos7',h:'7. Accidents, damage reports, notice and disputes',b:[
 ['h','Accidents'],
 ['ol',['Get safe and get medical help first.','Call the police for any accident with injury, a third party, or major damage.','Tell the owner and Arkila as soon as you can, and take photos.','If the vehicle is stolen or the keys are lost, tell the police and report it within [24] hours, and tell the owner and Arkila immediately. Costs are handled under "Costs you cover" in section 2, up to the damage cap, unless the renter followed the checklist and reported it promptly. [Decide: whether prompt reporting reduces the charge.]']],
 ['h','Damage reports'],
 ['ol',['The owner reports damage within [24] hours of return, with dated photos from the handover and return.','The renter has [48] hours to reply. Charges are limited to repair cost with a receipt or quote, up to the damage cap shown on the listing and in the rental agreement.','Normal wear and tear is not damage.']],
 ['h','Damage cover and insurance'],
 ['ol',['The renter\'s deposit covers damage first. The agreement Arkila prepares also sets a damage cap [amount, by vehicle type: decide], the most the renter pays for damage in one rental [unless the damage came from a breach such as drunk riding or unauthorised use: decide]. If damage costs more than the deposit, the renter pays the difference, up to the damage cap, within [7] days of Arkila\'s decision. Arkila will help the owner collect it, but Arkila does not guarantee payment of any amount above the deposit.','Arkila does not yet provide insurance. The deposit and the cap do not cover injuries or harm to other people.','[Later: Arkila plans to add insurance through an insurer partner, as an add-on or part of the service fee. These terms will be updated first.]','Owners check what their own insurance covers and tell renters about any exclusions.']],
 ['h','Renter notice'],
 ['notice','renter'],
 ['h','Owner declaration'],
 ['notice','host'],
 ['h','For both sides'],
 ['p','Each of us is responsible for our own acts. Nothing here limits any liability that the law does not allow to be limited, including liability for fraud or intentional wrongdoing.'],
 ['h','Disputes'],
 ['p','Renter and owner try to settle first. Arkila looks at the photos, handover checklist and messages and decides how the money it holds is released, as set out in section 9. Either side may still take the matter to court. [If it is not settled: courts of Puerto Princesa City.]']]},
{id:'tos8',h:'8. Suspension and ending an account',b:[
 ['ul',[
  '**You can leave.** You can stop using Arkila or ask us to close your account at any time. Confirmed bookings still need to be honoured or properly cancelled first.',
  '**We can suspend or remove.** Arkila may pause or remove a listing or account that breaks these terms, puts people at risk, gives false information, or has repeated complaints. Where we can, we tell you why and let you respond.',
  '**What survives.** Duties about money owed, damage, privacy and disputes continue after an account ends.']]]},
{id:'tos9',h:'9. Arkila\'s commitments',b:[
 ['p','Because Arkila holds the money and runs the process, it holds itself to these rules. Payment protection here means money held until handover. It is not insurance.'],
 ['ol',[
  '**Separate account.** Booking money is held in [a registered business account used only for booking funds] and is not used for Arkila\'s own costs until it is released.',
  '**Records.** Arkila keeps a record of every booking: who paid what and when, and when it was released or refunded.',
  '**Release to owner.** The owner is paid 24 hours after the handover is confirmed (or 24 hours after the pickup time if only one side confirmed), unless the renter has reported a problem. An owner\'s confirmation alone, without the handover checklist, never releases the payout.',
  '**Deposit return.** The deposit is returned within [5 days] after the return, less the amount the owner has claimed with documents. The claimed amount stays held until decided.',
  '**Failed handover.** If the vehicle is not as listed or is unsafe, the renter does not have to take it. The rental fee and the deposit are refunded within [3] days, and Arkila reviews the owner.',
  '**Fair decisions.** In a dispute, Arkila reviews the photos, the handover checklist and the messages, applies the same rules to both sides, and decides within [3] working days with reasons. Arkila\'s fee does not depend on who wins. Each side has [3] days to reply when Arkila asks for other information; if a side does not reply, Arkila decides on the evidence it has. Money in dispute is released as decided, or as a court orders if either side goes to court.',
  '**Honest claims.** Arkila says what it checks and what it does not. It does not call itself insurance or promise safety or outcomes it cannot control.',
  '**Real checks.** Arkila does the document and listing checks it says it does, and removes fake or unsafe listings promptly.',
  '**Privacy.** Arkila keeps documents and photos secure, uses them only for the booking and its checks, and deletes them as set out in the Privacy Notice.',
  '**If Arkila gets it wrong.** If Arkila fails to release or return money as set out here, Arkila corrects it promptly and pays what is owed. [Exact remedy and any limit to be confirmed.]']]]},
{id:'tos10',h:'10. Arkila\'s role, liability and indemnity',b:[
 ['ol',[
  '**A booking service.** Arkila helps renters and owners find each other and gives them a standard process. We do not guarantee any vehicle, owner, renter, trip or outcome.',
  '**Checks have limits.** Our owner checks are basic. They do not guarantee a vehicle\'s condition, an owner\'s honesty or a renter\'s behaviour.',
  '**Our responsibility.** We take reasonable care in running the service. To the extent the law allows, Arkila is not liable for losses between renter and owner, such as vehicle damage, injury, theft or delay, and our liability for a booking is limited to [the fee Arkila received for it], except for money Arkila holds for that booking, which Arkila must release or return as set out in section 9.',
  '**What is never limited.** Nothing here limits liability for fraud, intentional wrongdoing, or anything the law does not allow to be limited.',
  '**Indemnity.** [Each user agrees to cover Arkila\'s reasonable losses from a third party\'s claim caused by that user\'s breach of these terms or unlawful act.]',
  '**Service availability.** The site may go down or change. We do not promise it will always be available.']]]},
{id:'tos11',h:'11. Privacy, notices, changes, law and contact',b:[
 ['ul',[
  '**Privacy.** We collect the personal data needed to run bookings and explain it in the Arkila Privacy Notice, which follows the Philippine Data Privacy Act. We do not sell your data.',
  '**Notices.** Requests, questions and support happen on Facebook Messenger or by phone. Invoices and booking confirmations, including receipts, cancellations and refunds, are sent to the email you gave us, and that email is the official record of the booking. Keep your email and phone up to date, and check your spam folder.',
  '**Changes.** We may update these terms. For changes that matter, we give at least [14] days\' notice on the site and by message. If you keep using Arkila after that, you accept the new terms. Bookings already confirmed keep the terms they were made under.',
  '**Governing law.** Philippine law applies. [Courts of Puerto Princesa City, Palawan.]',
  '**If one part fails.** If a court finds part of these terms unenforceable, the rest still applies.',
  '**Language.** [A Filipino version will be provided. If they differ, the version you agreed to applies.]',
  '**Contact.** [Business name], [address], [email], [phone], [Facebook page].']]]}
];

/* ---------------- Privacy Notice ---------------- */
const PRIVACY=[
{id:'pv0',h:'About this notice',b:[
 ['p','This notice explains what personal information Arkila collects when you rent or list a car or motorbike in Puerto Princesa, why we need it, who sees it, and your rights. It follows the Philippine Data Privacy Act of 2012 (Republic Act 10173). Items in [brackets] are decisions still to be made.'],
 ['p','**In short:** we collect only what we need to check renters and owners, run the booking, hold and pay money, and settle disputes. We do not sell your data. Your ID and licence photos are seen only by Arkila, never posted publicly, and deleted when we no longer need them.'],
 ['p','**Who we are.** [Business name], Puerto Princesa, Palawan, Philippines, is the personal information controller. Data Protection contact: [name or "Arkila owner"], [email], [phone].']]},
{id:'pv1',h:'1. What we collect',b:[
 ['h','From renters'],
 ['ul',['Name, mobile number, email, and Facebook or Messenger name if you contact us there.','Your driver\'s licence and a valid ID (passport for foreign renters, two government IDs for Filipino renters), as photos or scans.','Booking details: vehicle, dates, pickup and return, and what you tell us about your trip.','Handover and return photos, fuel and odometer records, and any accident or damage report.','Payment details: the amount, date, method and reference. We do not store card numbers or wallet passwords.']],
 ['h','From owners'],
 ['ul',['Name, mobile number, email and ID.','A photo of the vehicle\'s registration (OR/CR) and real photos of the vehicle.','Payout details, such as your GCash number or bank account name, so we can pay you.']],
 ['h','From the site'],
 ['ul',['Basic technical data such as browser type and the pages you use, and the preferences stored on your own device (section 7).']],
 ['p','We do not knowingly collect data from anyone under 18.']]},
{id:'pv2',h:'2. Why we collect it',b:[
 ['p','We use your information only to:'],
 ['ul',['check that renters are allowed to drive the vehicle and that owners and vehicles are what they say they are;','run your booking: ask the owner to confirm, prepare the rental agreement and handover checklist, email you the invoice and booking confirmation, and contact you about it;','hold your rental fee and deposit, pay owners, refund renters, and keep records of who paid what;','settle accidents, damage claims and disputes fairly, using photos and checklists;','keep the service safe: stop fake accounts, fake listings, fraud and misuse;','meet our legal duties, such as tax and accounting records.']],
 ['p','**Our basis.** We process your information because you agree to it when you tick the renter notice or owner declaration and send your documents, because we need it to carry out the booking you asked for, and because we have a legitimate interest in preventing fraud. You may withdraw your consent, but then we cannot complete a booking that needs those documents.']]},
{id:'pv3',h:'3. Who sees your information',b:[
 ['ul',['**Arkila** sees everything above, only for the purposes in section 2.','**The owner** sees a renter\'s name, contact number and the dates of the booking once it is confirmed. They do not get your ID or licence photos unless Arkila needs them to settle a dispute.','**The renter** sees the owner\'s name, contact number and the vehicle\'s details once the booking is confirmed. They do not get the owner\'s ID or payout details.','**Payment providers** such as GCash or a bank see what they need to move the money, under their own privacy rules.','**Authorities and courts** if the law requires it, for example after an accident or theft.','**Our own helpers**, such as a lawyer or accountant, only as needed and under a duty to keep it confidential. [List any other service Arkila uses to store data, such as a database or messaging tool, before launch.]'],],
 ['p','**Map and place search.** When you type a place in the search bar, the text is sent to OpenStreetMap-based search services (Photon) to show suggestions, and the map tiles come from OpenStreetMap. We do not send your name or contact details to them.'],
 ['p','We do not sell your data and we do not use it for advertising by other companies. We post a vehicle\'s photos and listing details publicly, but never anyone\'s ID, licence or payout details.']]},
{id:'pv4',h:'4. How long we keep it',b:[
 ['ul',['**ID and licence photos:** deleted [90 days] after the rental ends, unless there is an open claim or dispute, in which case we keep them until it is settled and then delete them.','**Handover and damage photos, checklists and messages:** kept [1 year] after the rental, in case of a later claim, then deleted.','**Booking and payment records:** kept as long as tax and accounting rules require. [Period to be confirmed.]','**Owner documents (ID, registration):** kept while the listing is live and for [90 days] after it ends.','**Account details:** kept until you ask us to close your account, apart from the records above.'],],
 ['p','When the time is up we delete the files and remove them from our backups where we can.']]},
{id:'pv5',h:'5. How we protect it',b:[
 ['ul',['ID, licence and registration photos are stored in [a private, access-controlled place] and never on a public page or shared chat.','Only [the Arkila owner and named helpers] can open them, and only to do the jobs in section 2.','We use strong passwords and two-step sign-in on the accounts that hold your data.','We ask owners and renters not to share each other\'s details outside the booking.','If there is a data breach that puts you at real risk, we will tell you and the National Privacy Commission as the law requires.']]]},
{id:'pv6',h:'6. Your rights',b:[
 ['p','Under the Data Privacy Act you can:'],
 ['ul',['**be informed** about how we use your data, which is what this notice does;','**access** the data we hold about you and get a copy;','**correct** anything wrong or out of date;','**object** to how we use it, or withdraw your consent, as long as we are not required to keep it;','**ask us to delete or block** your data when it is no longer needed, was collected unlawfully, or you withdraw consent, apart from records the law or an open claim requires us to keep;','**move your data** in a common format where it applies;','**claim damages** if you are harmed by inaccurate, unlawfully obtained or misused data;','**complain** to us first, and to the National Privacy Commission (privacy.gov.ph) if we do not resolve it.']],
 ['p','**How to use them.** Message us at [email] or [phone] with your name and the booking. We reply within [15] days. We may ask you to prove it is you before we release or delete anything.']]},
{id:'pv7',h:'7. Website storage, changes and contact',b:[
 ['p','**Website storage.** The Arkila website saves some choices, such as language, theme and saved vehicles, on your own device. It does not send them to us. [Update this when Arkila starts keeping accounts and bookings on a server.]'],
 ['p','**Changes.** We may update this notice. For changes that matter, we tell you on the site and by message before they apply, and the date at the top changes.'],
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
  el.innerHTML=`<h1>${isT?'Terms of Service':'Privacy Notice'}</h1><p class="lead">${isT?'How Arkila works for renters and owners in Puerto Princesa.':'What we collect, why, who sees it, and your rights.'} Last updated ${esc(fmtEn(LEGAL_VERSION))}.</p>
  <div class="banner">Draft for review. Highlighted items in [brackets] are decisions still to be made, and a Philippine lawyer will check this before real payments start.</div>
  <p class="note"><a href="#terms">Terms of Service</a> · <a href="#privacy">Privacy Notice</a></p>
  <section class="step legal"><h2>Contents</h2><ol class="toc">${secs.map(s=>`<li><a href="#${kind}" data-lsec="${s.id}">${esc(s.h)}</a></li>`).join('')}</ol></section>`+
  secs.map(s=>`<section class="step legal" id="${s.id}"><h2>${esc(s.h)}</h2>${s.b.map(legalBlock).join('')}</section>`).join('');
}
document.addEventListener('click',e=>{const a=e.target.closest('[data-lsec]');if(!a)return;e.preventDefault();const s=document.getElementById(a.dataset.lsec);if(s)s.scrollIntoView({behavior:'smooth',block:'start'})});
