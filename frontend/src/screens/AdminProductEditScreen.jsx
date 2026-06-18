import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiRequest from '../utils/api';
import { ArrowLeft, Save, Upload } from 'lucide-react';

const AdminProductEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await apiRequest(`/products/${id}`);
        setName(data.name);
        setPrice(data.price);
        setImage(data.image);
        setBrand(data.brand);
        setCategory(data.category);
        setCountInStock(data.countInStock);
        setDescription(data.description);
      } catch (err) {
        setError(err.message || 'Product fetch failed');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const catData = await apiRequest('/categories');
        setCategories(catData);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };

    fetchProduct();
    fetchCategories();
  }, [id]);

  /**
   * Handles uploading images to the backend via Multer.
   */
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const data = await apiRequest('/upload', {
        method: 'POST',
        body: formData,
      });
      // Store the relative filepath
      setImage(data.image);
    } catch (err) {
      alert(err.message || 'Image upload failed. Allowed formats: jpg, jpeg, png, webp');
    } finally {
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);

    try {
      await apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          price: Number(price),
          image,
          brand,
          category,
          countInStock: Number(countInStock),
          description,
        }),
      });

      navigate('/admin/productlist');
    } catch (err) {
      alert(err.message || 'Product update failed');
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="container">
      <Link to="/admin/productlist" className="btn btn-secondary" style={{ marginBottom: '32px' }}>
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }} className="text-gradient">
          Edit Product details
        </h2>

        {loading ? (
          <div className="flex-center" style={{ minHeight: '150px' }}>
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <form onSubmit={submitHandler}>
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                type="text"
                id="name"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                id="price"
                className="form-control"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {/* Image File Input and Text Input */}
            <div className="form-group">
              <label htmlFor="image">Image Source Path</label>
              <input
                type="text"
                id="image"
                className="form-control"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
                style={{ marginBottom: '8px' }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                }}
              >
                <Upload size={18} style={{ color: 'var(--text-secondary)' }} />
                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    id="image-file"
                    accept="image/*"
                    onChange={uploadFileHandler}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="image-file"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      border: '1px solid var(--border-color)',
                      fontWeight: 600,
                      display: 'inline-block',
                      margin: 0,
                    }}
                  >
                    Choose File
                  </label>
                  <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {uploading ? 'Uploading...' : 'Upload new image'}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                id="brand"
                className="form-control"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px',
                  width: '100%',
                }}
              >
                <option value="" style={{ background: '#121214', color: '#fff' }}>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name} style={{ background: '#121214', color: '#fff' }}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="countInStock">Inventory Count in Stock</label>
              <input
                type="number"
                id="countInStock"
                className="form-control"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="form-control"
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={loadingUpdate || uploading}
            >
              <Save size={16} />
              <span>{loadingUpdate ? 'Saving Details...' : 'Save Changes'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminProductEditScreen;
