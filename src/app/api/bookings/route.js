import { adminDb } from '@/lib/firebaseAdmin';
import { updateGoogleSheets, deleteFromGoogleSheets } from '@/lib/googleSheets';

export async function GET() {
  try {
    const snapshot = await adminDb.collection('bookings').orderBy('createdAt', 'desc').get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return new Response(JSON.stringify({ success: true, bookings }), {
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


export async function PATCH(request) {
  try {
    const { id, data } = await request.json();
    // Fetch the booking to get the rowIndex
    const docRef = adminDb.collection('bookings').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new Error('Booking not found');
    const booking = docSnap.data();
    // If rowIndex is not present in update, keep the old one
    const rowIndex = typeof data.rowIndex === 'number' ? data.rowIndex : booking.rowIndex;
    // Always update Firestore
    await docRef.update({
      ...data,
      rowIndex,
      updatedAt: new Date(),
    });
    // Always update Google Sheets if rowIndex is present
    if (typeof rowIndex === 'number') {
      await updateGoogleSheets(rowIndex, { ...booking, ...data, rowIndex });
    }
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


export async function DELETE(request) {
  try {
    const { id } = await request.json();
    // Fetch the booking to get the rowIndex
    const docRef = adminDb.collection('bookings').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new Error('Booking not found');
    const booking = docSnap.data();
    const rowIndex = booking.rowIndex;
    // Always delete from Firestore
    await docRef.delete();
    // Always delete from Google Sheets if rowIndex is present
    if (typeof rowIndex === 'number') {
      await deleteFromGoogleSheets(rowIndex);
    }
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
