import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiRequest from '../utils/api';
import { Plus, Edit, Trash2, List } from 'lucide-react';

const AdminProductListScreen = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);

  const navigate = useNavigate();

  const fetchProducts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await apiRequest(`/products?page=${pageNum}&limit=10`);
      setProducts(data.products);
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProductHandler = async () => {
    setLoadingCreate(true);
    try {
      const created = await apiRequest('/products', {
        method: 'POST',
      });
      // Redirect to edit page
      navigate(`/admin/product/${created._id}/edit`);
    } catch (err) {
      alert(err.message || 'Product creation failed');
    } finally {
      setLoadingCreate(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiRequest(`/products/${id}`, {
          method: 'DELETE',
        });
        fetchProducts(page);
      } catch (err) {
        alert(err.message || 'Product deletion failed');
      }
    }
  };

  const handlePageChange = (pageNum) => {
    fetchProducts(pageNum);
  };

  return (
    <div className="container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 700 }} className="text-gradient">
          Product Catalog
        </h1>
        <button className="btn btn-primary" onClick={createProductHandler} disabled={loadingCreate}>
          <Plus size={16} />
          <span>{loadingCreate ? 'Creating...' : 'Create Product'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 8px' }}>Product ID</th>
                  <th style={{ padding: '12px 8px' }}>Name</th>
                  <th style={{ padding: '12px 8px' }}>Price</th>
                  <th style={{ padding: '12px 8px' }}>Category</th>
                  <th style={{ padding: '12px 8px' }}>Brand</th>
                  <th style={{ padding: '12px 8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {product._id}
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{product.name}</td>
                    <td style={{ padding: '12px 8px' }}>₹{product.price.toFixed(2)}</td>
                    <td style={{ padding: '12px 8px' }}>{product.category}</td>
                    <td style={{ padding: '12px 8px' }}>{product.brand}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          to={`/admin/product/${product._id}/edit`}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => deleteHandler(product._id)}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 10px',
                            fontSize: '12px',
                            color: 'var(--danger-color)',
                            borderColor: 'rgba(239, 68, 68, 0.1)',
                            background: 'rgba(239, 68, 68, 0.03)',
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
  );
};

export default AdminProductListScreen;
