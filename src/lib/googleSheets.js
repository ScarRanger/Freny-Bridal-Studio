// Delete a row from Google Sheets by rowIndex (0-based, not including header)
export const deleteFromGoogleSheets = async (rowIndex) => {
  try {
    const serviceAccountJson = JSON.parse(
      Buffer.from(GOOGLE_SHEETS_CONFIG.credentials, 'base64').toString('utf8')
    );
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountJson,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Get sheetId by name
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
    });
    const sheet = meta.data.sheets.find(
      s => s.properties.title === GOOGLE_SHEETS_CONFIG.sheetName
    );
    if (!sheet) throw new Error('Sheet not found');
    const sheetId = sheet.properties.sheetId;

    // Adjust row index for Sheets API (0-based, including header row)
    const adjustedRowIndex = rowIndex + (GOOGLE_SHEETS_CONFIG.startRow - 1); // 1-based for API

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: adjustedRowIndex,
                endIndex: adjustedRowIndex + 1,
              },
            },
          },
        ],
      },
    });
    return true;
  } catch (error) {
    console.error('Error deleting from Google Sheets:', error);
    throw new Error('sheets: ' + error.message);
  }
};
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
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountJson,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare row data
    const services = Array.isArray(customerData.services)
      ? customerData.services.join(', ')
      : (customerData.service || '');
    const now = new Date();
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

    // Adjust row index for Sheets API (0-based, including header row)
    const adjustedRowIndex = rowIndex + (GOOGLE_SHEETS_CONFIG.startRow - 1); // 1-based for API
    const range = `${GOOGLE_SHEETS_CONFIG.sheetName}!A${adjustedRowIndex + 1}:H${adjustedRowIndex + 1}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
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