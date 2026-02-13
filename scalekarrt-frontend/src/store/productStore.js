import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { productsAPI } from '../api/products';

export const useProductStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ---------- STATE ----------
        products: [],
        selectedProduct: null,
        loading: false,
        error: null,

        filters: {
          search: '',
          category: '',
          minPrice: '',
          maxPrice: '',
          ratings: '',
        },

        // ---------- SETTERS ----------
        setProducts: (products) => set({ products }),

        setSelectedProduct: (product) => set({ selectedProduct: product }),

        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
          })),

        resetFilters: () =>
          set({
            filters: {
              search: '',
              category: '',
              minPrice: '',
              maxPrice: '',
              ratings: '',
            },
          }),

        // ---------- ASYNC ACTIONS ----------
        fetchProducts: async (params = {}) => {
          try {
            set({ loading: true, error: null });

            const res = await productsAPI.getAll({
              ...get().filters,
              ...params,
            });

            set({
              products: res.data.products,
              loading: false,
            });
          } catch (err) {
            set({
              error: err?.response?.data?.message || 'Failed to fetch products',
              loading: false,
            });
          }
        },

        fetchProductById: async (id) => {
          try {
            set({ loading: true, error: null });

            const res = await productsAPI.getById(id);

            set({
              selectedProduct: res.data.product,
              loading: false,
            });
          } catch (err) {
            set({
              error: err?.response?.data?.message || 'Failed to fetch product',
              loading: false,
            });
          }
        },

        clearSelectedProduct: () => set({ selectedProduct: null }),
      }),
      {
        name: 'product-store', // localStorage key
        partialize: (state) => ({
          filters: state.filters,
          selectedProduct: state.selectedProduct,
        }),
      }
    )
  )
);
