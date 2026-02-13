// src/utils/helpers.js

/* -------------------- DEBOUNCE -------------------- */
export const debounce = (func, delay = 300) => {
  let timeoutId;

  const debounced = (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };

  // allow manual cancel (important for React unmount)
  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  return debounced;
};


/* -------------------- EMAIL VALIDATION -------------------- */
// Relaxed, production-safe regex (not full RFC monster)
export const validateEmail = (email) => {
  if (!email) return false;

  const re =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  return re.test(email.trim());
};


/* -------------------- PHONE VALIDATION (India-friendly) -------------------- */
export const validatePhone = (phone) => {
  if (!phone) return false;

  const cleaned = phone.replace(/\s+/g, '');

  // Supports:
  // +91XXXXXXXXXX
  // 91XXXXXXXXXX
  // XXXXXXXXXX
  const re = /^(?:\+91|91)?[6-9]\d{9}$/;

  return re.test(cleaned);
};


/* -------------------- IMAGE URL RESOLVER -------------------- */
export const getImageUrl = (image) => {
  const placeholder = '/placeholder-product.png';

  if (!image) return placeholder;

  // If already absolute URL
  if (typeof image === 'string' && image.startsWith('http')) {
    return image;
  }

  const url = typeof image === 'string' ? image : image.url;

  if (!url) return placeholder;

  // Attach backend base URL if relative path
  const base = import.meta.env.VITE_API_URL || '';

  return url.startsWith('http') ? url : `${base}${url}`;
};


/* -------------------- SLUG GENERATOR -------------------- */
export const generateSlug = (text = '') => {
  return text
    .toString()
    .normalize('NFKD') // handle unicode
    .replace(/[^\w\s-]/g, '') // remove special chars
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // spaces → dash
    .replace(/-+/g, '-'); // collapse multiple dashes
};
