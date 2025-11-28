import { useEffect, useState } from 'react';
import { apiGet } from '../utils/api';

export function useProductDetail(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    async function load() {
      try {
        setLoading(true);
        const data = await apiGet(`/api/products/${productId}`);
        setProduct(data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        // console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  return { product, loading };
}
