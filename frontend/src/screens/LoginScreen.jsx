import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import apiRequest from '../utils/api';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, login } = useContext(AuthContext);

  // Redirect path calculation
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, navigate, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingSubmit(true);

    try {
      const data = await apiRequest('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="container">
      <div className="glass-panel form-container">
        <h2 className="form-title text-gradient">Login</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={submitHandler}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loadingSubmit}
          >
            {loadingSubmit ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          New Customer?{' '}
          <Link
            to={redirect ? `/register?redirect=${redirect}` : '/register'}
            style={{ color: 'var(--primary-color)', fontWeight: 600 }}
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
