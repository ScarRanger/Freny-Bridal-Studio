
import { addBookingToGoogleSheets } from '@/lib/googleSheets';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const bookingData = await request.json();
    // Save to Firestore 'bookings' collection using Admin SDK
    await adminDb.collection('bookings').add({
      ...bookingData,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: bookingData.createdBy || 'system',
    });
    // Save to Google Sheets
    await addBookingToGoogleSheets(bookingData);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
