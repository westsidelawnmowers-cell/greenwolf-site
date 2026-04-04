const RECIPIENT_EMAIL = 'greenwolfsaskatoon@gmail.com';
const SHEET_NAME = 'Sheet1';

function doGet() {
  return ContentService
    .createTextOutput('Green Wolf snow quote handler is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const data = normalizeSubmission_(e);
  const responseMode = data.responseMode || '';
  const formKey = data.formKey || '';

  if (data.company) {
    return buildResponse_({ success: true, skipped: true, message: 'Ignored spam submission.', formKey }, responseMode);
  }

  const missing = ['name', 'address', 'phone', 'email'].filter((field) => !data[field]);
  if (missing.length) {
    return buildResponse_({ success: false, error: `Missing required fields: ${missing.join(', ')}`, formKey }, responseMode);
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

    return buildResponse_({ success: true, message: 'Form submitted successfully', formKey }, responseMode);
  } finally {
    lock.releaseLock();
  }
}

function normalizeSubmission_(e) {
  const params = (e && e.parameter) || {};

  return {
    service: clean_(params.service) || 'Snow Removal',
    name: clean_(params.name) || clean_(params.fullName) || joinName_(params.firstName, params.lastName),
    address: clean_(params.address) || clean_(params.streetAddress),
    phone: clean_(params.phone) || clean_(params.phoneNumber),
    email: clean_(params.email) || clean_(params.emailAddress),
    message: clean_(params.message),
    responseMode: clean_(params.responseMode),
    formKey: clean_(params.formKey),
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

function joinName_(firstName, lastName) {
  return [clean_(firstName), clean_(lastName)].filter(Boolean).join(' ').trim();
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildResponse_(payload, responseMode) {
  if (responseMode === 'iframe') {
    return iframeResponse_(payload);
  }

  return jsonResponse_(payload);
}

function iframeResponse_(payload) {
  const safePayload = JSON.stringify({
    type: 'greenwolf_quote_result',
    success: Boolean(payload.success),
    message: payload.message || '',
    error: payload.error || '',
    formKey: payload.formKey || ''
  });

  return HtmlService.createHtmlOutput(
    '<!doctype html><html><body><script>' +
      'window.parent.postMessage(' + JSON.stringify(safePayload) + ', "*");' +
    '</script></body></html>'
  );
}
