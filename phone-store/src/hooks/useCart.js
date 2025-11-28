import { useState } from 'react';

export function useCart(initialCart = []) {
  const [cart, setCart] = useState(initialCart);

  const addToCart = (productData, qty = 1) => {
    const {
      productId,
      variantId,
      name,
      color = 'Default',
      ramGb = 8,
      romGb = 256,
      price,
      img,
    } = productData;

    const key = `${productId}_${variantId}`;

    setCart((prev) => {
      const exist = prev.find((i) => i.key === key);
      if (exist) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: i.qty + qty } : i,
        );
      }
      return [
        ...prev,
        {
          key,
          productId,
          variantId,
          name,
          color,
          ramGb,
          romGb,
          price,
          qty,
          img,
        },
      ];
    });
  };

  return { cart, setCart, addToCart };
}
