
/**
 * GOOGLE APPS SCRIPT - PLN CORETAX HUB SYNC
 * 1. Buka Google Sheet (https://docs.google.com/spreadsheets/d/1V4TsEVXv4Y5F7OzGuxV9Q-AiLh30sBnmW5JwHn1c3dg/edit)
 * 2. Menu Extensions -> Apps Script
 * 3. Copy/Paste kode ini dan simpan
 * 4. Deploy sebagai Web App (Akses: Anyone)
 */

const SHEET_ID = '1V4TsEVXv4Y5F7OzGuxV9Q-AiLh30sBnmW5JwHn1c3dg';
const FOLDER_ID = '1HL7NFQ8t_7MIBh5tS5Ge2vvWNJNtoMUb';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheets()[0];
    const folder = DriveApp.getFolderById(FOLDER_ID);

    // Proses File 1 (Sertifikat)
    let sertifikatUrl = "";
    if (data.file1) {
      const file1Blob = Utilities.newBlob(Utilities.base64Decode(data.file1.data), data.file1.mimeType, `Sertifikat_${data.nip}_${data.nama}`);
      const file1 = folder.createFile(file1Blob);
      sertifikatUrl = file1.getUrl();
    }

    // Proses File 2 (Kode DJP)
    let djpUrl = "";
    if (data.file2) {
      const file2Blob = Utilities.newBlob(Utilities.base64Decode(data.file2.data), data.file2.mimeType, `KodeDJP_${data.nip}_${data.nama}`);
      const file2 = folder.createFile(file2Blob);
      djpUrl = file2.getUrl();
    }

    // Append ke Sheet
    sheet.appendRow([
      new Date(),
      data.nama,
      "'" + data.nip,
      data.unit,
      sertifikatUrl,
      djpUrl,
      data.npwpStatus
    ]);

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const data = ss.getSheets()[0].getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
