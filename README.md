# ShopKart E-Commerce Application

A full-stack e-commerce application built with MERN stack, implementing all 6 engineering labs including authentication, product catalog, wishlist, shopping cart, checkout with Razorpay payment, and order management.

## 📋 Features

- **Authentication**: User registration, login, JWT-based authentication with HttpOnly cookies
- **Product Catalog**: Dynamic product listing with search and category filtering
- **Wishlist System**: Save products for later with MongoDB relationships
- **Shopping Cart**: Add/remove products, quantity controls, real-time updates
- **Checkout**: Shipping address form, Razorpay Test Mode payment integration
- **Order Management**: Order creation, payment verification, order history
- **State Management**: React Context API for global cart state
- **Database**: MongoDB with proper schema design and relationships

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- Cookie-parser
- bcrypt
- Razorpay (payment gateway)
- CORS

### Frontend
- React 19
- React Router DOM
- Axios
- Tailwind CSS
- Vite

## 📦 Prerequisites

Before running this project, ensure you have installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB Community Server** - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/AniketGala/labassignment.git
cd labassignment
```

### 2. Install Dependencies

Install backend dependencies:
```bash
npm install
```

Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

### 3. Setup MongoDB

#### Option A: Local MongoDB
1. Install MongoDB Community Server from [MongoDB Downloads](https://www.mongodb.com/try/download/community)
2. MongoDB will start automatically as a Windows service after installation
3. Verify MongoDB is running:
   ```bash
   mongod --version
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (select "Free" tier)
3. Click "Connect" → "Connect your application"
4. Choose Node.js version
5. Copy the connection string
6. Replace `<password>` with your database password
7. Use this connection string in step 4

### 4. Environment Variables Setup

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Add the following environment variables to `backend/.env`:

```env
# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://127.0.0.1:27017/shopkart

# For MongoDB Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shopkart

# JWT Secret (change this to a secure random string)
JWT_SECRET=your_jwt_secret_key_here_change_for_production

# Server Port (optional, defaults to 5000)
PORT=5000

# Razorpay Test Mode Keys
# Get these from: https://dashboard.razorpay.com/ (switch to TEST mode)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

**Important Notes:**
- Replace `your_jwt_secret_key_here_change_for_production` with a secure random string
- For Razorpay keys, sign up at [Razorpay](https://razorpay.com/) and get Test Mode keys
- Never use live Razorpay keys in this project - use only TEST MODE

### 5. Seed the Database (Optional)

The database comes pre-seeded with 31 sample products. If you want to reset or reseed:

Create a temporary seed script in `backend/seed.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product.model');

