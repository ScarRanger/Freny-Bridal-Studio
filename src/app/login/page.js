'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import { Chrome, Shield, Users } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      await signInWithGoogle();
      toast.success('Login successful!');
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error.message.includes('Unauthorized')) {
        toast.error('Access denied. Please contact administrator for access credentials.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Freny Bridal Studio
          </h2>
          <p className="text-gray-600">Beauty Parlor Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Secure Access
            </h3>
            <p className="text-sm text-gray-600">
              Sign in with your authorized Google account to access the management system
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            <Chrome className="h-5 w-5" />
            <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-4">
              <Users className="h-4 w-4" />
              <span>Authorized accounts only</span>
            </div>
            <p className="text-xs text-gray-400">
              Contact administrator for access credentials
            </p>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Authorized Accounts:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• admin@frenybridal.com</li>
              <li>• manager@frenybridal.com</li>
              <li>• staff@frenybridal.com</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 