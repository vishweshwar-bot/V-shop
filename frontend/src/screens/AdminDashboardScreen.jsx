import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiRequest from '../utils/api';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  Layers,
  ArrowRight,
  User,
  Calendar,
} from 'lucide-react';

const AdminDashboardScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiRequest('/orders/analytics');
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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

  // Calculate highest daily sales for trend chart scaling
  const maxDayAmount = stats?.salesByDate?.length
    ? Math.max(...stats.salesByDate.map((d) => d.amount))
    : 1;

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '28px' }} className="text-gradient">
        Admin Dashboard
      </h1>

      {stats && (
        <>
          {/* 1. Analytics Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              marginBottom: '40px',
            }}
          >
            {/* Sales */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Total Revenue</span>
                <TrendingUp style={{ color: 'var(--success-color)' }} size={20} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>₹{stats.totalSales.toLocaleString('en-IN')}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Accumulated paid totals</p>
            </div>

            {/* Orders */}
            <Link to="/admin/orderlist" className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Total Orders</span>
                <CreditCard style={{ color: 'var(--primary-color)' }} size={20} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{stats.numOrders}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to manage customer orders</p>
            </Link>

            {/* Products */}
            <Link to="/admin/productlist" className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Catalog Items</span>
                <ShoppingBag style={{ color: 'var(--secondary-color)' }} size={20} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{stats.numProducts}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage products and inventory</p>
            </Link>

            {/* Users */}
            <Link to="/admin/userlist" className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Registered Users</span>
                <Users style={{ color: 'var(--primary-color)' }} size={20} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{stats.numUsers}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to manage user profiles</p>
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr minmax(320px, 400px)',
              gap: '32px',
              marginBottom: '40px',
              alignItems: 'start',
            }}
          >
            {/* Left Side: Sales Daily Trend & Reports */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Sales Daily Trend */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Sales Revenue Trend</h2>
                {stats.salesByDate.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>No daily sales records to show yet.</div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      height: '180px',
                      paddingTop: '20px',
                      borderBottom: '1px solid var(--border-color)',
                      gap: '8px',
                    }}
                  >
                    {stats.salesByDate.map((day, idx) => {
                      // Calculate height percentage
                      const heightPercent = Math.max(10, Math.round((day.amount / maxDayAmount) * 100));
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            gap: '8px',
                          }}
                        >
                          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            ₹{day.amount}
                          </span>
                          <div
                            style={{
                              width: '100%',
                              maxHeight: '130px',
                              height: `${heightPercent}px`,
                              background: 'var(--accent-gradient)',
                              borderRadius: '4px 4px 0 0',
                              boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)',
                            }}
                          />
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {day.date.substring(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sales Report (Paid Orders list) */}
              <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Recent Sales Report</h2>
                {stats.recentSales.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>No sales records processed.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '8px' }}>Date</th>
                        <th style={{ padding: '8px' }}>Customer</th>
                        <th style={{ padding: '8px' }}>Payment Reference</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentSales.map((sale) => (
                        <tr key={sale._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '8px' }}>{sale.paidAt ? sale.paidAt.substring(0, 10) : sale.updatedAt.substring(0, 10)}</td>
                          <td style={{ padding: '8px', fontWeight: 600 }}>{sale.user ? sale.user.name : 'Guest'}</td>
                          <td style={{ padding: '8px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                            {sale.paymentResult ? sale.paymentResult.id.substring(0, 15) : 'ch_stripe_ref'}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>₹{sale.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right Side: Category Metrics & Shortcut links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Category Management Metrics */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} /> Category Catalog Counts
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {stats.productsByCategory.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex-center"
                      style={{
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{cat.category}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: 'var(--primary-color)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                        }}
                      >
                        {cat.count} product(s)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Administrative Quick Actions */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Administrative Actions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link
                    to="/admin/productlist"
                    className="btn btn-secondary"
                    style={{ justifyContent: 'space-between', padding: '12px 16px', width: '100%' }}
                  >
                    <span>Manage Products Catalog</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/admin/orderlist"
                    className="btn btn-secondary"
                    style={{ justifyContent: 'space-between', padding: '12px 16px', width: '100%' }}
                  >
                    <span>Review System Orders</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/admin/userlist"
                    className="btn btn-secondary"
                    style={{ justifyContent: 'space-between', padding: '12px 16px', width: '100%' }}
                  >
                    <span>Manage User Accounts</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/admin/categorylist"
                    className="btn btn-secondary"
                    style={{ justifyContent: 'space-between', padding: '12px 16px', width: '100%' }}
                  >
                    <span>Manage Product Categories</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardScreen;
