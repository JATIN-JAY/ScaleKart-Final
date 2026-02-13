// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';

// import { ArrowRight, ShoppingBag, Shield, Truck, HeadphonesIcon } from 'lucide-react';

// import { productsAPI } from '../../api/products';
// import { CATEGORIES } from '../../utils/constants';

// import ProductGrid from '../../components/products/ProductGrid';
// import Button from '../../components/common/Button';

// /**
//  * Home Page – Production Ready
//  * - SEO enabled
//  * - Abortable API calls
//  * - Error handling UI
//  * - Analytics ready
//  */
// export default function Home() {
//   const [featuredProducts, setFeaturedProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const controller = new AbortController();

//     fetchFeaturedProducts(controller.signal);

//     return () => controller.abort(); // prevent memory leak
//   }, []);

//   const fetchFeaturedProducts = async (signal) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const res = await productsAPI.getAll(
//         { limit: 8, sort: '-ratings', approved: true },
//         { signal }
//       );

//       setFeaturedProducts(res.data.products);
//     } catch (err) {
//       if (err.name !== 'CanceledError') {
//         console.error('Error fetching products:', err);
//         setError('Failed to load featured products.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
     

//       {/* ---------- HERO ---------- */}
//       <section className="bg-linear-to-r from-primary-600 to-purple-600 text-white">
//         <div className="container mx-auto px-4 py-20">
//           <div className="max-w-3xl">
//             <h1 className="text-5xl md:text-6xl font-bold mb-6">
//               Welcome to ScaleKarrt
//             </h1>

//             <p className="text-xl md:text-2xl mb-8 text-blue-100">
//               India's trusted multi-vendor marketplace. Shop from verified sellers across the country.
//             </p>

//             <div className="flex flex-wrap gap-4">
//               <Link to="/products">
//                 <Button
//                   size="lg"
//                   className="bg-white text-primary-600 hover:bg-gray-100"
//                 >
//                   Start Shopping
//                   <ArrowRight className="w-5 h-5" />
//                 </Button>
//               </Link>

//               <Link to="/register">
//                 <Button
//                   size="lg"
//                   variant="secondary"
//                   className="border-2 border-white text-white hover:bg-white/10"
//                 >
//                   Become a Seller
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* ---------- FEATURES ---------- */}
//       <section className="py-16 bg-white">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//             <Feature icon={<Truck />} title="Free Shipping" text="On orders over ₹100" />
//             <Feature icon={<Shield />} title="Secure Payment" text="100% secure transactions" />
//             <Feature icon={<ShoppingBag />} title="Quality Products" text="From verified sellers" />
//             <Feature icon={<HeadphonesIcon />} title="24/7 Support" text="Dedicated customer care" />
//           </div>
//         </div>
//       </section>

//       {/* ---------- CATEGORIES ---------- */}
//       <section className="py-16 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>

//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//             {CATEGORIES.map((category) => (
//               <Link
//                 key={category}
//                 to={`/products?category=${category}`}
//                 className="bg-white p-6 rounded-lg text-center hover:shadow-lg transition-shadow"
//               >
//                 <div className="text-4xl mb-3">{getCategoryIcon(category)}</div>
//                 <p className="font-semibold">{category}</p>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ---------- FEATURED PRODUCTS ---------- */}
//       <section className="py-16 bg-white">
//         <div className="container mx-auto px-4">

//           <div className="flex items-center justify-between mb-12">
//             <h2 className="text-3xl font-bold">Featured Products</h2>

//             <Link
//               to="/products"
//               className="text-primary-600 hover:underline flex items-center gap-2"
//             >
//               View All
//               <ArrowRight className="w-5 h-5" />
//             </Link>
//           </div>

//           {error ? (
//             <div className="text-center py-12">
//               <p className="text-red-500 mb-4">{error}</p>
//               <Button onClick={() => fetchFeaturedProducts()}>
//                 Retry
//               </Button>
//             </div>
//           ) : (
//             <ProductGrid products={featuredProducts} loading={loading} />
//           )}
//         </div>
//       </section>

