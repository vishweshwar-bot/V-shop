import React, { createContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Stripe');

  // Pricing States
  const [prices, setPrices] = useState({
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
  });

  // Load cart state on initialization
  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    const storedShipping = localStorage.getItem('shippingAddress');
    const storedPayment = localStorage.getItem('paymentMethod');

    if (storedCart) {
      try { setCartItems(JSON.parse(storedCart)); } catch (e) {}
    }
    if (storedShipping) {
      try { setShippingAddress(JSON.parse(storedShipping)); } catch (e) {}
    }
    if (storedPayment) {
      setPaymentMethod(storedPayment);
    }
  }, []);

  // Update prices whenever cartItems changes
  useEffect(() => {
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 5000 || itemsPrice === 0 ? 0 : 150;
    const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    setPrices({
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * Adds an item to the cart, or updates its quantity if already present.
   */
  const addToCart = (product, qty) => {
    setCartItems((prevItems) => {
      const existItem = prevItems.find((x) => x.product === product.product);

      if (existItem) {
        return prevItems.map((x) =>
          x.product === existItem.product ? { ...x, qty } : x
        );
      } else {
        return [...prevItems, { ...product, qty }];
      }
    });
  };

  /**
   * Removes an item from the cart by its product ID.
   */
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((x) => x.product !== id));
  };

  /**
   * Saves shipping address details to state and local storage.
   */
  const saveShippingAddress = (addressData) => {
    setShippingAddress(addressData);
    localStorage.setItem('shippingAddress', JSON.stringify(addressData));
  };

  /**
   * Saves payment gateway method choice.
   */
  const savePaymentMethod = (method) => {
    setPaymentMethod(method);
    localStorage.setItem('paymentMethod', method);
  };

  /**
   * Clears the cart and clears local storage cache.
   */
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        shippingAddress,
        paymentMethod,
        prices,
        addToCart,
        removeFromCart,
        saveShippingAddress,
        savePaymentMethod,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
