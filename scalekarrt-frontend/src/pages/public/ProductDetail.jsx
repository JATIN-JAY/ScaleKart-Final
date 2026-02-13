import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';


import { productsAPI } from '../../api/products';
import ProductDetail from '../../components/products/ProductDetail';
import ReviewSection from '../../components/products/ReviewSection';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchProduct(controller.signal);
    return () => controller.abort();
  }, [id]);

  const fetchProduct = async (signal) => {
    try {
      setLoading(true);
      setError(null);

      const res = await productsAPI.getById(id, { signal });
      setProduct(res.data.product);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /** ---------- STATES ---------- */

  if (loading) return <Loader fullScreen />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchProduct()}>Retry</Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Product not found
      </div>
    );
  }

  /** ---------- SEO ---------- */

  const title = `${product.name} – Buy Online | ScaleKarrt`;
  const description =
    product.description?.slice(0, 150) ||
    'Buy quality products from trusted sellers across India.';

  return (
    <>
      

      <div className="container mx-auto px-4 py-8">
        <ProductDetail product={product} />
        <ReviewSection product={product} onReviewAdded={() => fetchProduct()} />
      </div>
    </>
  );
}
