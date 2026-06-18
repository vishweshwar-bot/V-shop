import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import apiRequest from '../utils/api';
import { Calendar, CreditCard, Shield, ExternalLink } from 'lucide-react';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorProfile, setErrorProfile] = useState('');
  const [successProfile, setSuccessProfile] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const navigate = useNavigate();
  const { userInfo, login } = useContext(AuthContext);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    setName(userInfo.name);
    setEmail(userInfo.email);

    // Fetch user's orders
    const fetchOrders = async () => {
      try {
        const data = await apiRequest('/orders/mine');
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorProfile('');
    setSuccessProfile(false);

    if (password !== confirmPassword) {
      setErrorProfile('Passwords do not match');
      return;
    }

    setLoadingSubmit(true);

    try {
      const data = await apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, email, password }),
      });
      login(data);
      setSuccessProfile(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorProfile(err.message || 'Update failed');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="container">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 350px) 1fr',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Left Side: Update Form */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '20px', fontWeight: 700 }} className="text-gradient">
            User Profile
          </h2>

          {errorProfile && <div className="alert alert-danger">{errorProfile}</div>}
          {successProfile && <div className="alert alert-success">Profile updated successfully!</div>}

          <form onSubmit={submitHandler}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
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
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Change Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Leave blank to keep same"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-control"
                placeholder="Leave blank to keep same"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={loadingSubmit}
            >
              {loadingSubmit ? 'Saving...' : 'Update Settings'}
            </button>
          </form>
        </div>

        {/* Right Side: Orders Grid */}
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '20px', fontWeight: 700 }} className="text-gradient">
            My Orders
          </h2>

          {loadingOrders ? (
            <div className="flex-center" style={{ minHeight: '150px' }}>
              <div className="spinner" />
            </div>
          ) : orders.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>You haven't placed any orders yet.</div>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 8px' }}>ID</th>
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
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                      {order._id.substring(0, 10)}...
                    </td>
                    <td style={{ padding: '12px 8px' }}>{order.createdAt.substring(0, 10)}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>₹{order.totalPrice.toFixed(2)}</td>
                    <td style={{ padding: '12px 8px' }}>
                      {order.isPaid ? (
                        <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>
                          Paid ({order.paidAt.substring(0, 10)})
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
