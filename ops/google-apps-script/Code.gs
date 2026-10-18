/**
 * DRAGON STUDIO — Google Sheets Lead Inbox (DEPLOYMENT TEMPLATE)
 *
 * 1) Create a Google Sheet in the company Google account.
 * 2) Extensions > Apps Script; paste this file.
 * 3) Set SHEET_ID from the Sheet URL.
 * 4) Deploy > New deployment > Web app > Execute as: Me,
 *    access: Anyone (only if you accept a public intake endpoint).
 * 5) Paste the /exec URL into DRAGON_CONFIG.LEADS_ENDPOINT and
 *    enable the website's secure request submission after testing.
 *
 * After updating Apps Script, create a NEW DEPLOYMENT VERSION, and test it before enabling site POST.
 */
const SHEET_ID = '1T-ZM-EnjpU6XYvltwtxj_btUaUMN0r1JaOcOvwvzJRg';
const SHEET_TAB = 'Leads';
const ADMIN_EMAIL = 'dragon.media.cerator@gmail.com';
const FIELDS = [
  'timestamp','status','source','name','brand','email','phone','package',
  'starting_price','platform','videos','target_date','reference','extras','brief'
];

function clean_(value, length) {
  const text = String(value || '').trim().slice(0, length);
  return /^[=+\-@]/.test(text) ? "'" + text : text; // guard against spreadsheet formula injection
}

function sheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_TAB);
  if (!sh) sh = ss.insertSheet(SHEET_TAB);
  if (sh.getLastRow() === 0) sh.appendRow(FIELDS);
  sh.setFrozenRows(1);
  return sh;
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  const today = Utilities.formatDate(new Date(), 'Africa/Cairo', 'yyyyMMdd');
  const props = PropertiesService.getScriptProperties();
  const limitKey = 'daily_leads_' + today;
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const used = Number(props.getProperty(limitKey) || 0);
    if (used >= 35) return HtmlService.createHtmlOutput('Submissions temporarily unavailable. Contact us via WhatsApp.');
    // This quota is per script deployment, not IP. Rate limiting is best-effort.
  } finally { lock.releaseLock(); }
  // Honeypot field must remain empty (a basic spam filter, not bot protection).
  if (p.website) return HtmlService.createHtmlOutput('Request received.');
  const data = {
    timestamp: new Date(), status: 'New', source: 'DRAGON website',
    name: clean_(p.name, 100), brand: clean_(p.brand, 100),
    email: clean_(p.email, 160), phone: clean_(p.phone, 40),
    package: clean_(p.package, 100), starting_price: clean_(p.starting_price, 30),
    platform: clean_(p.platform, 80), videos: clean_(p.videos, 20),
    target_date: clean_(p.target_date, 40), reference: clean_(p.reference, 500),
    extras: clean_(p.extras, 500), brief: clean_(p.brief, 1500)
  };
  if (!data.name || !data.brief || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return HtmlService.createHtmlOutput('Missing required fields. Please return to the website.');
  }
  // Prevent identical rapid resubmissions from writing duplicate rows.
  const cache = CacheService.getScriptCache();
  const fingerprint = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    [data.email,data.brief,data.package].join('|')).map(b => ('0'+(b&255).toString(16)).slice(-2)).join('');
  if (cache.get(fingerprint)) return HtmlService.createHtmlOutput('We have already received this request.');
  const writeLock = LockService.getScriptLock(); writeLock.waitLock(20000);
  try {
    const already = Number(props.getProperty(limitKey) || 0);
    if (already >= 35) return HtmlService.createHtmlOutput('Submissions temporarily unavailable. Contact us via WhatsApp.');
    sheet_().appendRow(FIELDS.map(f => data[f]));
    props.setProperty(limitKey, String(already + 1));
    cache.put(fingerprint,'1',180);
  } finally { writeLock.releaseLock(); }
  const summary = [
    'Name: '+data.name,'Business: '+data.brand,'Email: '+data.email,
    'Phone: '+data.phone,'Package: '+data.package,'Starting price: '+data.starting_price,
    'Platform: '+data.platform,'Estimated videos: '+data.videos,'Target date: '+data.target_date,
    'Reference: '+data.reference,'Extras: '+data.extras,'Project brief: '+data.brief
  ].join('\n');
  try {
    MailApp.sendEmail({
      to: ADMIN_EMAIL, subject: 'New DRAGON STUDIO lead — '+data.name,
      body: 'A new project inquiry was saved to the DRAGON Leads sheet.\n\n'+summary,
      replyTo: data.email
    });
  } catch (err) { console.error('Admin notification failed: '+String(err)); }
  try {
    MailApp.sendEmail({
      to: data.email, subject: 'DRAGON STUDIO — Your request was received',
      body: 'Hello '+data.name+',\n\nWe received your project inquiry. This is not a confirmed production booking or final quotation. We will review your brief and contact you.\n\n'+summary+'\n\nDRAGON STUDIO\n'+ADMIN_EMAIL,
      replyTo: ADMIN_EMAIL
    });
  } catch (err) { console.error('Client confirmation failed: '+String(err)); }
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><meta charset="utf-8"><title>DRAGON STUDIO</title>'+
    '<body style="font:17px sans-serif;padding:48px;line-height:1.8;color:#282a4d">'+
    '<h1>DRAGON STUDIO</h1><h2>Request received</h2>'+
    '<p>Thank you. Your inquiry has been recorded. This is not a confirmed production booking.</p>'+
    '<p>يمكنك إغلاق هذه النافذة والعودة للموقع. تم استلام طلبك، ولم يتم تأكيد حجز الإنتاج بعد.</p></body></html>');
}

function testSpreadsheetAccess() {
  return {sheet: sheet_().getName(),adminEmail: ADMIN_EMAIL};
}