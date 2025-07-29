'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCustomerRecords, updateCustomerRecord, deleteCustomerRecord } from '@/lib/firebase';
import { updateGoogleSheets } from '@/lib/googleSheets';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2, Search, Filter, Calendar, User, Phone, Scissors, DollarSign, CreditCard, Save, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ClientOnly from '@/components/ClientOnly';

const SERVICES = [
  'Hair Cut',
  'Hair Color',
  'Hair Styling',
  'Facial',
  'Threading',
  'Waxing',
  'Manicure',
  'Pedicure',
  'Bridal Makeup',
  'Party Makeup',
  'Hair Treatment',
  'Spa',
  'Other'
];

const PAYMENT_MODES = [
  { id: 'cash', label: 'Cash', icon: DollarSign },
  { id: 'upi', label: 'UPI', icon: CreditCard }
];

export default function HistoryPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadRecords();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, selectedMonth]);

  const loadRecords = async () => {
    try {
      setLoadingRecords(true);
      const data = await getCustomerRecords();
      setRecords(data);
    } catch (error) {
      console.error('Error loading records:', error);
      toast.error('Failed to load records');
    } finally {
      setLoadingRecords(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.phone && record.phone.includes(searchTerm))
      );
    }

    // Filter by month
    if (selectedMonth) {
      filtered = filtered.filter(record => {
        const recordDate = record.createdAt?.toDate ? record.createdAt.toDate() : new Date(record.createdAt);
        const recordMonth = format(recordDate, 'yyyy-MM');
        return recordMonth === selectedMonth;
      });
    }

    setFilteredRecords(filtered);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setEditForm({
      name: record.name,
      phone: record.phone || '',
      service: record.service,
      amount: record.amount,
      paymentMode: record.paymentMode
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editForm.name || !editForm.service || !editForm.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateCustomerRecord(editingRecord.id, editForm);
      
      // Update Google Sheets (you might need to implement row tracking)
      // await updateGoogleSheets(rowIndex, editForm);
      
      toast.success('Record updated successfully!');
      setEditingRecord(null);
      loadRecords(); // Reload records
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Failed to update record');
    }
  };

  const handleDelete = async (recordId) => {
    if (!confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      await deleteCustomerRecord(recordId);
      toast.success('Record deleted successfully!');
      loadRecords(); // Reload records
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
    }
  };

  const getMonthOptions = () => {
    const months = new Set();
    records.forEach(record => {
      const date = record.createdAt?.toDate ? record.createdAt.toDate() : new Date(record.createdAt);
      months.add(format(date, 'yyyy-MM'));
    });
    return Array.from(months).sort().reverse();
  };

  const groupRecordsByMonth = (records) => {
    const grouped = {};
    records.forEach(record => {
      const date = record.createdAt?.toDate ? record.createdAt.toDate() : new Date(record.createdAt);
      const monthKey = format(date, 'MMMM yyyy');
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(record);
    });
    return grouped;
  };

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

  if (!isAuthenticated) {
    return null;
  }

  const groupedRecords = groupRecordsByMonth(filteredRecords);

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
            <div className="flex items-center py-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Customer History</h1>
                  <p className="text-sm text-gray-500">View and manage past records</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, service, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* Month Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors appearance-none bg-white"
                >
                  <option value="">All Months</option>
                  {getMonthOptions().map(month => (
                    <option key={month} value={month}>
                      {format(parseISO(month + '-01'), 'MMMM yyyy')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Record Count */}
              <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-3">
                <span className="text-sm font-medium text-gray-700">
                  {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Records */}
          {loadingRecords ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedRecords).map(([month, monthRecords]) => (
                <div key={month} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">{month}</h2>
                    <p className="text-pink-100">{monthRecords.length} record{monthRecords.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {monthRecords.map((record) => (
                      <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{record.name}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                record.paymentMode === 'cash' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {record.paymentMode === 'cash' ? 'Cash' : 'UPI'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Scissors className="h-4 w-4" />
                                <span>{record.service}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4" />
                                <span>₹{record.amount}</span>
                              </div>
                              {record.phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4" />
                                  <span>{record.phone}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {format(record.createdAt?.toDate ? record.createdAt.toDate() : new Date(record.createdAt), 'PPP p')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEdit(record)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Edit Modal */}
        {editingRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Record</h2>
                <button
                  onClick={() => setEditingRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service *
                  </label>
                  <select
                    required
                    value={editForm.service}
                    onChange={(e) => setEditForm({...editForm, service: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Select a service</option>
                    {SERVICES.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Mode *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_MODES.map((mode) => {
                      const Icon = mode.icon;
                      return (
                        <label
                          key={mode.id}
                          className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                            editForm.paymentMode === mode.id
                              ? 'border-pink-500 bg-pink-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="editPaymentMode"
                            value={mode.id}
                            checked={editForm.paymentMode === mode.id}
                            onChange={(e) => setEditForm({...editForm, paymentMode: e.target.value})}
                            className="sr-only"
                          />
                          <Icon className={`h-4 w-4 mr-2 ${
                            editForm.paymentMode === mode.id ? 'text-pink-500' : 'text-gray-400'
                          }`} />
                          <span className={`text-sm font-medium ${
                            editForm.paymentMode === mode.id ? 'text-pink-700' : 'text-gray-700'
                          }`}>
                            {mode.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
} 