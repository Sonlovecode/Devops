// src/hooks/useProductDetail.js
import { useEffect, useState } from 'react';
import { apiGet } from '../utils/api';

export function useProductDetail(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        // ✅ CHỈ /products, KHÔNG /api
        const res = await apiGet(`/products/${productId}`);

        // backend trả trực tiếp product (không bọc { data: ... })
        if (!cancelled) {
          setProduct(res.data || res); // an toàn cho cả 2 kiểu response
        }
      } catch (err) {
        console.error('useProductDetail error:', err);
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { product, loading };
}
