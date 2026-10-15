import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getOrderById } from '../services/api';
import Navbar from '../components/Navbar';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case 'PLACED':
      return 'bg-blue-100 text-blue-800';
    case 'CONFIRMED':
      return 'bg-purple-100 text-purple-800';
    case 'SHIPPED':
      return 'bg-yellow-100 text-yellow-800';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800';
    case 'PENDING_PAYMENT':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrderById(id);
      setOrder(response.order);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.status === 403 || error.response?.status === 404) {
        setError('Order not found or access denied.');
      } else {
        setError('Unable to load order details. Please try again.');
      }
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="ml-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 mb-4">{error || 'Order not found'}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={fetchOrder}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  My Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalQuantity = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {isSuccess && order.status === 'PLACED' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-6 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Order Placed Successfully</h2>
              <p className="text-green-700 mb-6">
                Your order has been saved successfully. Thank you for shopping with ShopKart!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/orders')}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  View My Orders
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium bg-white"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/orders')}
              className="text-black hover:text-gray-700 font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Orders
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">Order #{order._id}</h1>
                  <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    Payment: {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Order Items ({totalQuantity})</h3>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      {item.image && (
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">{item.name}</h4>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">
                            ₹{item.price.toLocaleString()} each
                          </span>
                          <span className="font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal ({totalQuantity} items)</span>
                      <span>₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Shipping Address</h3>
                  {order.shippingAddress && (
                    <div className="space-y-1 text-sm text-gray-700">
                      <p className="font-semibold text-gray-800">{order.shippingAddress.fullName}</p>
                      <p>Phone: {order.shippingAddress.phone}</p>
                      <p>{order.shippingAddress.addressLine1}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                      <p>Pincode: {order.shippingAddress.pincode}</p>
                    </div>
                  )}
                </div>

                {order.razorpayOrderId && (
                  <div className="bg-gray-50 rounded-lg p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Payment Details</h3>
                    <div className="space-y-2 text-xs text-gray-600 break-all">
                      <p><span className="font-medium">Razorpay Order ID:</span><br />{order.razorpayOrderId}</p>
                      {order.razorpayPaymentId && (
                        <p><span className="font-medium">Razorpay Payment ID:</span><br />{order.razorpayPaymentId}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
