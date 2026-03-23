// ═══════════════════════════════════════════════════════════════════════════
// CCL — Google Apps Script (Web App)
// Pega este código en: Google Sheets → Extensiones → Apps Script
// ═══════════════════════════════════════════════════════════════════════════

// GET → devuelve el número total de labels
function doGet(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var count = Math.max(0, sheet.getLastRow() - 1); // -1 para excluir la cabecera

    return ContentService
        .createTextOutput(JSON.stringify({ count: count }))
        .setMimeType(ContentService.MimeType.JSON);
}

// POST → guarda una nueva label y devuelve el nuevo contador
function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
        new Date(),           // timestamp
        data.project || '',
        data.author || '',
        data.lang || '',
        data.code || '',
        data.summary || '',
        data.r || 0,
        data.i || 0,
        data.d || 0,
        data.c || 0,
        data.p || 0,
        data.o || 0,
        data.m || 0,
        data.f || 0
    ]);

    var count = Math.max(0, sheet.getLastRow() - 1);

    return ContentService
        .createTextOutput(JSON.stringify({ count: count }))
        .setMimeType(ContentService.MimeType.JSON);
}

// Ejecuta esto UNA VEZ para crear las cabeceras
function setupHeaders() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.getRange(1, 1, 1, 14).setValues([[
        'Timestamp', 'Project', 'Author', 'Language', 'Code', 'Summary',
        'R', 'I', 'D', 'C', 'P', 'O', 'M', 'F'
    ]]);
}
