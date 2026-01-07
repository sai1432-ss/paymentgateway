import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // 1. Import dotenv
import { getHealth } from './controllers/HealthController.js';
import { createOrder } from './controllers/OrderController.js';
import { authenticateMerchant } from './middleware/auth.js';
import { getOrder } from './controllers/GetOrderController.js';
import { createPayment } from './controllers/CreatePaymentController.js';
import { getPayment } from './controllers/GetPaymentController.js';
import { getTestMerchant } from './controllers/TestController.js';
import { getTransactions } from './controllers/TransactionController.js'; 
import { getPublicOrder } from './controllers/PublicOrderController.js';
import { createPublicPayment } from './controllers/PublicPaymentController.js';
import { getPublicPaymentStatus } from './controllers/PublicGetPaymentController.js';

// 2. Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Public Routes ---
app.get('/health', getHealth);
app.get('/api/v1/test/merchant', getTestMerchant);
app.get('/api/v1/orders/:order_id/public', getPublicOrder);
app.post('/api/v1/payments/public', createPublicPayment);
app.get('/api/v1/payments/:payment_id/status', getPublicPaymentStatus);

// --- Protected Routes ---
app.post('/api/v1/orders', authenticateMerchant, createOrder);
app.get('/api/v1/orders/:order_id', authenticateMerchant, getOrder);
app.post('/api/v1/payments', authenticateMerchant, createPayment);
app.get('/api/v1/payments/:payment_id', authenticateMerchant, getPayment);
app.get('/api/v1/transactions', authenticateMerchant, getTransactions);

// 3. Use the PORT from .env with a fallback
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});