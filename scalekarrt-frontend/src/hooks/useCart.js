import { useMemo } from 'react';
import { useCartStore } from '../store/cartStore';

export const useCart = () => {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const getTotal = useCartStore((state) => state.getTotal);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const getTax = useCartStore((state) => state.getTax);
  const getShipping = useCartStore((state) => state.getShipping);
  const getGrandTotal = useCartStore((state) => state.getGrandTotal);

  // ----- derived helpers -----
  const helpers = useMemo(() => {
    const isInCart = (productId) =>
      items.some((item) => item.product._id === productId);

    const getItemQuantity = (productId) =>
      items.find((item) => item.product._id === productId)?.quantity || 0;

    return {
      isInCart,
      getItemQuantity,
    };
  }, [items]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    getTax,
    getShipping,
    getGrandTotal,
    ...helpers,
  };
};