const sampleProducts = [
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with blue switches',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&h=500&fit=crop',
    stock: 25
  },
  // Add more products as needed...
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    await Product.insertMany(sampleProducts);
    console.log('Products seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedProducts();
```

Run the seed script:
```bash
cd backend
node seed.js
```

### 6. Start the Application

#### Start Backend (Terminal 1):
```bash
cd backend
node index.js
```

Backend will run on: `http://localhost:5000`

#### Start Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📁 Project Structure

```
mern/
├── backend/
│   ├── config/
│   │   └── razorpay.js          # Razorpay configuration
│   ├── controllers/
│   │   ├── cart.controller.js   # Cart operations
│   │   ├── customer.controller.js  # Auth operations
│   │   ├── order.controller.js  # Order operations
│   │   ├── product.controller.js # Product operations
│   │   └── wishlist.controller.js  # Wishlist operations
│   ├── middlewares/
│   │   └── auth.middleware.js   # JWT authentication
│   ├── models/
│   │   ├── customer.model.js    # User schema with wishlist & cart
│   │   ├── order.model.js       # Order schema
│   │   └── product.model.js     # Product schema
│   ├── routes/
│   │   ├── cart.routes.js       # Cart endpoints
│   │   ├── customer.routes.js   # Auth endpoints
│   │   ├── order.routes.js      # Order endpoints
│   │   ├── product.routes.js    # Product endpoints
│   │   └── wishlist.routes.js   # Wishlist endpoints
│   ├── utils/
│   ├── .env                     # Environment variables (not in git)
│   └── index.js                 # Server entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Navigation bar
│   │   │   ├── ProductCard.jsx  # Product display card
│   │   │   ├── SearchBar.jsx    # Search functionality
│   │   │   └── WishlistCard.jsx # Wishlist item card
│   │   ├── context/
│   │   │   └── CartContext.jsx  # Global cart state
│   │   ├── pages/
│   │   │   ├── Cart.jsx         # Shopping cart page
│   │   │   ├── Checkout.jsx     # Checkout with payment
│   │   │   ├── Home.jsx         # Protected home page
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── OrderDetails.jsx # Single order view
│   │   │   ├── Orders.jsx       # Order history
│   │   │   ├── ProductDetails.jsx # Product details
│   │   │   ├── Products.jsx     # Product listing
│   │   │   ├── Register.jsx     # Registration page
│   │   │   └── Wishlist.jsx    # Wishlist page
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # React entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .env                         # Root env file (not in git)
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /customers/register` - Register new customer
- `POST /customers/login` - Login customer
- `GET /customers/me` - Get current customer profile
- `POST /customers/logout` - Logout customer

### Products
- `POST /products` - Create product (admin)
- `GET /products` - Get all products (supports ?search= and ?category=)
- `GET /products/:id` - Get single product

### Wishlist
- `POST /wishlist/:productId` - Add product to wishlist
- `GET /wishlist` - Get current user's wishlist
- `DELETE /wishlist/:productId` - Remove from wishlist

### Cart
- `POST /cart/:productId` - Add product to cart
- `GET /cart` - Get current user's cart
- `PATCH /cart/:productId` - Update quantity
- `DELETE /cart/:productId` - Remove from cart

### Orders
- `POST /orders/create-payment-order` - Create order and Razorpay order
- `POST /orders/verify-payment` - Verify Razorpay payment
- `GET /orders` - Get current user's orders
- `GET /orders/:id` - Get single order details

## 🧪 Testing with Postman

### Authentication Flow

1. **Register a new user:**
   ```http
   POST http://localhost:5000/customers/register
   Content-Type: application/json

   {
     "fullName": "John Doe",
     "email": "john@example.com",
     "password": "password123",
     "phone": "9876543210"
   }
   ```

2. **Login:**
   ```http
   POST http://localhost:5000/customers/login
   Content-Type: application/json

   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```
   Note: This will set an HttpOnly cookie automatically

3. **Access protected endpoint:**
   ```http
   GET http://localhost:5000/customers/me
   ```
   Cookie will be sent automatically

### Product Operations

4. **Get all products:**
   ```http
   GET http://localhost:5000/products
   ```

5. **Search products:**
   ```http
   GET http://localhost:5000/products?search=keyboard
   ```

6. **Filter by category:**
   ```http
   GET http://localhost:5000/products?category=Electronics
   ```

### Wishlist Operations

7. **Add to wishlist:**
   ```http
   POST http://localhost:5000/wishlist/PRODUCT_ID
   ```

8. **Get wishlist:**
   ```http
   GET http://localhost:5000/wishlist
   ```

9. **Remove from wishlist:**
   ```http
   DELETE http://localhost:5000/wishlist/PRODUCT_ID
   ```

### Cart Operations

10. **Add to cart:**
    ```http
    POST http://localhost:5000/cart/PRODUCT_ID
    ```

11. **Get cart:**
    ```http
    GET http://localhost:5000/cart
    ```

12. **Update quantity:**
    ```http
    PATCH http://localhost:5000/cart/PRODUCT_ID
    Content-Type: application/json

    {
      "quantity": 3
    }
    ```

13. **Remove from cart:**
    ```http
    DELETE http://localhost:5000/cart/PRODUCT_ID
    ```

## 🔐 Security Notes

- Passwords are hashed using bcrypt before storing in MongoDB
- JWT tokens are stored in HttpOnly cookies (not accessible via JavaScript)
- All protected routes require valid JWT authentication
- Razorpay uses TEST MODE keys only (no real money transactions)
- Payment signature verification prevents fraud
- User identity is derived from JWT, not from client requests

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: Check if MongoDB service is started
- For local MongoDB: `mongod` should be running
- For Atlas: Verify connection string and whitelist your IP

### Port Already in Use
- Backend (5000): Change PORT in `.env`
- Frontend (5173): Vite will automatically use next available port

### CORS Errors
- Ensure backend CORS configuration allows your frontend origin
- Backend is configured to allow `http://localhost:*`

### Razorpay Issues
- Ensure you're using TEST MODE keys only
- Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in `.env`
- Check Razorpay dashboard for API key status

## 📝 Lab Implementation Summary

This project implements all 6 engineering labs:

1. **Lab 1**: Customer Authentication Service (Backend)
   - User registration and login APIs
   - JWT token generation
   - HttpOnly cookie authentication
   - Password hashing with bcrypt

2. **Lab 2**: Frontend Authentication UI
   - Login and Register pages
   - Protected Home page
   - React Router integration
   - API integration with cookies

3. **Lab 3**: Product Catalog
   - Product CRUD operations
   - Search and category filtering
   - Dynamic product listing
   - Product details page

4. **Lab 4**: Wishlist System
   - MongoDB relationships (ObjectId references)
   - Protected wishlist APIs
   - Wishlist UI with add/remove
   - Loading, empty, and error states

5. **Lab 5**: Shopping Cart
   - Cart with quantity management
   - React Context API for state
   - Derived totals (subtotal, count)
   - Real-time cart updates

6. **Lab 6**: Checkout & Orders
   - Razorpay Test Mode integration
   - Order creation with snapshots
   - Payment signature verification
   - Order history and details

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Author

Aniket Gala

## 🙏 Acknowledgments

- Lab problem statements from [Lab-2029-Problem-Statements](https://github.com/mrinal1224/Lab-2029-Problem-Statements)
- Product images from [Unsplash](https://unsplash.com)
- Payment integration by [Razorpay](https://razorpay.com)
