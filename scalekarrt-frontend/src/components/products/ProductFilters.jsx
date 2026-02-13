import { useEffect, useState } from 'react';
import { CATEGORIES } from '../../utils/constants';
import { SlidersHorizontal, X } from 'lucide-react';

export default function ProductFilters({ filters, onFilterChange, onReset }) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync external filters
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Lock scroll on mobile modal
  useEffect(() => {
    document.body.style.overflow = showMobileFilters ? 'hidden' : 'auto';
    return () => (document.body.style.overflow = 'auto');
  }, [showMobileFilters]);

  // Handlers
  const handleCategoryChange = (category) => {
    const updated =
      localFilters.category === category
        ? { ...localFilters, category: '' }
        : { ...localFilters, category };

    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...localFilters, [name]: value };
    setLocalFilters(updated);
  };

  const handleRatingChange = (rating) => {
    const updated =
      localFilters.ratings === rating
        ? { ...localFilters, ratings: '' }
        : { ...localFilters, ratings: rating };

    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const applyMobileFilters = () => {
    onFilterChange(localFilters);
    setShowMobileFilters(false);
  };

  // UI block
  const FilterContent = ({ isMobile = false }) => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.category === category}
                onChange={() => handleCategoryChange(category)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            value={localFilters.minPrice || ''}
            onChange={handlePriceChange}
            className="input text-sm"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            value={localFilters.maxPrice || ''}
            onChange={handlePriceChange}
            className="input text-sm"
          />
        </div>

        {/* Apply only on mobile */}
        {isMobile && (
          <button
            onClick={applyMobileFilters}
            className="mt-3 w-full btn btn-primary"
          >
            Apply Filters
          </button>
        )}
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={localFilters.ratings === rating}
                onChange={() => handleRatingChange(rating)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">{rating}★ & above</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button onClick={onReset} className="w-full btn btn-secondary">
        Reset Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Floating Button */}
      <button
        onClick={() => setShowMobileFilters(true)}
        aria-label="Open filters"
        className="lg:hidden fixed bottom-4 right-4 bg-primary-600 text-white p-4 rounded-full shadow-lg z-40"
      >
        <SlidersHorizontal className="w-6 h-6" />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block card p-6 sticky top-24">
        <h2 className="font-bold text-lg mb-4">Filters</h2>
        <FilterContent />
      </div>

      {/* Mobile Drawer */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50">
          <div
            className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <FilterContent isMobile />
          </div>
        </div>
      )}
    </>
  );
}
