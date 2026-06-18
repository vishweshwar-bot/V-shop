import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiRequest from '../utils/api';
import { ExternalLink, Calendar, ShieldAlert } from 'lucide-react';

const AdminOrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await apiRequest('/orders');
        setOrders(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }} className="text-gradient">
        System Orders
      </h1>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 8px' }}>Order ID</th>
                <th style={{ padding: '12px 8px' }}>Customer</th>
                <th style={{ padding: '12px 8px' }}>Date</th>
                <th style={{ padding: '12px 8px' }}>Total</th>
                <th style={{ padding: '12px 8px' }}>Paid</th>
                <th style={{ padding: '12px 8px' }}>Delivered</th>
                <th style={{ padding: '12px 8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    {order._id}
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                    {order.user ? order.user.name : 'Unknown User'}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> {order.createdAt.substring(0, 10)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: 700 }}>₹{order.totalPrice.toFixed(2)}</td>
                  <td style={{ padding: '12px 8px' }}>
                    {order.isPaid ? (
                      <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>
                        Yes ({order.paidAt.substring(0, 10)})
                      </span>
                    ) : (
                      <span style={{ color: 'var(--danger-color)', fontWeight: 600 }}>No</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    {order.isDelivered ? (
                      <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>
                        Yes ({order.deliveredAt.substring(0, 10)})
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <Link
                      to={`/order/${order._id}`}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                    >
                      <ExternalLink size={12} />
                      <span>Details</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrderListScreen;
