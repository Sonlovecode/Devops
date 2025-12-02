// src/utils/api.js

// ✅ Chỉ host + port, KHÔNG có /api
export const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://localhost:5000';

/**
 * Gọi GET tới backend
 * @param {string} path - VD: '/products', '/orders'
 * @param {object} params - query params (optional)
 */
export async function apiGet(path, params = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // ✅ Luôn gắn /api ở đây, chỉ 1 lần
  const url = new URL(API_BASE + '/api' + cleanPath);

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

/**
 * Gọi POST tới backend
 * @param {string} path - VD: '/payment/qr'
 * @param {object} body
 */
export async function apiPost(path, body = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  const res = await fetch(API_BASE + '/api' + cleanPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API Error: ${res.status} ${text}`);
  }

  return res.json();
}
