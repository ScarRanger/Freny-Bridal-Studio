# 📊 Google Sheets Configuration Guide

## 🔧 **Sheet Name and Range Configuration**

### **Where to Configure:**

**File:** `src/lib/googleSheets.js`  
**Environment Variables:** `.env.local`

### **Current Configuration:**

```javascript
const GOOGLE_SHEETS_CONFIG = {
  spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  credentials: process.env.GOOGLE_SHEETS_CREDENTIALS_BASE64,
  sheetName: process.env.GOOGLE_SHEETS_SHEET_NAME || 'Customers', // ← Sheet name
  startRow: process.env.GOOGLE_SHEETS_START_ROW || 2, // ← Start row
};
```

## 📋 **Environment Variables**

### **Required Variables:**
```env
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_SHEETS_CREDENTIALS_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwiaWF0IjoxNjM...
```

### **Optional Variables:**
```env
GOOGLE_SHEETS_SHEET_NAME=Customers
GOOGLE_SHEETS_START_ROW=2
```

## 🗂️ **Sheet Name Configuration**

### **Default Behavior:**
- **Sheet Name:** "Customers" (if not specified)
- **Fallback:** Uses the first sheet if "Customers" doesn't exist

### **Custom Sheet Names:**

#### **Example 1: Single Sheet**
```env
GOOGLE_SHEETS_SHEET_NAME=Customer Records
```

#### **Example 2: Year-based Sheets**
```env
GOOGLE_SHEETS_SHEET_NAME=2024 Records
```

#### **Example 3: Department Sheets**
```env
GOOGLE_SHEETS_SHEET_NAME=Beauty Services
```

### **How Sheet Selection Works:**

1. **Primary:** Looks for sheet with exact name match
2. **Fallback:** Uses first sheet if name not found
3. **Warning:** Logs warning if specified sheet not found

```javascript
// Code logic:
let sheet;
try {
  sheet = doc.sheetsByTitle[GOOGLE_SHEETS_CONFIG.sheetName];
  if (!sheet) {
    sheet = doc.sheetsByIndex[0]; // Fallback to first sheet
    console.warn(`Sheet "${GOOGLE_SHEETS_CONFIG.sheetName}" not found`);
  }
} catch (error) {
  sheet = doc.sheetsByIndex[0]; // Fallback to first sheet
}
```

## 📊 **Range Configuration**

### **Start Row Setting:**

#### **Default: Row 2 (After Headers)**
```env
GOOGLE_SHEETS_START_ROW=2
```

#### **Custom Start Row:**
```env
GOOGLE_SHEETS_START_ROW=3  # Start from row 3
GOOGLE_SHEETS_START_ROW=5  # Start from row 5
```

### **Recommended Sheet Structure:**

```
Row 1: Headers
Row 2: First data entry (default)
Row 3: Second data entry
...
```

### **Example Sheet Layout:**

| Row | A (Date) | B (Time) | C (Customer Name) | D (Phone) | E (Service) | F (Amount) | G (Payment) | H (Created) |
|-----|----------|----------|-------------------|-----------|-------------|------------|-------------|-------------|
| 1   | Date     | Time     | Customer Name      | Phone     | Service     | Amount     | Payment     | Created At  |
| 2   | 01/01/24 | 10:30 AM | John Doe           | 1234567890| Hair Cut    | ₹500       | Cash        | 2024-01-01  |
| 3   | 01/01/24 | 11:15 AM | Jane Smith         | 9876543210| Facial      | ₹800       | UPI         | 2024-01-01  |

## 🔧 **Configuration Examples**

### **Scenario 1: Default Setup**
```env
# .env.local
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
GOOGLE_SHEETS_CREDENTIALS_BASE64=your_credentials
# Uses: Sheet name "Customers", Start row 2
```

### **Scenario 2: Custom Sheet Name**
```env
# .env.local
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
GOOGLE_SHEETS_CREDENTIALS_BASE64=your_credentials
GOOGLE_SHEETS_SHEET_NAME=Customer Records
# Uses: Sheet name "Customer Records", Start row 2
```

### **Scenario 3: Custom Start Row**
```env
# .env.local
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
GOOGLE_SHEETS_CREDENTIALS_BASE64=your_credentials
GOOGLE_SHEETS_SHEET_NAME=2024 Data
GOOGLE_SHEETS_START_ROW=3
# Uses: Sheet name "2024 Data", Start row 3
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Sheet not found"**
**Solution:** 
- Check sheet name spelling exactly
- Make sure the sheet exists in your Google Sheet
- Check environment variable `GOOGLE_SHEETS_SHEET_NAME`

### **Issue 2: "Data in wrong row"**
**Solution:**
- Adjust `GOOGLE_SHEETS_START_ROW` value
- Make sure headers are in row 1
- Check that start row is after headers

### **Issue 3: "Multiple sheets confusion"**
**Solution:**
- Use specific sheet names
- Check sheet names in Google Sheets
- Use `getSheetInfo()` function to debug

## 🔍 **Debugging Sheet Configuration**

### **Check Sheet Info:**
```javascript
import { getSheetInfo } from '@/lib/googleSheets';

// In your component or API route
const sheetInfo = await getSheetInfo();
console.log('Sheet Info:', sheetInfo);
```

### **Output Example:**
```javascript
{
  spreadsheetTitle: "Freny Bridal Studio Records",
  sheets: [
    {
      title: "Customers",
      index: 0,
      rowCount: 150,
      columnCount: 8
    },
    {
      title: "2024 Records",
      index: 1,
      rowCount: 75,
      columnCount: 8
    }
  ]
}
```

## ✅ **Best Practices**

1. **Sheet Names:** Use descriptive names (e.g., "2024 Records", "Customer Data")
2. **Start Row:** Always start after headers (row 2 or higher)
3. **Headers:** Keep headers in row 1
4. **Backup:** Use multiple sheets for different time periods
5. **Testing:** Test with a small dataset first

## 📱 **Mobile Considerations**

- Sheet names work the same on mobile
- Range configuration is server-side
- No mobile-specific configuration needed

The sheet configuration is now fully flexible and can be customized for your specific needs! 🎉 