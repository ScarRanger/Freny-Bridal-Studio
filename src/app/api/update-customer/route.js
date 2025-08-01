import { NextResponse } from 'next/server';
import { updateGoogleSheets, deleteFromGoogleSheets } from '@/lib/googleSheets';
import { adminDb } from '@/lib/firebaseAdmin';


// Expects body: { rowIndex, customerData, customerId }
export async function POST(req) {
  try {
    const body = await req.json();
    const { rowIndex, customerData, customerId } = body;
    // Update Firestore customer record
    if (customerId) {
      const docRef = adminDb.collection('customers').doc(customerId);
      await docRef.update({
        ...customerData,
        updatedAt: new Date(),
        updatedBy: customerData.updatedBy || 'system',
      });
    }
    // Update Google Sheets
    await updateGoogleSheets(rowIndex, customerData);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}


// Expects body: { rowIndex, customerId }
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { rowIndex, customerId } = body;
    // Delete from Firestore
    if (customerId) {
      const docRef = adminDb.collection('customers').doc(customerId);
      await docRef.delete();
    }
    // Delete from Google Sheets
    await deleteFromGoogleSheets(rowIndex);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
