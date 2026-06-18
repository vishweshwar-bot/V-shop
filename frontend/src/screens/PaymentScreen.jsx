import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import CheckoutSteps from '../components/CheckoutSteps';
import { CreditCard } from 'lucide-react';

const PaymentScreen = () => {
  const { shippingAddress, savePaymentMethod } = useContext(CartContext);
  const navigate = useNavigate();

  const [paymentMethodMethod, setPaymentMethodMethod] = useState('Stripe');

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    savePaymentMethod(paymentMethodMethod);
    navigate('/placeorder');
  };

  return (
    <div className="container">
      <CheckoutSteps step1 step2 step3 />

      <div className="glass-panel form-container" style={{ marginTop: '20px' }}>
        <h2 className="form-title text-gradient" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <CreditCard size={24} /> Payment Method
        </h2>

        <form onSubmit={submitHandler}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Select Payment Gateway
            </label>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Stripe"
                  checked={paymentMethodMethod === 'Stripe'}
                  onChange={(e) => setPaymentMethodMethod(e.target.value)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                />
                <span>Stripe (Credit Card / Apple Pay)</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Continue to Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentScreen;
