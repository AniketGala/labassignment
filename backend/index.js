require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const customerRoutes = require('./routes/customer.routes');

const app = express();

app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use('/customers', customerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
