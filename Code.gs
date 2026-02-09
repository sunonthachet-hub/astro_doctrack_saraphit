
// ===============================================================
// Google Apps Script - Backend API
// ===============================================================

const SPREADSHEET_ID = "1a9bJC95lKfPJO_-yxX1Y7uUrT3KDISW4RxwOY6V2QhA";

// Handles GET requests - primarily for fetching initial data
function doGet(e) {
  try {
    const data = getInitialData();
    return createJsonResponse({ success: true, data: data });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

// Handles POST requests - acts as a router for all actions
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { action, payload, user } = body;
    let result;

    // Route requests based on the 'action' property
    switch (action) {
      case 'verifyLogin':
        result = verifyLogin(payload.credentials);
        return createJsonResponse({ success: !!result, data: result });
      
      case 'saveDocument':
        result = saveDocumentAndAttachment(payload.docData, payload.fileData, user);
        break;
      
      case 'deleteDocument':
        result = deleteDocument(payload.docId, user);
        break;
      
      case 'updateStatus':
        result = updateDocumentStatus(payload.docId, payload.newStatus, user);
        break;

      case 'saveStaff':
        result = saveStaff(payload.staffData, user);
        break;

      case 'deleteStaff':
        result = deleteStaff(payload.id, user);
        break;

      case 'importFromSheet':
        result = importFromGoogleSheet(payload.url, user);
        return createJsonResponse(result); // This function returns a custom structure

      case 'importFromJson':
        result = importDocumentsFromJSON(payload.jsonData, user);
        return createJsonResponse(result); // This function returns a custom structure

      case 'exportToGoogleSheet':
        result = exportToGoogleSheet(payload.docs || [], user);
        return createJsonResponse(result);

      case 'getRecentActivity':
         result = getRecentActivity();
         break;

      default:
        throw new Error("Invalid action provided.");
    }
    
    return createJsonResponse({ success: true, data: result });

  } catch (err) {
    Logger.log(err.toString());
    return createJsonResponse({ success: false, error: err.message });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===============================================================
// Core Functions (Largely unchanged, just called by the API router)
// ===============================================================

function initializeSheet(ss, sheetName, headers) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(headers);
    } else {
        const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const missingHeaders = headers.filter(h => !currentHeaders.includes(h));
        if (missingHeaders.length > 0) {
            sheet.getRange(1, currentHeaders.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
        }
    }
    return sheet;
}

function sheetDataToObjects(data) {
    if (!data || data.length < 2) return [];
    const headers = data[0].map(h => String(h || '').trim());
    return data.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            const cellValue = row[index];
            obj[header] = (cellValue instanceof Date) ? cellValue.toISOString().split('T')[0] : cellValue;
        });
        return obj;
    });
}

function logActivity(user, action, details) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('activity_log');
    sheet.insertRowBefore(2);
    sheet.getRange(2, 1, 1, 4).setValues([[new Date(), user, action, details]]);
    if (sheet.getLastRow() > 101) {
      sheet.deleteRows(102, sheet.getLastRow() - 101);
    }
  } catch (e) { Logger.log('Failed to log activity: ' + e.toString()); }
}

