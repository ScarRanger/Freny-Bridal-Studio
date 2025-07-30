'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, History, LogOut, Plus } from 'lucide-react';
import { signOutUser } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import ClientOnly from '@/components/ClientOnly';
import { getCustomerRecords } from '@/lib/firebase';

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ today: 0, month: 0, total: 0 });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      (async () => {
        const records = await getCustomerRecords();
        const todayStr = new Date().toLocaleDateString('en-CA');
        const monthStr = new Date().toISOString().slice(0, 7);
        let today = 0, month = 0, total = 0;
        records.forEach(rec => {
          const dateObj = rec.createdAt?.toDate ? rec.createdAt.toDate() : new Date(rec.createdAt);
          const dateStr = dateObj.toLocaleDateString('en-CA');
          const monthKey = dateObj.toISOString().slice(0, 7);
          if (dateStr === todayStr) today++;
          if (monthKey === monthStr) month++;
          total += parseFloat(rec.amount) || 0;
        });
        setStats({ today, month, total });
      })();
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don&apos;t render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Freny Bridal Studio</h1>
                  <p className="text-sm text-gray-500">Beauty Parlor Management</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Freny Bridal Studio
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage your beauty parlor operations efficiently 
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Add Customer Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Add New Customer
                </h3>
                <p className="text-gray-600 mb-6">
                  Record customer details, services provided, and payment information
                </p>
                <button
                  onClick={() => router.push('/add-customer')}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Add Customer
                </button>
              </div>
            </div>

            {/* View History Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                  <History className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  View History
                </h3>
                <p className="text-gray-600 mb-6">
                  Browse past customer records, edit entries, and manage your data
                </p>
                <button
                  onClick={() => router.push('/history')}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                >
                  View History
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Quick Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today&apos;s Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                  </div>
                  <Users className="h-8 w-8 text-pink-500" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.month}</p>
                  </div>
                  <History className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="h-8 w-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">₹</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
    </div>
    </ClientOnly>
  );
}
