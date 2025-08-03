import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';

export const useFCM = () => {
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState(Notification.permission);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        // Register service worker first
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        }

        const permission = await Notification.requestPermission();
        setPermission(permission);
        
        if (permission === 'granted') {
          const messaging = getMessaging(app);
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
          });
          
          if (currentToken) {
            setToken(currentToken);
            // Save token to Firestore
            await saveTokenToFirestore(currentToken);
            console.log('FCM Token:', currentToken);
          } else {
            console.log('No registration token available.');
          }
        }
      } catch (error) {
        console.error('Error getting FCM token:', error);
      } finally {
        setLoading(false);
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && permission === 'granted') {
      const messaging = getMessaging(app);
      
      // Listen for foreground messages
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        
        // Show notification when app is in foreground
        if (Notification.permission === 'granted') {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/icon-192x192.png',
            tag: 'booking-reminder'
          });
        }
      });

      return () => unsubscribe();
    }
  }, [permission]);

  return { token, permission, loading };
};

const saveTokenToFirestore = async (token) => {
  try {
    const response = await fetch('/api/save-fcm-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    if (response.ok) {
      console.log('FCM token saved successfully');
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};
