import { useNavigate } from 'react-router-dom';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1
              className="text-2xl font-bold text-black cursor-pointer"
              onClick={() => navigate('/home')}
            >
              ShopKart
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/home')}
              className="text-gray-700 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/products')}
              className="text-gray-700 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Products
            </button>
            <button
              onClick={() => navigate('/wishlist')}
              className="text-gray-700 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Wishlist
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="text-gray-700 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Cart {cartCount > 0 && `(${cartCount})`}
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="text-gray-700 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Orders
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
