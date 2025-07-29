'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { addCustomerRecord } from '@/lib/firebase';
import { addToGoogleSheets } from '@/lib/googleSheets';
import { toast } from 'react-hot-toast';
import { ArrowLeft, User, Phone, Scissors, DollarSign, CreditCard, Save, CheckCircle } from 'lucide-react';
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

export default function AddCustomerPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    amount: '',
    paymentMode: 'cash'
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
    router.push('/login');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.service || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setSuccess(false);

    try {
      // Step 1: Add to Firestore
      toast.loading('Saving to database...', { id: 'firestore' });
      await addCustomerRecord(formData);
      toast.success('Saved to database!', { id: 'firestore' });

      // Step 2: Add to Google Sheets
      toast.loading('Logging to Google Sheets...', { id: 'sheets' });
      await addToGoogleSheets(formData);
      toast.success('Logged to Google Sheets!', { id: 'sheets' });

      // Success
      setSuccess(true);
      toast.success('Customer record added successfully! 🎉');
      
      // Reset form after a short delay
      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          service: '',
          amount: '',
          paymentMode: 'cash'
        });
        setSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error adding customer record:', error);
      
      if (error.message.includes('sheets')) {
        toast.error('Saved to database but failed to log to Google Sheets. Please check configuration.');
      } else {
        toast.error('Failed to add customer record. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Success!
          </h2>
          <p className="text-gray-600 mb-6">
            Customer record has been saved to both database and Google Sheets.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all duration-200"
            >
              Add Another Customer
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Add New Customer</h1>
                  <p className="text-sm text-gray-500">Record customer details and services</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Data Storage</h3>
              <p className="text-xs text-blue-700">
                Customer records will be automatically saved to both Firebase database and Google Sheets for backup and reporting.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                    placeholder="Enter customer name"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Service */}
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Provided *
                </label>
                <div className="relative">
                  <Scissors className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    id="service"
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors appearance-none bg-white"
                  >
                    <option value="">Select a service</option>
                    {SERVICES.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {PAYMENT_MODES.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <label
                        key={mode.id}
                        className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.paymentMode === mode.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMode"
                          value={mode.id}
                          checked={formData.paymentMode === mode.id}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <Icon className={`h-5 w-5 mr-3 ${
                          formData.paymentMode === mode.id ? 'text-pink-500' : 'text-gray-400'
                        }`} />
                        <span className={`font-medium ${
                          formData.paymentMode === mode.id ? 'text-pink-700' : 'text-gray-700'
                        }`}>
                          {mode.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{submitting ? 'Saving...' : 'Save Customer Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ClientOnly>
  );
} 