import { format, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return format(dateObj, 'PPP');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDateTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return format(dateObj, 'PPP p');
  } catch (error) {
    console.error('Error formatting date time:', error);
    return '';
  }
};

export const formatMonth = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return format(dateObj, 'MMMM yyyy');
  } catch (error) {
    console.error('Error formatting month:', error);
    return '';
  }
};

export const getMonthKey = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = date?.toDate ? date.toDate() : new Date(date);
    return format(dateObj, 'yyyy-MM');
  } catch (error) {
    console.error('Error getting month key:', error);
    return '';
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const validatePhoneNumber = (phone) => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0;
}; 