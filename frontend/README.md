# ShopKart Frontend - Lab 02

Frontend application for ShopKart customer authentication system.

## Prerequisites

- Node.js installed
- Backend API running on port 5000 (from Lab 01)
- MongoDB running

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
Make sure your Lab 01 backend is running:
```bash
cd ../backend
npm start
```

### 3. Start Frontend Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Features

- **Registration Page** (`/register`)
  - Form validation for all fields
  - Email format validation
  - Password length validation
  - Phone number validation
  - Success state with auto-redirect

- **Login Page** (`/login`)
  - Email/password authentication
  - Error handling
  - Automatic cookie management
  - Redirect to home on success

- **Protected Home Page** (`/home`)
  - Displays user profile information
  - Automatic authentication check
  - Redirect to login if not authenticated
  - Feature cards for Products, Cart, Orders

- **Logout Functionality**
  - Navbar with logout button
  - Clears authentication cookies
  - Redirects to login page

## API Integration

All API calls use Axios with `withCredentials: true` for HttpOnly cookie handling:

- `POST /customers/register` - Create new account
- `POST /customers/login` - Authenticate user
- `GET /customers/me` - Get user profile
- `POST /customers/logout` - End session

## Tech Stack

- React
- React Router DOM
- Axios
- Tailwind CSS
- Vite

## Project Structure

```
src/
├── pages/
│   ├── Register.jsx
│   ├── Login.jsx
│   └── Home.jsx
├── components/
│   └── Navbar.jsx
├── services/
│   └── api.js
├── App.jsx
└── main.jsx
```

## Testing

1. Make sure backend is running on port 5000
2. Start frontend development server
3. Navigate to `http://localhost:5173`
4. Test registration flow
5. Test login flow
6. Test protected home page
7. Test logout functionality

## Important Notes

- Backend must be running before testing frontend
- Cookies are handled automatically by the browser
- HttpOnly cookies prevent JavaScript access for security
- All protected routes automatically redirect to login if not authenticated
