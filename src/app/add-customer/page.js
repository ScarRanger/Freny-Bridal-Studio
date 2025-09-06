'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  User,
  Save,
  CheckCircle,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import ClientOnly from '@/components/ClientOnly';

const SERVICES = [
  'Eyebrow',
  'Haircut',
  'Bleach',
  'Facial',
  'Wax',
  'Forehead',
  'Upper lip',
  'Pedicure',
  'Manicure',
  'Hair spa',
  'Hair oil massage',
  'Hydra facial',
  'Korean Glass facial',
  'Body massage',
  'Bridal make up',
  'Party make up',
  'Straightening',
  'Smoothening',
  'Nano plastic',
  'Keratin',
  'Cleanup',
  'Underarms',
  'Hand wax',
  'Leg wax',
  'Upper/chin lip wax',
  'Face wax',
  'Highlight',
  'Hair colour',
  'Mehendi hair dye',
  'Hairwash',
  'Hairstyle',
  'Makeup',
  'Saree draping',
  'Hair ironing',
  'Other',
];

const PAYMENT_MODES = [
  { id: 'cash', label: 'Cash', icon: DollarSign },
  { id: 'upi', label: 'UPI', icon: CreditCard },
];

export default function AddCustomerPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    amount: '',
    paymentMode: 'cash',
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceToAdd, setServiceToAdd] = useState('');
  const [customService, setCustomService] = useState('');
  const [manualService, setManualService] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || selectedServices.length === 0 || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setSuccess(false);
    try {
      toast.loading('Saving to database and Google Sheets...', { id: 'saving' });
      const dataToSave = {
        ...formData,
        services: selectedServices,
      };
      const response = await fetch('/api/add-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Saved to database and Google Sheets!', { id: 'saving' });
      } else {
        throw new Error(result.error || 'Failed to save');
      }

      setSuccess(true);
      toast.success('Customer record added successfully! 🎉');

      setTimeout(() => {
        setFormData({
          name: '',
          phone: '',
          amount: '',
          paymentMode: 'cash',
        });
        setSelectedServices([]);
        setServiceToAdd('');
        setCustomService('');
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding customer record:', error);
      if (error.message.includes('sheets')) {
        toast.error(
          'Saved to database but failed to log to Google Sheets. Please check configuration.'
        );
      } else {
        toast.error('Failed to add customer record. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-950 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mx-auto h-16 w-16 bg-green-900 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-300" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Success!</h2>
          <p className="text-gray-300 mb-6">
            Customer record has been saved to both database and Google Sheets.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-700 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-600 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all duration-200"
            >
              Add Another Customer
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-800 text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading...</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        {/* Header */}
        <header className="bg-gray-950 shadow-sm border-b border-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Add New Customer</h1>
                  <p className="text-sm text-gray-400">
                    Record customer details and services
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-950 rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Customer Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:outline-none transition-colors"
                  placeholder="Enter customer name"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:outline-none transition-colors"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Services *
                </label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={serviceToAdd}
                    onChange={(e) => setServiceToAdd(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-700 rounded-lg bg-gray-900 text-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:outline-none"
                  >
                    <option value="">Select a service</option>
                    {SERVICES.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-all"
                    onClick={() => {
                      if (serviceToAdd && !selectedServices.includes(serviceToAdd)) {
                        if (serviceToAdd === 'Other' && customService) {
                          setSelectedServices((prev) => [...prev, customService]);
                          setCustomService('');
                        } else if (serviceToAdd !== 'Other') {
                          setSelectedServices((prev) => [...prev, serviceToAdd]);
                        }
                        setServiceToAdd('');
                      }
                    }}
                  >
                    Add Service
                  </button>
                </div>
                {/* Custom Service Input */}
                {serviceToAdd === 'Other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customService}
                      onChange={(e) => setCustomService(e.target.value)}
                      placeholder="Enter custom service"
                      className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                )}

                {/* Custom Service Manual Entry */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={manualService}
                    onChange={(e) => setManualService(e.target.value)}
                    className="flex-1 py-3 px-4 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:outline-none"
                    placeholder="Type any service and click Add"
                  />
                  <button
                    type="button"
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-all"
                    onClick={() => {
                      const val = manualService.trim();
                      if (!val) return;
                      if (!selectedServices.includes(val)) {
                        setSelectedServices((prev) => [...prev, val]);
                      }
                      setManualService('');
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
                {/* Selected Services */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedServices.map((service, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm flex items-center gap-2"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedServices((prev) =>
                            prev.filter((s) => s !== service)
                          )
                        }
                        className="text-red-400 hover:underline"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                

              {/* Amount */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Amount *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:outline-none transition-colors"
                  placeholder="Enter amount"
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Payment Mode *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {PAYMENT_MODES.map((mode) => (
                    <label
                      key={mode.id}
                      className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.paymentMode === mode.id
                          ? 'border-purple-600 bg-purple-600 hover:bg-purple-700'
                          : 'border-gray-800 bg-gray-900 hover:border-purple-500 hover:bg-gray-800'
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
                      <span
                        className={`font-medium ${
                          formData.paymentMode === mode.id
                            ? 'text-pink-100'
                            : 'text-gray-300'
                        }`}
                      >
                        {mode.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-700 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-600 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>
                    {submitting ? 'Saving...' : 'Save Customer Record'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ClientOnly>
  );
}
