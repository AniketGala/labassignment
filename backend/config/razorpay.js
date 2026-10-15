const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn(
    '\n[WARN] Razorpay credentials not found. Payment (Lab 6) will NOT work.\n' +
    '       Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.\n' +
    '       Use Razorpay TEST MODE keys only.\n'
  );
}

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: keyId || 'placeholder_key',
    key_secret: keySecret || 'placeholder_secret'
  });
} catch (e) {
  console.warn('[WARN] Razorpay init failed:', e.message);
  razorpay = null;
}

module.exports = razorpay;
