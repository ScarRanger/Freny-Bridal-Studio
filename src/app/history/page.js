'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCustomerRecords, updateCustomerRecord, deleteCustomerRecord } from '@/lib/firebase';
// import { updateGoogleSheets } from '@/lib/googleSheets';
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
      filtered = filtered.filter(record => {
        const name = record.name ? record.name.toLowerCase() : '';
        const service = record.service ? record.service.toLowerCase() : '';
        const phone = record.phone || '';
        return name.includes(searchTerm.toLowerCase()) ||
          service.includes(searchTerm.toLowerCase()) ||
          phone.includes(searchTerm);
      });
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
      services: Array.isArray(record.services) ? [...record.services] : record.services ? [record.services] : record.service ? [record.service] : [],
      amount: record.amount,
      paymentMode: record.paymentMode
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.services || editForm.services.length === 0 || !editForm.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      await updateCustomerRecord(editingRecord.id, {
        ...editForm,
        services: editForm.services
      });
      // Update Google Sheets
      await fetch('/api/update-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex: editingRecord.sheetRowIndex, customerData: {
          ...editForm,
          services: editForm.services
        } })
      });
      toast.success('Record updated successfully!');
      setEditingRecord(null);
      loadRecords();
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
      // Delete from Google Sheets
      const record = records.find(r => r.id === recordId);
      if (record && record.sheetRowIndex !== undefined) {
        await fetch('/api/update-customer', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rowIndex: record.sheetRowIndex })
        });
      }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        {/* Header */}
        <header className="bg-gray-950 shadow-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-pink-500 to-purple-700 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Customer History</h1>
                  <p className="text-sm text-gray-400">View and manage past records</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-gray-950 rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, service, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-800 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors bg-gray-900 text-white placeholder:text-gray-400 placeholder:opacity-100"
                />
              </div>

              {/* Month Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border border-gray-800 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors appearance-none bg-gray-900 ${!selectedMonth ? 'text-gray-400' : 'text-white'}`}
                >
                  <option value="" disabled className="text-gray-400">All Months</option>
                  {getMonthOptions().map(month => (
                    <option key={month} value={month}>
                      {format(parseISO(month + '-01'), 'MMMM yyyy')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Record Count */}
              <div className="flex items-center justify-center bg-gray-900 rounded-lg px-4 py-3">
                <span className="text-sm font-medium text-white">
                  {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Records */}
          {loadingRecords ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600 mb-4">
                <Calendar className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No records found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedRecords).map(([month, monthRecords]) => {
                const monthlyTotal = monthRecords.reduce((sum, rec) => sum + (parseFloat(rec.amount) || 0), 0);
                return (
                  <div key={month} className="bg-gray-950 rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-700 px-6 py-4 flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">{month}</h2>
                      <span className="text-lg font-semibold text-yellow-200">₹{monthlyTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-white px-6 font-semibold">{monthRecords.length} record{monthRecords.length !== 1 ? 's' : ''}</p>
                    <div className="divide-y divide-gray-800">
                      {monthRecords.map((record) => (
                        <div key={record.id} className="p-6 hover:bg-gray-900 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-white">{record.name}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  record.paymentMode === 'cash' 
                                    ? 'bg-green-900 text-green-200' 
                                    : 'bg-blue-900 text-blue-200'
                                }`}>
                                  {record.paymentMode === 'cash' ? 'Cash' : 'UPI'}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-300">
                                <div className="flex items-center space-x-2">
                                  <Scissors className="h-4 w-4" />
                                  <span>Services:</span>
                                  {Array.isArray(record.services) ? (
                                    <ul className="list-disc pl-4">
                                      {record.services.map((srv, idx) => (
                                        <li key={idx}>{srv}</li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span>{record.services || record.service}</span>
                                  )}
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
                                className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Edit Modal */}
        {editingRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-950 rounded-2xl shadow-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Edit Record</h2>
                <button
                  onClick={() => setEditingRecord(null)}
                  className="text-gray-500 hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:text-gray-400 placeholder:opacity-100 bg-gray-900 text-white text-lg font-bold"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:text-gray-400 placeholder:opacity-100 bg-gray-900 text-white"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Services *
                  </label>
                  <div className="space-y-2">
                    {editForm.services && editForm.services.map((srv, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={srv}
                          onChange={e => {
                            const newServices = [...editForm.services];
                            newServices[idx] = e.target.value;
                            setEditForm({ ...editForm, services: newServices });
                          }}
                          className="px-3 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-full placeholder:text-gray-400 placeholder:opacity-100 bg-gray-900 text-white"
                          placeholder="Enter service name"
                        />
                        <button
                          type="button"
                          className="text-xs text-red-400 hover:underline"
                          onClick={() => {
                            const newServices = editForm.services.filter((_, i) => i !== idx);
                            setEditForm({ ...editForm, services: newServices });
                          }}
                        >Remove</button>
                      </div>
                    ))}
                    <select
                      value=""
                      onChange={e => {
                        if (e.target.value) {
                          setEditForm({ ...editForm, services: [...editForm.services, e.target.value] });
                        }
                      }}
                      className="px-3 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent w-full bg-gray-900 text-white"
                    >
                      <option value="">Add a service</option>
                      {SERVICES.filter(srv => !editForm.services.includes(srv)).map((service) => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-800 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder:text-gray-400 placeholder:opacity-100 bg-gray-900 text-white font-bold text-xl"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                              ? 'border-pink-500 bg-pink-900'
                              : 'border-gray-800 hover:border-gray-600 bg-gray-900'
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
                            editForm.paymentMode === mode.id ? 'text-pink-400' : 'text-gray-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            editForm.paymentMode === mode.id ? 'text-pink-200' : 'text-gray-300'
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
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-700 text-white py-2 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="flex-1 bg-gray-800 text-gray-300 py-2 px-4 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
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