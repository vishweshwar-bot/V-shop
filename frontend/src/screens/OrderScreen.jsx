import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiRequest from '../utils/api';
import AuthContext from '../context/AuthContext';
import { ShieldCheck, MapPin, CreditCard, ShoppingBag, DollarSign, Truck } from 'lucide-react';

const OrderScreen = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment/Delivery trigger states
  const [loadingPay, setLoadingPay] = useState(false);
  const [loadingDeliver, setLoadingDeliver] = useState(false);

  const { userInfo } = useContext(AuthContext);

  const fetchOrder = async () => {
    try {
      const data = await apiRequest(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  /**
   * Handles payment simulation using the Stripe checkout helper endpoint.
   */
  const handlePayment = async () => {
    setLoadingPay(true);
    try {
      // 1. Create payment intent and retrieve the client secret
      const { clientSecret } = await apiRequest(`/orders/${id}/stripe-payment-intent`, {
        method: 'POST',
      });
      console.log('Stripe client secret generated:', clientSecret);

      // 2. Complete payment by updating order to paid on backend
      const updated = await apiRequest(`/orders/${id}/pay`, {
        method: 'PUT',
        body: JSON.stringify({
          id: `ch_stripe_${Math.random().toString(36).substring(7)}`,
          status: 'succeeded',
          update_time: new Date().toISOString(),
          email_address: userInfo.email,
        }),
      });

      setOrder(updated);
    } catch (err) {
      alert(err.message || 'Payment failed');
    } finally {
      setLoadingPay(false);
    }
  };

  /**
   * Handles manual payment status override (Admin only).
   */
  const handleMarkAsPaidAdmin = async () => {
    setLoadingPay(true);
    try {
      const updated = await apiRequest(`/orders/${id}/pay`, {
        method: 'PUT',
        body: JSON.stringify({
          id: `manual_admin_${Math.random().toString(36).substring(7)}`,
          status: 'succeeded',
          update_time: new Date().toISOString(),
          email_address: order.user?.email,
        }),
      });
      setOrder(updated);
    } catch (err) {
      alert(err.message || 'Manual payment status update failed');
    } finally {
      setLoadingPay(false);
    }
  };

  /**
   * Handles updating delivery status (Admin only).
   */
  const handleDeliver = async () => {
    if (!order.isPaid) {
      if (!window.confirm('This order is currently Unpaid. Are you sure you want to mark it as Delivered?')) {
        return;
      }
    }
    setLoadingDeliver(true);
    try {
      const updated = await apiRequest(`/orders/${id}/deliver`, {
        method: 'PUT',
      });
      setOrder(updated);
    } catch (err) {
      alert(err.message || 'Delivery update failed');
    } finally {
      setLoadingDeliver(false);
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
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1
        style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', fontFamily: 'monospace' }}
        className="text-gradient"
      >
        Order ID: {order?._id}
      </h1>

      {order && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr minmax(300px, 360px)',
            gap: '32px',
            alignItems: 'start',
          }}
        >
          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Shipping Info */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} /> Shipping Address
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                <strong>Recipient Name:</strong> {order.user.name} ({order.user.email}) <br />
                <strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>

              {order.isDelivered ? (
                <div className="alert alert-success" style={{ margin: 0, padding: '10px 14px' }}>
                  <Truck size={16} /> Delivered on {order.deliveredAt.substring(0, 10)}
                </div>
              ) : (
                <div className="alert alert-danger" style={{ margin: 0, padding: '10px 14px' }}>
                  <Truck size={16} /> Not Delivered
                </div>
              )}
            </div>

            {/* Payment gateway */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} /> Payment Status
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                <strong>Method:</strong> {order.paymentMethod}
              </p>

              {order.isPaid ? (
                <div className="alert alert-success" style={{ margin: 0, padding: '10px 14px' }}>
                  <ShieldCheck size={16} /> Paid on {order.paidAt.substring(0, 19).replace('T', ' ')}
                </div>
              ) : (
                <div className="alert alert-danger" style={{ margin: 0, padding: '10px 14px' }}>
                  <ShieldCheck size={16} /> Not Paid
                </div>
              )}
            </div>

            {/* Purchased Items */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={18} /> Order Items
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {order.orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      paddingBottom: idx < order.orderItems.length - 1 ? '16px' : '0',
                      borderBottom: idx < order.orderItems.length - 1 ? '1px solid var(--border-color)' : 'none',
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
            </div>
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Items Total:</span>
                <strong>₹{order.itemsPrice.toFixed(2)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shipping:</span>
                <strong>₹{order.shippingPrice.toFixed(2)}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sales Tax:</span>
                <strong>₹{order.taxPrice.toFixed(2)}</strong>
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
                <span>Total:</span>
                <strong className="text-gradient">₹{order.totalPrice.toFixed(2)}</strong>
              </div>

              {/* Payment Action for User */}
              {!order.isPaid && order.user?._id === userInfo?._id && (
                <button
                  onClick={handlePayment}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                  disabled={loadingPay}
                >
                  <DollarSign size={18} />
                  <span>{loadingPay ? 'Processing Payment...' : 'Pay with Stripe'}</span>
                </button>
              )}

              {/* Manual Payment Action for Admin */}
              {userInfo?.isAdmin && !order.isPaid && (
                <button
                  onClick={handleMarkAsPaidAdmin}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', background: 'var(--secondary-color)', marginBottom: '8px' }}
                  disabled={loadingPay}
                >
                  <DollarSign size={18} />
                  <span>{loadingPay ? 'Processing...' : 'Mark as Paid (Admin)'}</span>
                </button>
              )}

              {/* Delivery Action for Admin */}
              {userInfo?.isAdmin && !order.isDelivered && (
                <button
                  onClick={handleDeliver}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', background: 'var(--success-color)' }}
                  disabled={loadingDeliver}
                >
                  <Truck size={18} />
                  <span>{loadingDeliver ? 'Updating status...' : 'Mark as Delivered'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderScreen;
