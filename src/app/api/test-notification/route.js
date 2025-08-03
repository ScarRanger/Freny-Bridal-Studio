import { adminDb } from '@/lib/firebaseAdmin';
import admin from 'firebase-admin';

export async function GET(request) {
  try {
    console.log('Manual test trigger for booking reminders');
    
    // Calculate tomorrow's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // Get bookings for tomorrow
    const bookingsSnapshot = await adminDb
      .collection('bookings')
      .where('date', '==', tomorrowStr)
      .get();

    if (bookingsSnapshot.empty) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "No bookings found for tomorrow", 
        date: tomorrowStr 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get manager's FCM token
    const tokenDoc = await adminDb.collection('fcm_tokens').doc('manager').get();
    if (!tokenDoc.exists) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "No FCM token found for manager" 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const tokenData = tokenDoc.data();
    const managerToken = tokenData.token;

    // Send test notification
    const message = {
      notification: {
        title: `🧪 Test: Tomorrow's Bookings (${bookingsSnapshot.size})`,
        body: `Test notification: ${bookingsSnapshot.size} booking${bookingsSnapshot.size > 1 ? 's' : ''} for ${tomorrowStr}`,
      },
      data: {
        test: 'true',
        date: tomorrowStr,
        count: bookingsSnapshot.size.toString()
      },
      token: managerToken,
      webpush: {
        notification: {
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'test-reminder'
        }
      }
    };

    const messaging = admin.messaging();
    const response = await messaging.send(message);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Test notification sent successfully",
      messageId: response,
      bookingCount: bookingsSnapshot.size,
      date: tomorrowStr
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in test function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
