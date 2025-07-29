# 🚀 Complete Setup Guide - Freny Bridal Studio

## 📋 **Step-by-Step Setup Instructions**

### 1. **Firebase Setup**

#### A. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "freny-bridal-studio"
4. Enable Google Analytics (optional)
5. Click "Create project"

#### B. Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Add your domain to authorized domains

#### C. Create Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select a location (choose closest to your users)

#### D. Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → "Web"
4. Register app and copy the config

### 2. **Google Cloud & Sheets Setup**

#### A. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use existing
3. Enable Google Sheets API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

#### B. Create Service Account
1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: "freny-bridal-sheets"
4. Description: "Service account for Freny Bridal Studio"
5. Click "Create and Continue"
6. Grant "Editor" role
7. Click "Done"

#### C. Download Service Account Key
1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON"
5. Download the file
6. **Rename it to `service-account-key.json`**
7. **Place it in your project root**

#### D. Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new sheet
3. Add these headers in row 1:
   ```
   A        B      C              D              E        F        G            H
   Date     Time   Customer Name  Phone Number   Service  Amount   Payment Mode Created At
   ```
4. Copy the Spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   ```
5. Share the sheet with your service account email (found in the JSON file)

### 3. **Generate Base64 Credentials**

#### A. Run the Conversion Script
```bash
# Make sure service-account-key.json is in your project root
node convert-to-base64.js
```

#### B. Copy the Output
The script will output something like:
```
=== GOOGLE SHEETS CREDENTIALS ===
GOOGLE_SHEETS_CLIENT_EMAIL=freny-bridal-sheets@your-project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwiaWF0IjoxNjM...
```

### 4. **Create Environment File**

Create `.env.local` in your project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=freny-bridal.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=freny-bridal-12345
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=freny-bridal-12345.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456

# Google Sheets Configuration (Base64)
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_SHEETS_CREDENTIALS_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwiaWF0IjoxNjM...
```

### 5. **Add Authorized Emails**

**File Location:** `src/lib/firebase.js`

**Lines 18-23:**
```javascript
// Pre-specified Google accounts that are allowed to access the system
const ALLOWED_EMAILS = [
  'admin@frenybridal.com',
  'manager@frenybridal.com',
  'staff@frenybridal.com',
  // Add more allowed emails here
];
```

**How to add more emails:**
1. Open `src/lib/firebase.js`
2. Find the `ALLOWED_EMAILS` array (around line 18)
3. Add your email addresses:
   ```javascript
   const ALLOWED_EMAILS = [
     'admin@frenybridal.com',
     'manager@frenybridal.com', 
     'staff@frenybridal.com',
     'your-email@gmail.com',        // Add your email
     'another-email@gmail.com',      // Add more emails
     // Add more allowed emails here
   ];
   ```

### 6. **Test the Setup**

#### A. Install Dependencies
```bash
npm install
```

#### B. Run the Application
```bash
npm run dev
```

#### C. Test Authentication
1. Go to `http://localhost:3000`
2. Click "Sign in with Google"
3. Use one of your authorized email addresses
4. You should be redirected to the dashboard

#### D. Test Data Entry
1. Click "Add New Customer"
2. Fill out the form
3. Submit and check:
   - Firebase Firestore (in Firebase Console)
   - Google Sheets (should have new row)

## 🔧 **Troubleshooting**

### Common Issues:

#### 1. **"Unauthorized email address"**
- Make sure your email is in the `ALLOWED_EMAILS` array
- Check the email spelling exactly

#### 2. **"Error adding to Google Sheets"**
- Verify the service account JSON is correct
- Check that the Google Sheet is shared with the service account email
- Ensure Google Sheets API is enabled

#### 3. **"Firebase config error"**
- Double-check all Firebase environment variables
- Make sure the Firebase project is created and configured

#### 4. **"Service account not found"**
- Verify the service account JSON file is in the project root
- Check the file name matches in `convert-to-base64.js`

## 📱 **Mobile Testing**

1. **iOS Safari:**
   - Open `http://localhost:3000` on your iPhone
   - Test Google sign-in
   - Verify form works on mobile

2. **Android Chrome:**
   - Same process as iOS
   - Test touch interactions

## 🚀 **Deployment to Vercel**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to [Vercel](https://vercel.com/)
   - Import your GitHub repository
   - Add all environment variables in Vercel dashboard
   - Deploy

3. **Update Authorized Domains:**
   - In Firebase Console → Authentication → Settings
   - Add your Vercel domain to authorized domains

## ✅ **Final Checklist**

- [ ] Firebase project created
- [ ] Google Authentication enabled
- [ ] Firestore database created
- [ ] Google Cloud project set up
- [ ] Google Sheets API enabled
- [ ] Service account created
- [ ] Service account JSON downloaded
- [ ] Base64 credentials generated
- [ ] Google Sheet created and shared
- [ ] Environment variables set
- [ ] Authorized emails added
- [ ] Application runs locally
- [ ] Google sign-in works
- [ ] Data saves to both Firestore and Sheets
- [ ] Mobile testing completed
- [ ] Deployed to Vercel (optional)

## 🆘 **Need Help?**

If you encounter any issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure all services are properly configured
4. Test with a simple email first

The system is now ready to use! 🎉 