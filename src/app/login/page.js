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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Freny Bridal Studio
          </h2>
          <p className="text-gray-300">Beauty Parlor Management System</p>
        </div>

        <div className="bg-gray-950 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Secure Access
            </h3>
            <p className="text-sm text-gray-300">
              Sign in with your authorized Google account to access the management system
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-gray-900 border-2 border-gray-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            <Chrome className="h-5 w-5" />
            <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mb-4">
              <Users className="h-4 w-4" />
              <span>Authorized accounts only</span>
            </div>
            <p className="text-xs text-gray-400">
              Contact administrator for access credentials
            </p>
          </div>

          
        </div>
      </div>
    </div>
  );
} 