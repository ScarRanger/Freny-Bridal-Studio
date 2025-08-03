import { adminDb } from '@/lib/firebaseAdmin';
import admin from 'firebase-admin';

export async function GET(request) {
  try {
    // Verify this is a cron request (security check)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    console.log('Starting booking reminder cron job...');
    
    // Calculate tomorrow's date in IST
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log('Checking bookings for date:', tomorrowStr);
    
    // Get bookings for tomorrow
    const bookingsSnapshot = await adminDb
      .collection('bookings')
      .where('date', '==', tomorrowStr)
      .get();

    if (bookingsSnapshot.empty) {
      console.log('No bookings found for tomorrow');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No bookings for tomorrow',
        date: tomorrowStr 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${bookingsSnapshot.size} bookings for tomorrow`);

    // Get manager's FCM token
    const tokenDoc = await adminDb.collection('fcm_tokens').doc('manager').get();
    if (!tokenDoc.exists) {
      console.log('No FCM token found for manager');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No FCM token found' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const tokenData = tokenDoc.data();
    if (!tokenData.active || !tokenData.token) {
      console.log('FCM token is inactive or missing');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'FCM token inactive' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const managerToken = tokenData.token;
    console.log('Found manager FCM token');

    // Process bookings and create summary
    const bookingCount = bookingsSnapshot.size;
    let bookingsList = [];
    let advanceTotal = 0;
    let advanceCount = 0;
    
    bookingsSnapshot.forEach(doc => {
      const booking = doc.data();
      const timeStr = booking.time ? ` at ${booking.time}` : '';
      bookingsList.push(`• ${booking.name || 'Unknown'}${timeStr} - ${booking.service || 'Service'}`);
      
      if (booking.advancePaid && booking.advanceAmount) {
        advanceTotal += parseFloat(booking.advanceAmount) || 0;
        advanceCount++;
      }
    });

    // Create notification body
    let body = `You have ${bookingCount} appointment${bookingCount > 1 ? 's' : ''} scheduled for tomorrow`;
    if (advanceCount > 0) {
      body += `\n${advanceCount} customer${advanceCount > 1 ? 's' : ''} paid advance (₹${advanceTotal})`;
    }

    // Create notification payload
    const message = {
      notification: {
        title: `📅 Tomorrow's Bookings (${bookingCount})`,
        body: body,
      },
      data: {
        date: tomorrowStr,
        count: bookingCount.toString(),
        bookings: JSON.stringify(bookingsList),
        advanceTotal: advanceTotal.toString(),
        advanceCount: advanceCount.toString(),
        click_action: "/manage-bookings"
      },
      token: managerToken,
      webpush: {
        notification: {
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'booking-reminder',
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'View Bookings'
            }
          ]
        }
      }
    };

    // Send push notification using Firebase Admin
    try {
      const messaging = admin.messaging();
      const response = await messaging.send(message);
      console.log('Push notification sent successfully:', response);
      
      // Log the notification to Firestore for tracking
      await adminDb.collection('notification_logs').add({
        type: 'booking_reminder',
        date: tomorrowStr,
        bookingCount,
        advanceTotal,
        advanceCount,
        sentAt: new Date(),
        messageId: response,
        success: true
      });
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Notification sent successfully',
        bookingCount,
        date: tomorrowStr,
        advanceTotal,
        advanceCount
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Error sending push notification:', error);
      
      // Log the error
      await adminDb.collection('notification_logs').add({
        type: 'booking_reminder',
        date: tomorrowStr,
        bookingCount,
        error: error.message,
        sentAt: new Date(),
        success: false
      });

      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        bookingCount,
        date: tomorrowStr
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in booking reminder cron:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
