const RECIPIENT_EMAIL = 'greenwolfsaskatoon@gmail.com';
const SHEET_NAME = 'Sheet1';

function doGet() {
  return ContentService
    .createTextOutput('Green Wolf snow quote handler is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const data = normalizeSubmission_(e);

  if (data.company) {
    return jsonResponse_({ ok: true, skipped: true });
  }

  const missing = ['name', 'address', 'phone', 'email'].filter((field) => !data[field]);
  if (missing.length) {
    return jsonResponse_({ ok: false, error: `Missing required fields: ${missing.join(', ')}` });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const sheet = getOrCreateSheet_();
    ensureHeaderRow_(sheet);

    sheet.appendRow([
      new Date(),
      data.name,
      data.phone,
      data.email,
      data.address,
      data.service,
      data.message
    ]);

    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      replyTo: data.email,
      subject: `Snow quote request from ${data.name}`,
      body: buildPlainTextEmail_(data)
    });

    return jsonResponse_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function normalizeSubmission_(e) {
  const params = (e && e.parameter) || {};

  return {
    service: clean_(params.service) || 'Snow Removal',
    name: clean_(params.name),
    address: clean_(params.address),
    phone: clean_(params.phone),
    email: clean_(params.email),
    message: clean_(params.message),
    source: clean_(params.source) || 'https://greenwolf.work/snow',
    page: clean_(params.page) || '',
    company: clean_(params.company)
  };
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  return sheet;
}

function ensureHeaderRow_(sheet) {
  if (sheet.getLastRow() > 0) return;

  sheet.appendRow([
    'Submitted At',
    'Name',
    'Phone',
    'Email',
    'Address',
    'Service',
    'Message'
  ]);
}

function buildPlainTextEmail_(data) {
  return [
    'New snow quote request',
    '',
    `Name: ${data.name}`,
    `Address: ${data.address}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email}`,
    `Service: ${data.service}`,
    data.message ? `Message: ${data.message}` : '',
    `Source: ${data.source}`,
    data.page ? `Page: ${data.page}` : ''
  ].filter(Boolean).join('\n');
}

function clean_(value) {
  return String(value || '').trim();
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
