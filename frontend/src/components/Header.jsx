import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, ShieldCheck, ShoppingBag } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';

const Header = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?keyword=${keyword}`);
    } else {
      navigate('/');
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <header>
      <div className="container nav-container">
        {/* Logo */}
        <Link to="/" className="logo text-gradient">
          <ShoppingBag size={28} style={{ stroke: 'url(#accent-grad)' }} />
          <span>V-Shop</span>
        </Link>

        {/* SVG Gradient definition for Lucide Icons */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </svg>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-bar">
          <input
            type="text"
            placeholder="Search products, brands, categories..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Search size={18} />
        </form>

        {/* Navigation Actions */}
        <div className="nav-links">
          <Link to="/cart" className="nav-item">
            <ShoppingCart size={20} />
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {userInfo ? (
            <div className="user-dropdown">
              <span className="nav-item" style={{ cursor: 'pointer' }}>
                <User size={20} />
                <span>{userInfo.name}</span>
              </span>
              <div className="user-dropdown-menu">
                <Link to="/profile" className="user-dropdown-item">
                  <User size={16} /> Profile
                </Link>

                {/* Admin-only options */}
                {userInfo.isAdmin && (
                  <>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                    <Link to="/admin/dashboard" className="user-dropdown-item">
                      <ShieldCheck size={16} /> Admin Dashboard
                    </Link>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                  </>
                )}

                <button
                  onClick={logout}
                  className="user-dropdown-item"
                  style={{
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="nav-item">
              <User size={20} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
