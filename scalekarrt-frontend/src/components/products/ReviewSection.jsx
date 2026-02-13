import { useState, useMemo } from 'react';
import { Star } from 'lucide-react';
import { productsAPI } from '../../api/products';
import { useAuthStore } from '../../store/authStore';
import { formatDate } from '../../utils/formatters';
import Button from '../common/Button';
import Loader from '../common/Loader';
import toast from 'react-hot-toast';

export default function ReviewSection({ product, loading, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { isAuthenticated, user } = useAuthStore();

  // ================= LOADING =================
  if (loading) return <Loader />;

  if (!product) return null;

  // ================= HELPERS =================
  const hasUserReviewed = useMemo(() => {
    return product.reviews?.some((review) => {
      const reviewUserId =
        typeof review.user === 'object' ? review.user._id : review.user;
      return reviewUserId === user?._id;
    });
  }, [product.reviews, user?._id]);

  const isBuyer = user?.role === 'buyer';

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to add a review');
      return;
    }

    if (!isBuyer) {
      toast.error('Only buyers can add reviews');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Invalid rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    if (comment.length < 5) {
      toast.error('Comment must be at least 5 characters');
      return;
    }

    setSubmitting(true);

    try {
      await productsAPI.addReview(product._id, { rating, comment });

      toast.success('Review added successfully!');
      setComment('');
      setRating(5);

      onReviewAdded?.(); // refresh product
    } catch (err) {
      // handled globally
    } finally {
      setSubmitting(false);
    }
  };

  // ================= UI =================
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {/* ================= ADD REVIEW ================= */}
      {isAuthenticated && isBuyer && !hasUserReviewed && (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold mb-4">Write a Review</h3>

          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div className="mb-4">
              <label className="label">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`Rate ${star} star`}
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-8 h-8 transition ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="label">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                className="input"
                placeholder="Share your experience with this product..."
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            <Button type="submit" loading={submitting}>
              Submit Review
            </Button>
          </form>
        </div>
      )}

      {/* ================= LOGIN PROMPT ================= */}
      {!isAuthenticated && (
        <p className="text-gray-500 mb-6">
          Please login as a buyer to write a review.
        </p>
      )}

      {/* ================= REVIEWS LIST ================= */}
      <div className="space-y-4">
        {!product.reviews || product.reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No reviews yet. Be the first to review!
          </p>
        ) : (
          product.reviews.map((review) => (
            <div key={review._id} className="card p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{review.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </p>
                </div>

                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 whitespace-pre-line">
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
