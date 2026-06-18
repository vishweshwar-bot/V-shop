import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';

const CartScreen = () => {
  const { cartItems, addToCart, removeFromCart, prices } = useContext(CartContext);
  const navigate = useNavigate();

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }} className="text-gradient">
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div
          className="glass-panel flex-center"
          style={{
            flexDirection: 'column',
            padding: '50px',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <ShoppingBag size={48} style={{ opacity: 0.3 }} />
          <p style={{ color: 'var(--text-secondary)' }}>Your shopping cart is currently empty.</p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>Go Shopping</span>
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr minmax(300px, 360px)',
            gap: '32px',
            alignItems: 'start',
          }}
        >
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cartItems.map((item) => (
              <div
                key={item.product}
                className="glass-panel"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Product Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
                  }}
                />

                {/* Name Link */}
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <Link to={`/product/${item.product}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.name}
                  </Link>
                </div>

                {/* Price */}
                <div style={{ fontWeight: 700, fontSize: '16px', minWidth: '80px' }}>
                  ₹{item.price.toFixed(2)}
                </div>

                {/* Quantity Select */}
                <div>
                  <select
                    className="form-control"
                    style={{ padding: '6px 12px', width: '75px' }}
                    value={item.qty}
                    onChange={(e) => addToCart(item, Number(e.target.value))}
                  >
                    {[...Array(Math.min(item.countInStock, 10)).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>
                        {x + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remove Icon */}
                <button
                  onClick={() => removeFromCart(item.product)}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px',
                    color: 'var(--danger-color)',
                    borderColor: 'rgba(239, 68, 68, 0.1)',
                    background: 'rgba(239, 68, 68, 0.05)',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Subtotal Order Summary Card */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Items Count:</span>
              <strong>{totalItems} item(s)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal Price:</span>
              <strong>₹{prices.itemsPrice.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shipping:</span>
              <strong>
                {prices.shippingPrice === 0 ? (
                  <span style={{ color: 'var(--success-color)' }}>Free</span>
                ) : (
                  `₹${prices.shippingPrice.toFixed(2)}`
                )}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Est. Sales Tax (15%):</span>
              <strong>₹{prices.taxPrice.toFixed(2)}</strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '16px',
              }}
            >
              <span>Total Price:</span>
              <strong className="text-gradient">₹{prices.totalPrice.toFixed(2)}</strong>
            </div>

            <button
              onClick={checkoutHandler}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              disabled={cartItems.length === 0}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
