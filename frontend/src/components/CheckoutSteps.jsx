import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  const steps = [
    { name: 'Sign In', link: '/login', active: step1 },
    { name: 'Shipping', link: '/shipping', active: step2 },
    { name: 'Payment', link: '/payment', active: step3 },
    { name: 'Place Order', link: '/placeorder', active: step4 },
  ];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        marginBottom: '40px',
      }}
    >
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: step.active ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <div
              className="flex-center"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: step.active ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)',
                color: step.active ? 'white' : 'var(--text-muted)',
                fontSize: '12px',
                boxShadow: step.active ? '0 0 10px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              {idx + 1}
            </div>
            {step.active ? (
              <Link to={step.link} style={{ color: 'var(--text-primary)' }}>
                {step.name}
              </Link>
            ) : (
              <span>{step.name}</span>
            )}
          </div>
          {idx < steps.length - 1 && (
            <div
              style={{
                width: '40px',
                height: '2px',
                background: step.active ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CheckoutSteps;
