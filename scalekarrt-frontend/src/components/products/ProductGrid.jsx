import { memo } from 'react';
import ProductCard from './ProductCard';
import Loader from '../common/Loader';

function ProductGrid({ products = [], loading }) {
  // Loading state
  if (loading) {
    return <Loader />;
  }

  // Empty state
  if (!products.length) {
    return (
      <div
        className="text-center py-16"
        role="status"
        aria-live="polite"
      >
        <div className="text-gray-400 mb-4">
          <svg
            className="w-24 h-24 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No products found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  // Grid
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      role="list"
    >
      {products.map((product) => (
        <div role="listitem" key={product._id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}

export default memo(ProductGrid);
