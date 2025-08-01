// Add a booking to Google Sheets (Bookings sheet)
// import { google } from 'googleapis';
export const addBookingToGoogleSheets = async (bookingData) => {
  try {
    // Decode base64 credentials
    const serviceAccountJson = JSON.parse(
      Buffer.from(GOOGLE_SHEETS_CONFIG.credentials, 'base64').toString('utf8')
    );
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountJson,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    // Get current time in IST (UTC+5:30)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utc + (5.5 * 60 * 60000));
    const dateStr = istTime.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const timeStr = istTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const row = [
      dateStr,
      timeStr,
      bookingData.name,
      bookingData.number || '',
      bookingData.service,
      bookingData.notes || '',
      istTime.toISOString()
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
      range: `Bookings!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });
    return true;
  } catch (error) {
    console.error('Error adding booking to Google Sheets:', error);
    throw new Error('sheets: ' + error.message);
  }
};
export const deleteFromGoogleSheets = async (rowIndex) => {
  try {
    const serviceAccountJson = JSON.parse(
      Buffer.from(GOOGLE_SHEETS_CONFIG.credentials, 'base64').toString('utf8')
    );
    const doc = new GoogleSpreadsheet(GOOGLE_SHEETS_CONFIG.spreadsheetId);
    await doc.useServiceAccountAuth(serviceAccountJson);
    await doc.loadInfo();
    let sheet = doc.sheetsByTitle[GOOGLE_SHEETS_CONFIG.sheetName];
    if (!sheet) {
      sheet = doc.sheetsByIndex[0];
    }
    const rows = await sheet.getRows();
    const adjustedRowIndex = rowIndex + (GOOGLE_SHEETS_CONFIG.startRow - 2);
    if (rows[adjustedRowIndex]) {
      await rows[adjustedRowIndex].delete();
    }
    return true;
  } catch (error) {
    console.error('Error deleting from Google Sheets:', error);
    throw new Error('sheets: ' + error.message);
  }
};
import { google } from 'googleapis';

const GOOGLE_SHEETS_CONFIG = {
  spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  credentials: process.env.GOOGLE_SHEETS_CREDENTIALS_BASE64, // Base64 encoded service account JSON
  sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME || 'Customers', // Sheet name (default: Customers)
  startRow: process.env.GOOGLE_SHEETS_START_ROW || 2, // Start row for data (default: 2, after headers)
};

export const addToGoogleSheets = async (customerData) => {
  try {
    // Decode base64 credentials
    const serviceAccountJson = JSON.parse(
      Buffer.from(GOOGLE_SHEETS_CONFIG.credentials, 'base64').toString('utf8')
    );

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountJson,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare row data with proper IST date and time
    const services = Array.isArray(customerData.services)
      ? customerData.services.join(', ')
      : (customerData.service || '');

    // Get current time in IST (UTC+5:30) regardless of server timezone
    const now = new Date();
    // Convert to IST by adding 5 hours 30 minutes to UTC
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utc + (5.5 * 60 * 60000));
    const dateStr = istTime.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const timeStr = istTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const row = [
      dateStr,
      timeStr,
      customerData.name,
      customerData.phone || 'N/A',
      services,
      customerData.amount,
      customerData.paymentMode,
      istTime.toISOString()
    ];

    // Append row to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
      range: `${GOOGLE_SHEETS_CONFIG.sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    return true;
  } catch (error) {
    console.error('Error adding to Google Sheets:', error);
    throw new Error('sheets: ' + error.message);
  }
};

export const updateGoogleSheets = async (rowIndex, customerData) => {
  try {
    // Decode base64 credentials
    const serviceAccountJson = JSON.parse(
      Buffer.from(GOOGLE_SHEETS_CONFIG.credentials, 'base64').toString('utf8')
    );

    const doc = new GoogleSpreadsheet(GOOGLE_SHEETS_CONFIG.spreadsheetId);
    
    // Use service account credentials
    await doc.useServiceAccountAuth(serviceAccountJson);
    await doc.loadInfo();

    // Get the specified sheet by name, or use the first sheet as fallback
    let sheet;
    try {
      sheet = doc.sheetsByTitle[GOOGLE_SHEETS_CONFIG.sheetName];
      if (!sheet) {
        sheet = doc.sheetsByIndex[0];
        console.warn(`Sheet "${GOOGLE_SHEETS_CONFIG.sheetName}" not found, using first sheet: "${sheet.title}"`);
      }
    } catch (error) {
      sheet = doc.sheetsByIndex[0];
      console.warn('Using first sheet as fallback');
    }

    const rows = await sheet.getRows();
    
    // Adjust row index based on start row configuration
    const adjustedRowIndex = rowIndex + (GOOGLE_SHEETS_CONFIG.startRow - 2);
    
    if (rows[adjustedRowIndex]) {
      rows[adjustedRowIndex]['Customer Name'] = customerData.name;
      rows[adjustedRowIndex]['Phone Number'] = customerData.phone || 'N/A';
      rows[adjustedRowIndex]['Service'] = customerData.service;
      rows[adjustedRowIndex]['Amount'] = customerData.amount;
      rows[adjustedRowIndex]['Payment Mode'] = customerData.paymentMode;
      rows[adjustedRowIndex]['Updated At'] = new Date().toISOString();
      
      await rows[adjustedRowIndex].save();
    }

    return true;
  } catch (error) {
    console.error('Error updating Google Sheets:', error);
    throw new Error('sheets: ' + error.message);
  }
};

// Helper function to get sheet info
export const getSheetInfo = async () => {
  try {
    const serviceAccountJson = JSON.parse(
      Buffer.from(GOOGLE_SHEETS_CONFIG.credentials, 'base64').toString('utf8')
    );

    const doc = new GoogleSpreadsheet(GOOGLE_SHEETS_CONFIG.spreadsheetId);
    await doc.useServiceAccountAuth(serviceAccountJson);
    await doc.loadInfo();

    return {
      spreadsheetTitle: doc.title,
      sheets: doc.sheetsByIndex.map(sheet => ({
        title: sheet.title,
        index: sheet.index,
        rowCount: sheet.rowCount,
        columnCount: sheet.columnCount
      }))
    };
  } catch (error) {
    console.error('Error getting sheet info:', error);
    throw error;
  }
}; 