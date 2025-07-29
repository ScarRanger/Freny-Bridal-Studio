# Freny Bridal Studio - Beauty Parlor Management System

A comprehensive web application for managing beauty parlor operations, built with Next.js, Firebase, and Google Sheets integration.

## Features

- 🔐 **Google Authentication** - Secure sign-in with pre-specified Google accounts
- 👥 **Customer Management** - Add new customer records with services and payments
- 📊 **Dual Data Storage** - Firebase Firestore + Google Sheets for backup and reporting
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🔍 **History & Search** - View, edit, and delete past records
- 📅 **Monthly Organization** - Records sorted by month for easy management

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Authentication**: Firebase Google Auth
- **Database**: Firebase Firestore
- **External Integration**: Google Sheets API
- **UI Components**: Lucide React Icons
- **Notifications**: React Hot Toast
- **Deployment**: Vercel

## Quick Setup

### 1. **Environment Variables**

Create `.env.local` in your project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Google Sheets Configuration (Base64)
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_CREDENTIALS_BASE64=base64_encoded_service_account_json_here
GOOGLE_SHEETS_SHEET_NAME=Customers
GOOGLE_SHEETS_START_ROW=2
```

### 2. **Generate Base64 Credentials**

1. Download your Google service account JSON file
2. Rename it to `service-account-key.json`
3. Place it in your project root
4. Run: `node convert-to-base64.js`
5. Copy the output to your `.env.local` file

### 3. **Add Authorized Emails**

Edit `src/lib/firebase.js` (lines 18-23):

```javascript
const ALLOWED_EMAILS = [
  'admin@frenybridal.com',
  'manager@frenybridal.com',
  'staff@frenybridal.com',
  'your-email@gmail.com',        // Add your email
  // Add more allowed emails here
];
```

### 4. **Run the Application**

```bash
npm install
npm run dev
```

## Detailed Setup Instructions

For complete step-by-step instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## Google Sheets Configuration

### **Sheet Structure**

Your Google Sheet should have these columns in the first row:

```
A        B      C              D              E        F        G            H
Date     Time   Customer Name  Phone Number   Service  Amount   Payment Mode Created At
```

### **Environment Variables for Sheets**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Your Google Sheet ID | - | ✅ |
| `GOOGLE_SHEETS_CREDENTIALS_BASE64` | Base64 encoded service account JSON | - | ✅ |
| `GOOGLE_SHEETS_SHEET_NAME` | Name of the sheet tab | "Customers" | ❌ |
| `GOOGLE_SHEETS_START_ROW` | Row number to start adding data | 2 | ❌ |

### **Sheet Configuration Examples**

#### **Default Setup:**
```env
GOOGLE_SHEETS_SHEET_NAME=Customers
GOOGLE_SHEETS_START_ROW=2
```

#### **Custom Sheet Name:**
```env
GOOGLE_SHEETS_SHEET_NAME=Customer Records
GOOGLE_SHEETS_START_ROW=2
```

#### **Multiple Sheets:**
```env
GOOGLE_SHEETS_SHEET_NAME=2024 Records
GOOGLE_SHEETS_START_ROW=3
```

### **How Sheet Selection Works:**

1. **Primary:** Uses the sheet name specified in `GOOGLE_SHEETS_SHEET_NAME`
2. **Fallback:** If sheet name not found, uses the first sheet
3. **Data Start:** Begins adding data from the row specified in `GOOGLE_SHEETS_START_ROW`

## Usage

### Login
- Click "Sign in with Google" button
- Select your authorized Google account
- Only pre-specified email addresses can access the system
- Authentication is persistent across sessions

### Add Customer
- Navigate to "Add New Customer"
- Fill in customer details:
  - Name (required)
  - Phone number (optional)
  - Service provided (required)
  - Amount (required)
  - Payment mode: Cash or UPI
- Data is automatically saved to **both** Firebase and Google Sheets
- Real-time progress indicators show saving status

### View History
- Navigate to "View History"
- Search by name, service, or phone number
- Filter by month
- Edit or delete records as needed
- Records are grouped by month for easy organization

## Data Storage

### Dual Logging System
- **Firebase Firestore**: Primary database for real-time data
- **Google Sheets**: Backup and reporting system
- All customer records are automatically logged to both systems
- Progress indicators show saving status for each system

### Data Flow
1. User submits customer form
2. Data saved to Firebase Firestore
3. Data logged to Google Sheets
4. Success confirmation shown to user

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

Make sure to add all environment variables in your Vercel project settings.

## Security Features

- Google Authentication with pre-specified accounts
- Restricted access to specific email addresses
- Secure API key management with base64 encoding
- Input validation and sanitization
- Responsive design for mobile security

## Mobile Optimization

- Touch-friendly interface
- Responsive design for all screen sizes
- Optimized for iOS devices
- Fast loading and smooth interactions

## Support

For technical support or questions, please contact the development team.

## License

This project is proprietary software for Freny Bridal Studio.
