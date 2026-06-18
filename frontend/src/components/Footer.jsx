import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="container">
        <p>&copy; {currentYear} V-Shop E-Commerce. All rights reserved. Built with the MERN Stack.</p>
      </div>
    </footer>
  );
};

export default Footer;
