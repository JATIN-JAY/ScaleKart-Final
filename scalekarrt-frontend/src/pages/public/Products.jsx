import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';


import { productsAPI } from '../../api/products';
import ProductGrid from '../../components/products/ProductGrid';
import ProductFilters from '../../components/products/ProductFilters';
import Button from '../../components/common/Button';

/**
 * Products Listing Page – Production Ready
 * - Abortable API calls
 * - SEO metadata
 * - Error UI + retry
 * - Proper URL sync
 * - Type-safe pagination
 */
export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** ---------- FILTER STATE ---------- */
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    ratings: searchParams.get('ratings') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1,
  });

  /** ---------- FETCH PRODUCTS ---------- */
  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    syncURL();

    return () => controller.abort();
  }, [filters]);

  const fetchProducts = async (signal) => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params[key] = value;
        }
      });

      const res = await productsAPI.getAll(params, { signal });

      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /** ---------- URL SYNC ---------- */
  const syncURL = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    setSearchParams(params, { replace: true });
  };

  /** ---------- HANDLERS ---------- */
  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      ratings: '',
      sort: '-createdAt',
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** ---------- SEO TITLE ---------- */
  const pageTitle = filters.category
    ? `${filters.category} Products – ScaleKarrt`
    : 'All Products – ScaleKarrt';

  return (
    <>
     

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Products</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ---------- FILTERS ---------- */}
          <div className="lg:col-span-1">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* ---------- PRODUCTS ---------- */}
          <div className="lg:col-span-3">

            {/* Sort & Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {pagination && `Showing ${products.length} of ${pagination.total} products`}
              </p>

              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sort: e.target.value }))
                }
                className="input w-48"
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-ratings">Highest Rated</option>
              </select>
            </div>

            {/* Error State */}
            {error ? (
              <div className="text-center py-16">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => fetchProducts()}>
                  Retry
                </Button>
              </div>
            ) : (
              <ProductGrid products={products} loading={loading} />
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Previous
                </button>

                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 border rounded ${
                      pagination.page === i + 1
                        ? 'bg-primary-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
