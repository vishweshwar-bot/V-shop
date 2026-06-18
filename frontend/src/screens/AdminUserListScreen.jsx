import React, { useState, useEffect, useContext } from 'react';
import apiRequest from '../utils/api';
import { ShieldCheck, Check, X, Calendar, Trash2, ShieldAlert } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const AdminUserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { userInfo } = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      const data = await apiRequest('/users');
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteHandler = async (id) => {
    if (id === userInfo?._id) {
      alert('You cannot delete your own admin account');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiRequest(`/users/${id}`, {
          method: 'DELETE',
        });
        fetchUsers();
      } catch (err) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  const toggleAdminHandler = async (user) => {
    if (user._id === userInfo?._id) {
      alert('You cannot revoke your own admin rights');
      return;
    }
    if (window.confirm(`Are you sure you want to ${user.isAdmin ? 'revoke' : 'grant'} administrator privileges for this user?`)) {
      try {
        await apiRequest(`/users/${user._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            isAdmin: !user.isAdmin,
          }),
        });
        fetchUsers();
      } catch (err) {
        alert(err.message || 'Failed to update user status');
      }
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }} className="text-gradient">
        System Users
      </h1>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" />
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px' }}>User ID</th>
                <th style={{ padding: '12px 8px' }}>Name</th>
                <th style={{ padding: '12px 8px' }}>Email</th>
                <th style={{ padding: '12px 8px' }}>Administrator</th>
                <th style={{ padding: '12px 8px' }}>Registered At</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    {user._id}
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{user.name}</td>
                  <td style={{ padding: '12px 8px' }}>{user.email}</td>
                  <td style={{ padding: '12px 8px' }}>
                    {user.isAdmin ? (
                      <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={16} /> Yes
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <X size={16} /> No
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> {user.createdAt?.substring(0, 10) || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => toggleAdminHandler(user)}
                        className="btn btn-secondary"
                        style={{
                          padding: '6px 10px',
                          fontSize: '12px',
                          borderColor: user.isAdmin ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                          background: user.isAdmin ? 'rgba(239, 68, 68, 0.02)' : 'rgba(99, 102, 241, 0.02)',
                        }}
                      >
                        {user.isAdmin ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                        <span>{user.isAdmin ? 'Demote' : 'Promote'}</span>
                      </button>
                      {user._id !== userInfo?._id && (
                        <button
                          onClick={() => deleteHandler(user._id)}
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
                      )}
                    </div>
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

export default AdminUserListScreen;