function getInitialData() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const docHeaders = ['doc_number', 'submission_date', 'department', 'proposer_name', 'objective', 'planning_status', 'procurement_status', 'finance_status', 'budget_status', 'notes1', 'permission', 'approval_date', 'notes2', 'work_group'];
    initializeSheet(ss, 'documents', docHeaders);
    const staffSheet = initializeSheet(ss, 'staff', ['id', 'fullName', 'Department', 'email']);
    initializeSheet(ss, 'activity_log', ['timestamp', 'user', 'action', 'details']);
    const settingSheet = initializeSheet(ss, 'setting', ['ID', 'รายการ', 'drive']);
    const fileSheet = initializeSheet(ss, 'file_uploads', ['doc_number', 'file_id', 'file_name', 'file_url']);
    const userSheet = initializeSheet(ss, 'users', ['username', 'password', 'fullName', 'role']);

    if (userSheet.getLastRow() < 2) {
      userSheet.appendRow(['admin', 'spk2025', 'ผู้ดูแลระบบ', 'Admin']);
      userSheet.appendRow(['director', 'director2025', 'ผู้บริหาร', 'Director']);
    }
    if (staffSheet.getLastRow() < 2) { staffSheet.appendRow(['s01', 'ผู้ดูแลระบบ', 'ผู้บริหาร', 'example@email.com']); }
    if (settingSheet.getLastRow() < 2) { settingSheet.appendRow(['DRIVE_FOLDER', 'ID โฟลเดอร์สำหรับเก็บไฟล์แนบ', 'กรุณาวาง ID ของ Google Drive Folder ที่นี่']); }

    const documents = sheetDataToObjects(ss.getSheetByName('documents').getDataRange().getValues());
    const staff = sheetDataToObjects(staffSheet.getDataRange().getValues());
    const fileUploads = sheetDataToObjects(fileSheet.getDataRange().getValues());
    const recentActivity = getRecentActivity();

    const docsWithAttachments = documents.map(doc => ({ ...doc, attachment: fileUploads.find(f => f.doc_number === doc.doc_number) || null }))
      .sort((a, b) => {
        const dateA = new Date(a.submission_date);
        const dateB = new Date(b.submission_date);
        return dateB.getTime() - dateA.getTime();
      });

    return { documents: docsWithAttachments, staff, recentActivity };
}

function verifyLogin(credentials) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const userSheet = ss.getSheetByName('users');
    if (!userSheet) return null;
    const usersData = sheetDataToObjects(userSheet.getDataRange().getValues());
    const foundUser = usersData.find(u => u.username === credentials.username && u.password === credentials.password);
    if (foundUser) {
        logActivity(foundUser.fullName, 'LOGIN', `${foundUser.role} logged in.`);
        return { username: foundUser.username, fullName: foundUser.fullName, role: foundUser.role };
    }
    return null;
}

function getRecentActivity() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('activity_log');
  if (!sheet || sheet.getLastRow() < 2) return [];
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  const logs = sheetDataToObjects(sheet.getDataRange().getValues());
  return logs.filter(log => new Date(log.timestamp) >= tenDaysAgo);
}

function getDriveFolderId() {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const settingSheet = ss.getSheetByName('setting');
    const data = settingSheet.getDataRange().getValues();
    const folderIdRow = data.find(row => row[0] === 'DRIVE_FOLDER');
    return folderIdRow ? folderIdRow[2] : null;
}

function uploadFile(fileData) {
    const folderId = getDriveFolderId();
    if (!folderId || folderId.includes('กรุณา')) {
        throw new Error("ยังไม่ได้ตั้งค่า Drive Folder ID ในชีต 'setting'");
    }
    const decoded = Utilities.base64Decode(fileData.base64);
    const blob = Utilities.newBlob(decoded, fileData.type, fileData.name);
    const folder = DriveApp.getFolderById(folderId);
    const file = folder.createFile(blob);
    return { file_id: file.getId(), file_name: file.getName(), file_url: file.getUrl() };
}

function sendApprovalNotification(docData) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const staffSheet = ss.getSheetByName('staff');
    const staffData = sheetDataToObjects(staffSheet.getDataRange().getValues());
    const proposerName = String(docData.proposer_name || '').trim();
    if (!proposerName) return;
    const proposer = staffData.find(s => String(s.fullName || '').trim() === proposerName);
    if (proposer && proposer.email) {
        const subject = `[SPK Complate] เอกสารของคุณได้รับการอนุมัติแล้ว: #${docData.doc_number}`;
        const body = `เรียนคุณ ${docData.proposer_name},\n\nเอกสารของคุณได้รับการอนุมัติเรียบร้อยแล้ว\n- เลขที่เอกสาร: ${docData.doc_number}\n- วัตถุประสงค์: ${docData.objective}\n\nคุณสามารถตรวจสอบรายละเอียดได้ที่ระบบติดตามเอกสาร`;
        MailApp.sendEmail(proposer.email, subject, body);
        logActivity('System', 'EMAIL_SENT', `Notification sent to ${proposer.email} for doc ${docData.doc_number}`);
    }
}

