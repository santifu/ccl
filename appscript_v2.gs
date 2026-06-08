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
  'timestamp',
  'project', 'author', 'lang',
  // AI-first
  'code',
  'r', 'i', 'd', 'c', 'p', 'o', 'm', 'f',
  'summary',
  // v2 new
  'mode', 'archetype',
  'hu_code',
  'e', 'l', 'rh', 'b', 'k', 'j',
  'hu_summary'
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

    // Create sheet + header row on first run
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      // Style header
      const hdr = sheet.getRange(1, 1, 1, HEADERS.length);
      hdr.setBackground('#0a0a0a').setFontColor('#ffffff').setFontWeight('bold');
    }

    // Build row in HEADERS order
    const row = [
      new Date().toISOString(),
      data.project   || '',
      data.author    || '',
      data.lang      || 'en',
      // AI phases
      data.code      || '',
      safeInt(data.r), safeInt(data.i), safeInt(data.d), safeInt(data.c),
      safeInt(data.p), safeInt(data.o), safeInt(data.m), safeInt(data.f),
      data.summary   || '',
      // v2 fields (safe defaults for v1 submissions)
      data.mode      !== undefined ? data.mode      : 0,
      data.archetype || '',
      data.hu_code   || '',
      safeInt(data.e),  safeInt(data.l), safeInt(data.rh),
      safeInt(data.b),  safeInt(data.k), safeInt(data.j),
      data.hu_summary || ''
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

// ── Helper ────────────────────────────────────────────────────────────────────
function safeInt(val) {
  const n = parseInt(val);
  return isNaN(n) ? 0 : n;
}
