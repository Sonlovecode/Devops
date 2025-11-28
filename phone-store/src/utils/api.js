// src/utils/api.js

// Export luôn để mấy chỗ khác dùng trực tiếp (Profile, Admin, PaymentQR...)
export const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

/**
 * Gọi GET tới backend
 * @param {string} path - VD: '/products', '/orders'
 * @param {object} params - query params (optional)
 */
export async function apiGet(path, params = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(API_BASE + cleanPath);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });

  const res = await fetch(url.toString());

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API Error: ${res.status} ${text}`);
  }

  return res.json();
}
