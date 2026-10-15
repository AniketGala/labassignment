import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, loading, error, subtotal, cartCount, updateQuantity, removeFromCart, fetchCart } = useCart();
  const [updatingItems, setUpdatingItems] = useState({});

  const handleQuantityChange = async (productId, newQuantity) => {
    if (updatingItems[productId]) return;

    setUpdatingItems(prev => ({ ...prev, [productId]: true }));

    const result = await updateQuantity(productId, newQuantity);
    
    if (!result.success) {
      alert(result.error);
    }

    setUpdatingItems(prev => ({ ...prev, [productId]: false }));
  };

  const handleRemove = async (productId) => {
    if (updatingItems[productId]) return;

    setUpdatingItems(prev => ({ ...prev, [productId]: true }));

    const result = await removeFromCart(productId);
    
    if (!result.success) {
      alert(result.error);
    }

    setUpdatingItems(prev => ({ ...prev, [productId]: false }));
  };

  const handleRetry = () => {
    fetchCart();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="ml-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Cart</h1>
            <p className="text-gray-600">
              {cartCount === 0 
                ? 'Your cart is empty' 
                : `${cartCount} item${cartCount === 1 ? '' : 's'} in your cart`}
            </p>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-xl p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">
                Looks like you haven't added anything yet.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {cartItems.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  return (
                    <div key={item.product._id} className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex gap-6">
                        <div className="w-32 h-32 bg-gray-200 flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/128x128?text=No+Image';
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                {product.name}
                              </h3>
                              <span className="text-xs font-medium text-black bg-gray-200 px-2 py-1 rounded">
                                {product.category}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">
                                ₹{product.price.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                ₹{(product.price * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updatingItems[item.product._id]}
                                className="w-8 h-8 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="w-12 text-center font-medium">
                                {updatingItems[item.product._id] ? '...' : item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                disabled={item.quantity >= product.stock || updatingItems[item.product._id]}
                                className="w-8 h-8 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              >
                                +
                              </button>
                              <span className="text-xs text-gray-500 ml-2">
                                {product.stock} available
                              </span>
                            </div>

                            <button
                              onClick={() => handleRemove(item.product._id)}
                              disabled={updatingItems[item.product._id]}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              {updatingItems[item.product._id] ? 'Removing...' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({cartCount})</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full mt-6 bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