function saveDocumentAndAttachment(docData, fileData, user) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const docSheet = ss.getSheetByName('documents');
  const fileSheet = ss.getSheetByName('file_uploads');

  // Read existing documents to determine next doc_number if needed
  const docDataRange = docSheet.getDataRange().getValues();
  const headers = docDataRange[0];

  // Auto-generate doc_number when adding a new document (user should not enter it)
  if (!docData.doc_number || docData.doc_number === '') {
    const existingIds = docDataRange.slice(1).map(r => r[0]).filter(Boolean).map(String);
    let maxNum = 0;
    existingIds.forEach(id => {
      const m = id.match(/(\d+)$/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    });
    const next = maxNum + 1;
    docData.doc_number = 'DOC-' + ('0000' + next).slice(-4);
  }

  // Handle file upload (now that doc_number is ensured)
  if (fileData) {
    const fileDataRange = fileSheet.getDataRange().getValues();
    const fileRowIndex = fileDataRange.findIndex(row => row[0] === docData.doc_number);
    if (fileRowIndex > -1) {
      const oldFileId = fileDataRange[fileRowIndex][1];
      try { DriveApp.getFileById(oldFileId).setTrashed(true); } catch (e) { Logger.log("Could not trash old file: " + oldFileId); }
      fileSheet.deleteRow(fileRowIndex + 1);
    }
    const newAttachment = uploadFile(fileData);
    fileSheet.appendRow([docData.doc_number, newAttachment.file_id, newAttachment.file_name, newAttachment.file_url]);
  }

  const docRowIndex = docDataRange.findIndex(row => row[0] === docData.doc_number);
  let oldDocData = null;
  if (docRowIndex > -1) oldDocData = sheetDataToObjects([headers, docDataRange[docRowIndex+1]])[0];
  if (user.role !== 'Director' && user.role !== 'Admin' && oldDocData) { docData.permission = oldDocData.permission; }
  const newRowData = headers.map(header => docData[header] || "");
  if (docRowIndex > -1) {
    docSheet.getRange(docRowIndex + 1, 1, 1, headers.length).setValues([newRowData]);
  } else {
    docSheet.appendRow(newRowData);
  }
  if (docData.permission === 'อนุมัติ' && (!oldDocData || oldDocData.permission !== 'อนุมัติ')) {
    sendApprovalNotification(docData);
  }
  return getInitialData().documents;
}

function updateDocumentStatus(docId, newStatus, user) {
    if (user.role !== 'Director' && user.role !== 'Admin') throw new Error("Unauthorized access.");
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('documents');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rowIndex = data.findIndex(row => row[headers.indexOf('doc_number')] === docId);
    if (rowIndex > 0) {
        const oldStatus = data[rowIndex][headers.indexOf('permission')];
        sheet.getRange(rowIndex + 1, headers.indexOf('permission') + 1).setValue(newStatus);
        sheet.getRange(rowIndex + 1, headers.indexOf('approval_date') + 1).setValue(newStatus !== 'กำลังดำเนินการ' ? new Date() : '');
        if (newStatus === 'อนุมัติ' && oldStatus !== 'อนุมัติ') {
            const docData = sheetDataToObjects([headers, sheet.getRange(rowIndex + 1, 1, 1, headers.length).getValues()[0]])[0];
            sendApprovalNotification(docData);
        }
        logActivity(user.fullName, 'UPDATE_STATUS', `ID: ${docId} to ${newStatus}`);
    } else {
        throw new Error("Document not found.");
    }
    return getInitialData().documents;
}

function deleteDocument(docId, user) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const docSheet = ss.getSheetByName('documents');
  const docData = docSheet.getDataRange().getValues();
  const docRowIndex = docData.findIndex(row => row[0] === docId);
  if (docRowIndex > 0) {
    docSheet.deleteRow(docRowIndex + 1);
    const fileSheet = ss.getSheetByName('file_uploads');
    const fileData = fileSheet.getDataRange().getValues();
    const fileRowIndex = fileData.findIndex(row => row[0] === docId);
    if (fileRowIndex > 0) {
      const fileId = fileData[fileRowIndex][1];
      try { DriveApp.getFileById(fileId).setTrashed(true); } catch(e) { Logger.log("File to delete not found: " + fileId); }
      fileSheet.deleteRow(fileRowIndex + 1);
    }
  }
  return getInitialData().documents;
}

function saveStaff(staffData, user) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('staff');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rowIndex = data.findIndex(row => row[headers.indexOf('id')] === staffData.id);
    const newRowData = headers.map(header => staffData[header] || "");
    if (rowIndex > 0) {
        sheet.getRange(rowIndex + 1, 1, 1, headers.length).setValues([newRowData]);
    } else {
        sheet.appendRow(newRowData);
    }
    return sheetDataToObjects(sheet.getDataRange().getValues());
}

