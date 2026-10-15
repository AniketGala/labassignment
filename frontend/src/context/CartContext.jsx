import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart, updateCartQuantity, removeFromCart } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCart();
      setCartItems(response.cart || []);
    } catch (error) {
      setError('Failed to load cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCartHandler = async (productId) => {
    try {
      const response = await addToCart(productId);
      setCartItems(response.cart || []);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add to cart';
      return { success: false, error: errorMessage };
    }
  };

  const updateQuantityHandler = async (productId, quantity) => {
    try {
      const response = await updateCartQuantity(productId, quantity);
      setCartItems(response.cart || []);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update quantity';
      return { success: false, error: errorMessage };
    }
  };

  const removeFromCartHandler = async (productId) => {
    try {
      const response = await removeFromCart(productId);
      setCartItems(response.cart || []);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove from cart';
      return { success: false, error: errorMessage };
    }
  };

  const clearCartHandler = () => {
    setCartItems([]);
  };

  // Derived values
  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.product?.price || 0;
    const quantity = item.quantity || 0;
    return total + (price * quantity);
  }, 0);

  const value = {
    cartItems,
    loading,
    error,
    cartCount,
    subtotal,
    fetchCart,
    addToCart: addToCartHandler,
    updateQuantity: updateQuantityHandler,
    removeFromCart: removeFromCartHandler,
    clearCart: clearCartHandler
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
