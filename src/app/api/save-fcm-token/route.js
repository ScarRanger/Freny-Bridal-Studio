import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: 'Token is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Save token to Firestore
    await adminDb.collection('fcm_tokens').doc('manager').set({
      token,
      updatedAt: new Date(),
      active: true
    });

    console.log('FCM token saved to Firestore');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
