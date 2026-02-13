// src/utils/formatters.js

// ------------------------------------
// Currency Formatter (INR)
// ------------------------------------
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `₹${Number(amount).toFixed(2)}`;
  }
};

// ------------------------------------
// Date Formatter (DD Mon YYYY)
// ------------------------------------
export const formatDate = (date) => {
  if (!date) return '—';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ------------------------------------
// DateTime Formatter
// ------------------------------------
export const formatDateTime = (date) => {
  if (!date) return '—';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ------------------------------------
// Text Truncation
// ------------------------------------
export const truncateText = (text, maxLength = 50) => {
  if (!text || typeof text !== 'string') return '';

  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength).trimEnd() + '…';
};
