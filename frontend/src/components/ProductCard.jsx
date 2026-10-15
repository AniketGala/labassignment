import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [wishlistStatus, setWishlistStatus] = useState('idle'); // idle, loading, added
  const [cartStatus, setCartStatus] = useState('idle'); // idle, loading, added
  const { addToCart } = useCart();

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  const handleAddToWishlist = async (e) => {
    e.stopPropagation();
    
    if (wishlistStatus === 'loading' || wishlistStatus === 'added') {
      return;
    }

    setWishlistStatus('loading');

    try {
      await addToWishlist(product._id);
      setWishlistStatus('added');
      // Reset to idle after 3 seconds
      setTimeout(() => setWishlistStatus('idle'), 3000);
    } catch (error) {
      setWishlistStatus('idle');
      alert(error.response?.data?.message || 'Unable to save product. Please try again.');
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (cartStatus === 'loading' || cartStatus === 'added') {
      return;
    }

    setCartStatus('loading');

    const result = await addToCart(product._id);
    
    if (result.success) {
      setCartStatus('added');
      // Reset to idle after 2 seconds
      setTimeout(() => setCartStatus('idle'), 2000);
    } else {
      setCartStatus('idle');
      alert(result.error || 'Unable to add to cart. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 bg-gray-200">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-black bg-gray-200 px-2 py-1 rounded">
            {product.category}
          </span>
          <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
          {product.name}
        </h3>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">
              ₹{product.price.toLocaleString()}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleViewDetails}
              disabled={product.stock === 0}
              className="flex-1 bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              View Details
            </button>
            
            <button
              onClick={handleAddToWishlist}
              disabled={product.stock === 0 || wishlistStatus === 'loading' || wishlistStatus === 'added'}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium ${
                wishlistStatus === 'added' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              {wishlistStatus === 'loading' ? '⏳ Saving...' : 
               wishlistStatus === 'added' ? '♥ Added' : 
               '♡ Wishlist'}
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || cartStatus === 'loading' || cartStatus === 'added'}
              className={`flex-1 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium ${
                cartStatus === 'added' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {cartStatus === 'loading' ? 'Adding...' : 
               cartStatus === 'added' ? '✓ Added' : 
               '🛒 Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
