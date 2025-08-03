// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase with your config
// Note: These are public keys safe for client-side use
firebase.initializeApp({
  apiKey: "AIzaSyAAtPnSogEvJbxqPg7r1P1nbj6DWIn3zyU",
  authDomain: "freny-bridal-studio-ffd05.firebaseapp.com",
  projectId: "freny-bridal-studio-ffd05",
  storageBucket: "freny-bridal-studio-ffd05.firebasestorage.app",
  messagingSenderId: "74454173362",
  appId: "1:74454173362:web:3c293cde0130f824f7abab"
});

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
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
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app and navigate to manage bookings
    event.waitUntil(
      clients.openWindow('/manage-bookings')
    );
  }
});
