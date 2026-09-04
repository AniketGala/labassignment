# ShopKart Customer Authentication Service

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running

### MongoDB Setup
1. Make sure MongoDB is running on your system
2. The default connection string is: `mongodb://localhost:27017/shopkart`
3. If MongoDB is running on a different port or with authentication, update the `MONGODB_URI` in `backend/.env`

### Starting MongoDB (Windows)
**Option 1: Service**
- Open Services (Win+R, type `services.msc`)
- Find "MongoDB" service → Right-click → Start

**Option 2: Command Line**
```bash
net start MongoDB
```

**Option 3: Direct**
```bash
mongod
```

### Running the Application
1. Install dependencies: `npm install`
2. Configure environment variables in `backend/.env`
3. Start the server: `npm start`
4. Server runs on port 5000

## API Endpoints

### Register Customer
```
POST /customers/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@gmail.com",
  "password": "john123",
  "phone": "9876543210"
}
```

### Login
```
POST /customers/login
Content-Type: application/json

{
  "email": "john@gmail.com",
  "password": "john123"
}
```

### Get Profile (Protected)
```
GET /customers/me
Cookie: token=<jwt_token>
```

### Logout (Protected)
```
POST /customers/logout
Cookie: token=<jwt_token>
```

### Change Password (Protected - Bonus Feature)
```
PATCH /customers/change-password
Content-Type: application/json
Cookie: token=<jwt_token>

{
  "oldPassword": "john123",
  "newPassword": "newpassword456"
}
```

## Project Structure
```
backend/
├── controllers/
│   └── customer.controller.js
├── models/
│   └── customer.model.js
├── routes/
│   └── customer.routes.js
├── middlewares/
│   └── auth.middleware.js
├── utils/
│   └── generateToken.js
├── .env
└── index.js
```

## Testing
Use Postman or any HTTP client to test the APIs. The server must be running and MongoDB must be connected.

### Testing Sequence (Important!)
1. **Start MongoDB** first (see above)
2. **Start server**: `npm start`
3. **Register** a new customer (creates account)
4. **Login** with those credentials (sets JWT cookie automatically)
5. **Access protected routes** (cookie is sent automatically)
6. **Change password** (bonus feature - requires login)
7. **Logout** when done (clears cookie)

### Note on JWT Tokens
- JWT tokens are **automatically generated** when you login
- They are stored in **HttpOnly cookies** (not in localStorage)
- You don't need to manually handle tokens - the browser/Postman sends them automatically
- Protected routes read the token from cookies automatically

## API Summary
| Method | Endpoint | Protected |
|--------|----------|-----------|
| POST | `/customers/register` | ❌ |
| POST | `/customers/login` | ❌ |
| GET | `/customers/me` | ✅ |
| POST | `/customers/logout` | ✅ |
| PATCH | `/customers/change-password` | ✅ (Bonus) |
