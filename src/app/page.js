'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Users, History, LogOut, Plus, Menu } from 'lucide-react';
import { signOutUser, getCustomerRecords } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import ClientOnly from '@/components/ClientOnly';
export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ today: 0, todayCollection: 0, month: 0, monthCollection: 0, total: 0, totalCustomers: 0 });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      (async () => {
        const records = await getCustomerRecords();
        const todayStr = new Date().toLocaleDateString('en-CA');
        const monthStr = new Date().toISOString().slice(0, 7);
        let today = 0, todayCollection = 0, month = 0, monthCollection = 0, total = 0;
        const totalCustomerSet = new Set();
        const monthCustomerSet = new Set();
        records.forEach(rec => {
          const dateObj = rec.createdAt?.toDate ? rec.createdAt.toDate() : new Date(rec.createdAt);
          const dateStr = dateObj.toLocaleDateString('en-CA');
          const monthKey = dateObj.toISOString().slice(0, 7);
          const amt = parseFloat(rec.amount) || 0;
          const custKey = (rec.phone || rec.name || '').trim().toLowerCase();
          if (dateStr === todayStr) {
            today++;
            todayCollection += amt;
          }
          if (monthKey === monthStr) {
            month++;
            monthCollection += amt;
            if (custKey) monthCustomerSet.add(custKey);
          }
          if (custKey) totalCustomerSet.add(custKey);
          total += amt;
        });
        setStats({
          today,
          todayCollection,
          month,
          monthCollection,
          total,
          totalCustomers: records.length, // show total records/visits
          monthCustomers: monthCustomerSet.size
        });
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        {/* Header */}
        <header className="bg-gray-950 shadow-sm border-b border-gray-800 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center justify-between w-full">
                <h1 className="text-xl font-bold text-white tracking-wide">FBS</h1>
                <div className="relative">
                  <button
                    className="ml-2 p-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-pink-400 focus:outline-none"
                    onClick={() => setMenuOpen((v) => !v)}
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-950 border border-gray-800 rounded-lg shadow-lg z-50">
                      <button
                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-800 rounded-t-lg"
                        onClick={() => { setMenuOpen(false); router.push('/manage-bookings'); }}
                      >
                        Manage Bookings
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-gray-800"
                        onClick={() => { setMenuOpen(false); router.push('/analytics'); }}
                      >
                        Analytics
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 text-sm text-pink-400 hover:bg-gray-800 rounded-b-lg border-t border-gray-800 flex items-center gap-2"
                        onClick={() => { setMenuOpen(false); handleLogout(); }}
                      >
                        <LogOut className="h-5 w-5" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ...removed welcome and description... */}

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Add Customer Card */}
            <div
              className="bg-gray-950 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              onClick={() => router.push('/add-customer')}
              tabIndex={0}
              role="button"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push('/add-customer'); }}
            >
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Add New Customer
                </h3>
              </div>
            </div>

            {/* View History Card */}
            <div
              className="bg-gray-950 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              onClick={() => router.push('/history')}
              tabIndex={0}
              role="button"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push('/history'); }}
            >
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                  <History className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  View History
                </h3>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Quick Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* 1. Today's Customers */}
              <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Today&apos;s Customers</p>
                    <p className="text-2xl font-bold text-white">{stats.today}</p>
                  </div>
                  <Users className="h-8 w-8 text-pink-500" />
                </div>
              </div>
              {/* 2. Today's Collection */}
              <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Today&apos;s Collection</p>
                    <p className="text-2xl font-bold text-white">₹{stats.todayCollection.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">₹</span>
                  </div>
                </div>
              </div>
              {/* 3. This Month's Customers */}
              <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">This Month&apos;s Customers</p>
                    <p className="text-2xl font-bold text-white">{stats.monthCustomers}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              {/* 4. This Month's Collection */}
              <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">This Month&apos;s Collection</p>
                    <p className="text-2xl font-bold text-white">₹{stats.monthCollection.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">₹</span>
                  </div>
                </div>
              </div>
              {/* 5. Total Customers */}
              <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total Customers</p>
                    <p className="text-2xl font-bold text-white">{stats.totalCustomers}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </div>
              {/* 6. Total Collection */}
              <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total Collection</p>
                    <p className="text-2xl font-bold text-white">₹{stats.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
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
