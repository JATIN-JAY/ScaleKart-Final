import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // ================= ADD ITEM =================
      addItem: (product, quantity = 1) =>
        set((state) => {
          if (!product || !product._id) return state;

          const existing = state.items.find(
            (i) => i.product._id === product._id
          );

          if (existing) {
            const newQty = Math.min(
              existing.quantity + quantity,
              product.stock || 99
            );

            return {
              items: state.items.map((i) =>
                i.product._id === product._id
                  ? { ...i, quantity: newQty }
                  : i
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity }],
          };
        }),

      // ================= REMOVE ITEM =================
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product._id !== productId),
        })),

      // ================= UPDATE QUANTITY =================
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product._id === productId
              ? {
                  ...i,
                  quantity: Math.max(
                    1,
                    Math.min(quantity, i.product.stock || 99)
                  ),
                }
              : i
          ),
        })),

      // ================= CLEAR CART =================
      clearCart: () => set({ items: [] }),

      // ================= CALCULATIONS =================
      getSubtotal: () =>
        get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        ),

      // 🔥 BACKWARD-COMPATIBLE FIX (Cart.jsx was calling getTotal)
      getTotal: () => get().getSubtotal(),

      getTax: () => Number((get().getSubtotal() * 0.1).toFixed(2)),

      getShipping: () => (get().getSubtotal() > 100 ? 0 : 10),

      getGrandTotal: () => {
        const { getSubtotal, getTax, getShipping } = get();
        return Number(
          (getSubtotal() + getTax() + getShipping()).toFixed(2)
        );
      },

      getItemCount: () =>
        get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: 'cart-storage',

      // Persist only items (avoid storing functions)
      partialize: (state) => ({ items: state.items }),
    }
  )
);
