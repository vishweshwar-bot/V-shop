import React from 'react';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <div className="glass-panel product-card">
      <Link to={`/product/${product._id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="product-card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
          }}
        />
      </Link>

      <div className="product-card-category">{product.category}</div>
      <Link to={`/product/${product._id}`}>
        <h3 className="product-card-title">{product.name}</h3>
      </Link>

      <Rating value={product.rating} text={`${product.numReviews} reviews`} />

      <div className="product-card-footer">
        <span className="product-card-price">₹{product.price.toFixed(2)}</span>
        <Link to={`/product/${product._id}`} className="btn btn-primary" style={{ padding: '8px 12px' }}>
          <Eye size={16} />
          <span>View</span>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
