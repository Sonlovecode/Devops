// src/hooks/useProducts.js
import { useEffect, useState } from 'react';
import { apiGet } from '../utils/api';

export const useProducts = (filters = {}, searchText = '') => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const params = {
          brand: filters.brand || undefined,
          minPrice: filters.priceMin || undefined,
          maxPrice: filters.priceMax || undefined,
          condition: filters.condition || undefined,
          q: searchText || undefined,
        };

        const res = await apiGet('/products', params);

        if (!isCancelled) {
          // backend đang trả kiểu { data: [...], pagination: {...} }
          setProducts(res.data || []);
        }
      } catch (err) {
        console.error('useProducts error:', err);
        if (!isCancelled) setProducts([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
    // ✅ dùng JSON.stringify để so sánh nội dung filters, tránh vòng lặp vô hạn
  }, [searchText, JSON.stringify(filters || {})]);

  return { products, loading };
};
