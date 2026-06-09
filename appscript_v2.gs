// ══════════════════════════════════════════════════════════════════════════════
//  CCL Google Apps Script — v2
//  Deploy as Web App: Execute as "Me", Access "Anyone"
//  Handles both v1 (AI-only) and v2 (AI + HU) submissions
// ══════════════════════════════════════════════════════════════════════════════

const SHEET_NAME = 'CCL Labels';

// ── Column headers ────────────────────────────────────────────────────────────
// v1 columns (keep exact order for backward compatibility)
// v2 adds: mode, archetype, hu_code, e, l, rh, b, k, j, hu_summary
const HEADERS = [
  'Timestamp',
  'Project', 'Author', 'Language',
  'Code', 'Summary',
  'R', 'I', 'D', 'C', 'P', 'O', 'M', 'F',
  'E', 'L', 'RH', 'B', 'K', 'J',
  'Archetype'
];

// ── Rate-limit: max N submissions per IP per hour ─────────────────────────────
const RATE_LIMIT = 10; // submissions per IP per hour

function isRateLimited(ip) {
  if (!ip) return false;
  const cache = CacheService.getScriptCache();
  const key   = 'rl_' + ip.replace(/[^a-z0-9]/gi, '_');
  const count = parseInt(cache.get(key) || '0');
  if (count >= RATE_LIMIT) return true;
  cache.put(key, String(count + 1), 3600); // expires in 1 hour
  return false;
}

// ── doPost: receive a label submission ────────────────────────────────────────
function doPost(e) {
  try {
    const ip   = e.parameter && e.parameter.ip ? e.parameter.ip
               : (e.headers && e.headers['X-Forwarded-For']) || '';

    if (isRateLimited(ip)) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'rate_limited' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const raw  = e.postData.contents;
    const data = JSON.parse(raw);

    // Basic validation: reject obviously empty submissions
    if (!data.lang) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'invalid' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let   sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet on first run, or migrate existing v1 sheet to v2
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      const hdr = sheet.getRange(1, 1, 1, HEADERS.length);
      hdr.setBackground('#0a0a0a').setFontColor('#ffffff').setFontWeight('bold');
    } else {
      // Check if v2 columns are missing and add them
      migrateHeaders(sheet);
    }

    // Build row matching HEADERS order exactly
    const row = [
      new Date().toISOString(),       // Timestamp
      data.project   || '',           // Project
      data.author    || '',           // Author
      data.lang      || 'en',         // Language
      data.code      || '',           // Code (AI + HU combined)
      data.summary   || '',           // Summary
      safeInt(data.r),                // R
      safeInt(data.i),                // I
      safeInt(data.d),                // D
      safeInt(data.c),                // C
      safeInt(data.p),                // P
      safeInt(data.o),                // O
      safeInt(data.m),                // M
      safeInt(data.f),                // F
      safeInt(data.e),                // E
      safeInt(data.l),                // L
      safeInt(data.rh),               // RH
      safeInt(data.b),                // B
      safeInt(data.k),                // K
      safeInt(data.j),                // J
      data.archetype || ''            // Archetype
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', count: sheet.getLastRow() - 1 }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── doGet: return global label count ─────────────────────────────────────────
function doGet(e) {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    const count = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0; // subtract header row

    return ContentService
      .createTextOutput(JSON.stringify({ count: count }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ count: 0 }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Migrate: add missing v2 headers to an existing v1 sheet ──────────────────
function migrateHeaders(sheet) {
  const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0].map(h => String(h).toLowerCase().trim());

  let col = sheet.getLastColumn();
  HEADERS.forEach(h => {
    if (!existingHeaders.includes(h.toLowerCase())) {
      col++;
      sheet.getRange(1, col).setValue(h)
        .setBackground('#1D9E75').setFontColor('#ffffff').setFontWeight('bold');
    }
  });
}

// ── Helper ────────────────────────────────────────────────────────────────────
function safeInt(val) {
  const n = parseInt(val);
  return isNaN(n) ? 0 : n;
}
