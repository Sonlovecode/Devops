// src/hooks/useProducts.js
import { useEffect, useState } from 'react';
import { apiGet } from '../utils/api';

export const useProducts = (filters = {}, searchText = '') => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

        // LƯU Ý: chỉ '/products', KHÔNG phải '/api/products'
        const res = await apiGet('/products', params);

        // backend đang trả kiểu { data: [...], pagination: {...} }
        setProducts(res.data || []);
      } catch (err) {
        console.error('useProducts error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filters, searchText]);

  return { products, loading };
};
