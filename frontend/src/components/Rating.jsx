import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const Rating = ({ value, text }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      stars.push(<Star key={i} size={16} fill="currentColor" />);
    } else if (value >= i - 0.5) {
      stars.push(<StarHalf key={i} size={16} fill="currentColor" />);
    } else {
      stars.push(<Star key={i} size={16} style={{ opacity: 0.2 }} />);
    }
  }

  return (
    <div className="product-card-rating">
      <div className="rating-stars">{stars}</div>
      {text && <span style={{ marginLeft: '4px' }}>{text}</span>}
    </div>
  );
};

export default Rating;
