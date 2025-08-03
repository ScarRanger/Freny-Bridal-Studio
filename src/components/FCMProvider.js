'use client';

import { useFCM } from '@/hooks/useFCM';
import { useAuth } from '@/context/AuthContext';

export default function FCMProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { token, permission, loading } = useFCM();

  // Show notification permission status (optional)
  if (!loading && isAuthenticated && permission !== 'granted') {
    console.log('Notification permission not granted. Current status:', permission);
  }

  return children;
}