function deleteStaff(id, user) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('staff');
    const data = sheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[data[0].indexOf('id')] === id);
    if (rowIndex > 0) { sheet.deleteRow(rowIndex + 1); }
    return sheetDataToObjects(sheet.getDataRange().getValues());
}

function importFromGoogleSheet(url, user) {
    try {
        const data = SpreadsheetApp.openByUrl(url).getSheets()[0].getDataRange().getValues();
        return processImportData(data, user);
    } catch (e) {
        return { success: false, importedCount: 0, errors: [{ row: 'N/A', message: 'ไม่สามารถเปิด Google Sheet: ' + e.message }] };
    }
}

function importDocumentsFromJSON(jsonData, user) {
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
        return { success: false, importedCount: 0, errors: [{ row: 'N/A', message: 'ข้อมูล JSON ไม่ถูกต้อง' }] };
    }
    const headers = Object.keys(jsonData[0]);
    const dataArray = [headers, ...jsonData.map(obj => headers.map(header => obj[header]))];
    return processImportData(dataArray, user);
}

function processImportData(data, user) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const targetSheet = ss.getSheetByName('documents');
    const targetHeaders = targetSheet.getRange(1, 1, 1, targetSheet.getLastColumn()).getValues()[0];
    const sourceHeaders = data[0].map(h => h.trim());
    const sourceData = data.slice(1);
    let validRows = [], errorList = [];
    sourceData.forEach((row, index) => {
        let docObj = {}, rowIsValid = true, errorMessages = [];
        sourceHeaders.forEach((header, colIndex) => { docObj[header] = row[colIndex]; });
        if (!docObj.objective || !String(docObj.objective).trim()) { rowIsValid = false; errorMessages.push("'objective' is empty"); }
        if (!docObj.proposer_name || !String(docObj.proposer_name).trim()) { rowIsValid = false; errorMessages.push("'proposer_name' is empty"); }
        if (rowIsValid) {
            docObj.doc_number = `DOC-${new Date().getTime()}-${index}`;
            validRows.push(targetHeaders.map(header => docObj[header] || ''));
        } else {
            errorList.push({ row: index + 2, message: errorMessages.join(', ') });
        }
    });
    if (validRows.length > 0) {
        targetSheet.getRange(targetSheet.getLastRow() + 1, 1, validRows.length, targetHeaders.length).setValues(validRows);
        logActivity(user.fullName, 'IMPORT_DOCUMENTS', `Imported ${validRows.length} documents.`);
    }
    return {
        success: errorList.length === 0, importedCount: validRows.length, errors: errorList,
        updatedDocuments: getInitialData().documents
    };
}

/**
 * Create a new Google Spreadsheet and write provided documents into it.
 * Returns { success: true, url: <sheetUrl> } or error.
 */
function exportToGoogleSheet(docs, user) {
  try {
    if (!Array.isArray(docs) || docs.length === 0) return { success: false, error: 'No documents provided' };
    // Prepare headers in requested order
    const headers = ['submission_date', 'proposer_name', 'work_group', 'objective', 'planning_status', 'procurement_status', 'finance_status', 'budget_status', 'permission', 'approval_date', 'notes1', 'notes2'];
    const ss = SpreadsheetApp.create('Exported Documents - ' + new Date().toISOString());
    const sheet = ss.getActiveSheet();
    sheet.appendRow(headers);
    const rows = docs.map(d => {
      // Format submission_date as ISO date (frontend can format to Thai) but keep ISO for sheet
      const submission = d.submission_date || '';
      return [submission, d.proposer_name || '', d.work_group || '', d.objective || '', d.planning_status || '', d.procurement_status || '', d.finance_status || '', d.budget_status || '', d.permission || '', d.approval_date || '', d.notes1 || '', d.notes2 || ''];
    });
    if (rows.length) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    // Share or return sheet URL
    const url = ss.getUrl();
    logActivity(user ? user.fullName : 'System', 'EXPORT_SHEET', `Exported ${rows.length} rows to ${url}`);
    return { success: true, url };
  } catch (e) {
    return { success: false, error: e.message };
  }
}