require('dotenv').config();
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const mongoose = require('mongoose');
const Product = require('./models/product.model');

const sampleProducts = [
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with blue switches, customizable backlighting, and durable construction for professional gaming and typing.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&h=500&fit=crop',
    stock: 25
  },
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking, long battery life, and comfortable grip for extended use.',
    price: 1499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
    stock: 40
  },
  {
    name: 'HD Monitor',
    description: '27-inch Full HD monitor with IPS panel, 75Hz refresh rate, and eye-care technology for comfortable viewing.',
    price: 8999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=500&fit=crop',
    stock: 15
  },
  {
    name: 'Noise Cancelling Headphones',
    description: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality.',
    price: 5999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    stock: 20
  },
  {
    name: 'HD Webcam',
    description: '1080p HD webcam with auto-focus, built-in microphone, and low-light correction for crystal clear video calls.',
    price: 2499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500&h=500&fit=crop',
    stock: 30
  },
  {
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI, USB 3.0 ports, SD card reader, and power delivery for laptop connectivity.',
    price: 1999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop',
    stock: 35
  },
  {
    name: 'Laptop Stand',
    description: 'Aluminum laptop stand with adjustable height and angle for ergonomic typing and improved airflow.',
    price: 1799,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
    stock: 25
  },
  {
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with multiple brightness levels, color temperature control, and USB charging port.',
    price: 1299,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
    stock: 30
  },
  {
    name: 'Gaming Mouse Pad',
    description: 'Large gaming mouse pad with smooth surface, anti-slip rubber base, and RGB lighting effects.',
    price: 899,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1615485311084-8b7d373e539b?w=500&h=500&fit=crop',
    stock: 50
  },
  {
    name: 'Cable Organizer',
    description: 'Silicone cable organizer clips to keep your desk tidy and manage multiple cables efficiently.',
    price: 499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=500&h=500&fit=crop',
    stock: 60
  },
  {
    name: 'Smartphone',
    description: 'Latest smartphone with 6.5-inch display, 5G connectivity, triple camera system, and all-day battery life.',
    price: 49999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
    stock: 15
  },
  {
    name: 'Tablet',
    description: '10-inch tablet with stylus support, long battery life, and powerful performance for work and entertainment.',
    price: 29999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop',
    stock: 20
  },
  {
    name: 'Laptop',
    description: '15-inch laptop with powerful processor, 16GB RAM, 512GB SSD, and dedicated graphics for productivity.',
    price: 69999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
    stock: 10
  },
  {
    name: 'Smartwatch',
    description: 'Feature-rich smartwatch with health tracking, GPS, water resistance, and long battery life.',
    price: 14999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    stock: 25
  },
  {
    name: 'Wireless Earbuds',
    description: 'True wireless earbuds with active noise cancellation, transparency mode, and 24-hour total battery life.',
    price: 7999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop',
    stock: 30
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with 360-degree sound, waterproof design, and 20-hour battery life.',
    price: 3999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
    stock: 25
  },
  {
    name: 'Fast Charger',
    description: '65W fast charger with multiple USB ports, universal compatibility, and compact design.',
    price: 1499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&h=500&fit=crop',
    stock: 40
  },
  {
    name: 'Power Bank',
    description: '20000mAh power bank with fast charging, multiple ports, and LED display for battery level.',
    price: 1999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop',
    stock: 35
  },
  {
    name: 'Premium T-Shirt',
    description: '100% cotton premium t-shirt with comfortable fit, available in multiple colors and sizes.',
    price: 799,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    stock: 50
  },
  {
    name: 'Classic Jeans',
    description: 'Premium denim jeans with comfortable stretch, classic fit, and durable construction.',
    price: 1999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
    stock: 40
  },
  {
    name: 'Denim Jacket',
    description: 'Stylish denim jacket with classic design, comfortable fit, and premium quality fabric.',
    price: 3499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
    stock: 25
  },
  {
    name: 'Running Sneakers',
    description: 'Lightweight running sneakers with cushioned sole, breathable mesh, and superior comfort.',
    price: 4999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    stock: 30
  },
  {
    name: 'Analog Watch',
    description: 'Elegant analog watch with leather strap, precise movement, and timeless design.',
    price: 2999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop',
    stock: 20
  },
  {
    name: 'Designer Sunglasses',
    description: 'Premium sunglasses with UV protection, polarized lenses, and stylish frame design.',
    price: 2499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop',
    stock: 25
  },
  {
    name: 'Travel Backpack',
    description: 'Spacious travel backpack with multiple compartments, laptop sleeve, and water-resistant material.',
    price: 1999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    stock: 30
  },
  {
    name: 'Programming Book',
    description: 'Comprehensive programming book covering modern development practices and best practices.',
    price: 899,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop',
    stock: 25
  },
  {
    name: 'Premium Notebook',
    description: 'High-quality notebook with premium paper, durable cover, and elegant design for note-taking.',
    price: 499,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&h=500&fit=crop',
    stock: 50
  },
  {
    name: 'Fountain Pen',
    description: 'Premium fountain pen with smooth ink flow, elegant design, and comfortable grip.',
    price: 1299,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&h=500&fit=crop',
    stock: 30
  },
  {
    name: 'Mechanical Pencil',
    description: 'Precision mechanical pencil with comfortable grip, lead advancement mechanism, and durable construction.',
    price: 399,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&h=500&fit=crop',
    stock: 40
  },
  {
    name: 'Ceramic Coffee Mug',
    description: 'Premium ceramic coffee mug with comfortable handle, heat retention, and elegant design.',
    price: 599,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop',
    stock: 45
  },
  {
    name: 'Insulated Water Bottle',
    description: 'Double-wall insulated water bottle with 24-hour temperature retention and leak-proof design.',
    price: 999,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
    stock: 35
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`\n✅ Successfully seeded ${insertedProducts.length} products with high-quality images!`);

    console.log('\nProducts added:');
    insertedProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ₹${product.price} (${product.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedProducts();
