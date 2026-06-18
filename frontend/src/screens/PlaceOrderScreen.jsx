import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CartContext from '../context/CartContext';
import CheckoutSteps from '../components/CheckoutSteps';
import apiRequest from '../utils/api';
import { MapPin, CreditCard, ShoppingCart, Info } from 'lucide-react';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const { cartItems, shippingAddress, paymentMethod, prices, clearCart } = useContext(CartContext);
  const [error, setError] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    } else if (!paymentMethod) {
      navigate('/payment');
    }
  }, [shippingAddress, paymentMethod, navigate]);

  const placeOrderHandler = async () => {
    setError('');
    setLoadingSubmit(true);

    try {
      const createdOrder = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          orderItems: cartItems.map((item) => ({
            product: item.product,
            qty: item.qty,
            name: item.name,
            price: item.price,
            image: item.image,
          })),
          shippingAddress,
          paymentMethod,
        }),
      });

      // Clear the local state cart
      clearCart();

      // Route to order details page
      navigate(`/order/${createdOrder._id}`);
    } catch (err) {
      setError(err.message || 'Order submission failed');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="container">
      <CheckoutSteps step1 step2 step3 step4 />

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '28px' }} className="text-gradient">
        Review Order
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr minmax(300px, 360px)',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Left Columns - Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Shipping */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} /> Shipping Details
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}
            </p>
          </div>

          {/* Payment */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} /> Payment Gateway
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Method: <strong>{paymentMethod}</strong>
            </p>
          </div>

          {/* Items */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={18} /> Order Items
            </h2>

            {cartItems.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)' }}>Your cart is empty.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      paddingBottom: idx < cartItems.length - 1 ? '16px' : '0',
                      borderBottom: idx < cartItems.length - 1 ? '1px solid var(--border-color)' : 'none',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <Link to={`/product/${item.product}`} style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
                        {item.name}
                      </Link>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {item.qty} x ₹{item.price.toFixed(2)} = <strong>₹{(item.qty * item.price).toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Order Totals
            </h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Items:</span>
              <strong>₹{prices.itemsPrice.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shipping:</span>
              <strong>
                {prices.shippingPrice === 0 ? (
                  <span style={{ color: 'var(--success-color)' }}>Free</span>
                ) : (
                  `₹${prices.shippingPrice.toFixed(2)}`
                )}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Sales Tax (15%):</span>
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
              onClick={placeOrderHandler}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              disabled={cartItems.length === 0 || loadingSubmit}
            >
              {loadingSubmit ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderScreen;
