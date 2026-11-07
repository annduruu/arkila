/* Arkila request inbox. Paste into Extensions > Apps Script of a Google Sheet named "Arkila requests".
   1. Change SECRET below to a long private phrase (the admin page asks for it once).
   2. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
   3. Copy the Web app link into REQUEST_ENDPOINT in config.js.
   Anyone can ADD a request (that is how the website posts). Only someone with SECRET can READ them. */
const SECRET = 'CHANGE-THIS-TO-A-LONG-PRIVATE-PHRASE';

function doPost(e) {
  try {
    const raw = (e.postData && e.postData.contents) || '';
    if (raw.length > 20000) return ok_();
    const b = JSON.parse(raw);
    if (b.hp) return ok_();                      // spam trap
    const r = b.req;
    if (!r || !r.id) return ok_();
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sh.getLastRow() === 0) sh.appendRow(['Received', 'ID', 'Name', 'Phone', 'Vehicle', 'From', 'To', 'Time', 'Pickup', 'Going to', 'Total', 'Raw']);
    sh.appendRow([new Date(), r.id, r.guestName, r.guestPhone, r.carName, r.from, r.to, r.time,
      (r.spot || '') + (r.pickupAddr ? ' - ' + r.pickupAddr : ''), (r.dest || []).join(', '), r.total, JSON.stringify(r)]);
  } catch (err) {}
  return ok_();
}

function doGet(e) {
  if (!e.parameter || e.parameter.key !== SECRET) return out_({ error: 'denied' });
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const n = sh.getLastRow();
  const v = n > 1 ? sh.getRange(2, 12, n - 1, 1).getValues() : [];
  const rows = v.map(x => { try { return JSON.parse(x[0]); } catch (e) { return null; } }).filter(Boolean);
  return out_({ rows: rows });
}

function ok_() { return ContentService.createTextOutput('ok'); }
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