//       {/* ---------- CTA ---------- */}
//       <section className="py-20 bg-linear-to-r from-primary-600 to-purple-600 text-white">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-4xl font-bold mb-4">Start Selling Today</h2>

//           <p className="text-xl mb-8 text-blue-100">
//             Join thousands of sellers already growing their business on ScaleKarrt
//           </p>

//           <Link to="/register">
//             <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
//               Register as Seller
//               <ArrowRight className="w-5 h-5" />
//             </Button>
//           </Link>
//         </div>
//       </section>
//     </>
//   );
// }

// /* ---------- Reusable Feature Component ---------- */
// function Feature({ icon, title, text }) {
//   return (
//     <div className="text-center">
//       <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
//         {icon}
//       </div>
//       <h3 className="font-semibold mb-2">{title}</h3>
//       <p className="text-sm text-gray-600">{text}</p>
//     </div>
//   );
// }

// /* ---------- Category Icons ---------- */
// function getCategoryIcon(category) {
//   const icons = {
//     Electronics: '💻',
//     Fashion: '👗',
//     'Home & Kitchen': '🏠',
//     Books: '📚',
//     Sports: '⚽',
//     Beauty: '💄',
//     Toys: '🧸',
//     Automotive: '🚗',
//     Health: '🏥',
//     Grocery: '🛒',
//   };
//   return icons[category] || '📦';
// }



import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { ArrowRight, ShoppingBag, Shield, Truck, HeadphonesIcon } from 'lucide-react';

import { productsAPI } from '../../api/products';
import { CATEGORIES } from '../../utils/constants';

import ProductGrid from '../../components/products/ProductGrid';
import Button from '../../components/common/Button';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchFeaturedProducts(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchFeaturedProducts = async (signal) => {
    try {
      setLoading(true);
      setError(null);

      const res = await productsAPI.getAll(
        { limit: 8, sort: '-ratings', approved: true },
        { signal }
      );

      setFeaturedProducts(res.data.products);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.error('Error fetching products:', err);
        setError('Failed to load featured products.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-6">
              Welcome to ScaleKarrt
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              India’s trusted multi-vendor marketplace. Shop quality products from verified sellers across the country.
            </p>

            <div className="flex gap-4">
              <Link to="/products">
                <Button size="lg" className="px-8">
                  Start Shopping
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>

              <Link to="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-8 border border-gray-300 text-gray-800 hover:bg-gray-50"
                >
                  Become a Seller
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Feature icon={<Truck />} title="Free Shipping" text="On orders over ₹100" />
            <Feature icon={<Shield />} title="Secure Payment" text="100% secure transactions" />
            <Feature icon={<ShoppingBag />} title="Quality Products" text="From verified sellers" />
            <Feature icon={<HeadphonesIcon />} title="24/7 Support" text="Dedicated customer care" />
          </div>
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-10">
            Shop by Category
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                to={`/products?category=${category}`}
                className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:bg-white hover:shadow-sm transition"
              >
                <div className="text-2xl mb-2">{getCategoryIcon(category)}</div>
                <p className="text-sm font-medium text-gray-800">{category}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FEATURED PRODUCTS ---------- */}
      <section className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Featured Products
            </h2>

            <Link
              to="/products"
              className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => fetchFeaturedProducts()}>Retry</Button>
            </div>
          ) : (
            <ProductGrid products={featuredProducts} loading={loading} />
          )}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Start selling on ScaleKarrt
          </h2>

          <p className="text-gray-600 mb-8">
            Join thousands of sellers already growing their business.
          </p>

          <Link to="/register">
            <Button size="lg" className="px-10">
              Register as Seller
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}

/* ---------- Feature ---------- */
function Feature({ icon, title, text }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-sm transition">
      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center text-primary-600">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{text}</p>
    </div>
  );
}

/* ---------- Category Icons ---------- */
function getCategoryIcon(category) {
  const icons = {
    Electronics: '💻',
    Fashion: '👗',
    'Home & Kitchen': '🏠',
    Books: '📚',
    Sports: '⚽',
    Beauty: '💄',
    Toys: '🧸',
    Automotive: '🚗',
    Health: '🏥',
    Grocery: '🛒',
  };
  return icons[category] || '📦';
}



