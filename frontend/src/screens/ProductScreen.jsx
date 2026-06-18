import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiRequest from '../utils/api';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import Rating from '../components/Rating';
import { ArrowLeft, ShoppingCart, MessageSquarePlus, Trash2 } from 'lucide-react';

const ProductScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [errorReview, setErrorReview] = useState('');
  const [successReview, setSuccessReview] = useState(false);

  const { addToCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);

  const fetchProduct = async () => {
    try {
      const data = await apiRequest(`/products/${id}`);
      setProduct(data);
    } catch (err) {
      setError(err.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(
      {
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        countInStock: product.countInStock,
      },
      Number(qty)
    );
    navigate('/cart');
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    setErrorReview('');
    setSuccessReview(false);
    setLoadingReview(true);

    try {
      await apiRequest(`/products/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });
      setSuccessReview(true);
      setComment('');
      // Refresh product stats
      fetchProduct();
    } catch (err) {
      setErrorReview(err.message || 'Failed to submit review');
    } finally {
      setLoadingReview(false);
    }
  };
  const deleteReviewHandler = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await apiRequest(`/products/${id}/reviews/${reviewId}`, {
          method: 'DELETE',
        });
        fetchProduct();
      } catch (err) {
        alert(err.message || 'Failed to delete review');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Link to="/" className="btn btn-secondary" style={{ marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/" className="btn btn-secondary" style={{ marginBottom: '32px' }}>
        <ArrowLeft size={16} /> Back to Products
      </Link>

      {product && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              marginBottom: '50px',
              alignItems: 'start',
            }}
          >
            {/* Image Showcase */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', borderRadius: 'var(--radius-md)', display: 'block', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>

            {/* Product description & specs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: 'var(--primary-color)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                }}
              >
                {product.category} | {product.brand}
              </span>
              <h1 style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1.2 }}>{product.name}</h1>

              <Rating value={product.rating} text={`${product.numReviews} ratings`} />

              <div style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>
                ₹{product.price.toFixed(2)}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Description</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
                  {product.description}
                </p>
              </div>
            </div>

            {/* Shopping status and action panel */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Price:</span>
                <strong style={{ fontSize: '18px' }}>₹{product.price.toFixed(2)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <strong style={{ color: product.countInStock > 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                  {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                </strong>
              </div>

              {product.countInStock > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Quantity:</span>
                  <select
                    className="form-control"
                    style={{ width: '80px', padding: '6px 12px' }}
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  >
                    {[...Array(Math.min(product.countInStock, 10)).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={product.countInStock === 0}
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>

          {/* Reviews section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '40px', marginTop: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>Customer Reviews</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 450px)', gap: '40px', alignItems: 'start' }}>
              {/* Review List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {product.reviews.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '24px', color: 'var(--text-secondary)' }}>
                    No reviews yet. Be the first to review this product!
                  </div>
                ) : (
                  product.reviews.map((rev) => (
                    <div key={rev._id} className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong>{rev.name}</strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {rev.createdAt?.substring(0, 10) || 'N/A'}
                          </span>
                          {userInfo?.isAdmin && (
                            <button
                              onClick={() => deleteReviewHandler(rev._id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--danger-color)',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Delete Review"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <Rating value={rev.rating} />
                      <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '14px' }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Submit Review */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquarePlus size={18} /> Write a Review
                </h3>

                {successReview && <div className="alert alert-success">Review submitted successfully!</div>}
                {errorReview && <div className="alert alert-danger">{errorReview}</div>}

                {userInfo ? (
                  <form onSubmit={submitReviewHandler}>
                    <div className="form-group">
                      <label htmlFor="rating">Rating</label>
                      <select
                        id="rating"
                        className="form-control"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Average</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="comment">Comment</label>
                      <textarea
                        id="comment"
                        className="form-control"
                        rows="4"
                        placeholder="Write your review here..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      disabled={loadingReview}
                    >
                      {loadingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px' }}>
                    Please{' '}
                    <Link to={`/login?redirect=/product/${product._id}`} style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                      sign in
                    </Link>{' '}
                    to leave a product review.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductScreen;
