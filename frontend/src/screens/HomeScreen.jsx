import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import apiRequest from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword') || '';
  const pageParam = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const url = `/products?keyword=${encodeURIComponent(keyword)}&page=${pageParam}`;
        const data = await apiRequest(url);
        setProducts(data.products);
        setPage(data.page);
        setPages(data.pages);
        setTotal(data.total);
      } catch (err) {
        setError(err.message || 'Error fetching products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, pageParam]);

  const handlePageChange = (pageNum) => {
    navigate(`/?keyword=${encodeURIComponent(keyword)}&page=${pageNum}`);
  };

  return (
    <div className="container">
      {/* Hero Section - Only show when not searching */}
      {!keyword && (
        <div className="glass-panel hero" style={{ borderRadius: 'var(--radius-lg)' }}>
          <div className="hero-content">
            <span className="hero-subtitle">Premium Audio & Electronics</span>
            <h1 className="hero-title">Experience the Future of Sound</h1>
            <p className="hero-desc">
              Immerse yourself in crystal clear premium acoustics. Get active noise cancellation, deep bass signatures, and up to 40 hours of continuous wireless playback.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => {
                  const el = document.getElementById('products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn btn-primary"
              >
                <span>Shop Collection</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
            alt="Premium Headphones Hero"
            className="hero-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Main Grid Section */}
      <div id="products-section" style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }} className="text-gradient">
          {keyword ? `Search Results for "${keyword}"` : 'Latest Collections'}
        </h2>

        {loading ? (
          <div className="flex-center" style={{ minHeight: '30vh' }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : products.length === 0 ? (
          <div className="glass-panel" style={{ padding: '40px', textAlignment: 'center' }}>
            No products found matching your description.
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`pagination-item ${pageNum === page ? 'active' : ''}`}
                    style={{ border: 'none', font: 'inherit' }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
