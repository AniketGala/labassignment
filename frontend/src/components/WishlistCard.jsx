import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeFromWishlist } from '../services/api';

const WishlistCard = ({ product, onRemove }) => {
  const navigate = useNavigate();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    
    if (isRemoving) return;

    setIsRemoving(true);
    try {
      await removeFromWishlist(product._id);
      if (onRemove) {
        onRemove(product._id);
      }
    } catch (error) {
      alert('Failed to remove product from wishlist. Please try again.');
      setIsRemoving(false);
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
        
        <div className="text-2xl font-bold text-gray-900 mb-4">
          ₹{product.price.toLocaleString()}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            View Details
          </button>
          
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isRemoving ? 'Removing...' : 'Remove ♥'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
