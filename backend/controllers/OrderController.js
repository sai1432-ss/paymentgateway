// backend/controllers/OrderController.js
import crypto from 'crypto'; 
import * as db from '../db.js';

// Helper to generate order ID: order_ + 16 alphanumeric characters
const generateOrderId = () => {
    const chars = crypto.randomBytes(8).toString('hex'); 
    return `order_${chars}`;
};

export const createOrder = async (req, res) => {
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;

    // 1. Validation: amount must be integer >= 100
    if (!amount || !Number.isInteger(amount) || amount < 100) {
        return res.status(400).json({
            error: {
                code: "BAD_REQUEST_ERROR",
                description: "amount must be at least 100"
            }
        });
    }

    try {
        const orderId = generateOrderId();
        
        // 2. Extract merchantId from authMiddleware (linked to TEST_API_KEY in .env)
        const merchantId = req.merchant.id; 

        const queryText = `
            INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'created')
            RETURNING id, merchant_id, amount, currency, receipt, notes, status, created_at
        `;
        
        // Ensure notes are stored as a stringified object if the DB column is TEXT/JSON
        const values = [orderId, merchantId, amount, currency, receipt, JSON.stringify(notes)];
        const result = await db.query(queryText, values);

        const order = result.rows[0];

        // 3. Return 201 Created with standardized response format
        res.status(201).json({
            id: order.id,
            merchant_id: order.merchant_id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            notes: order.notes,
            status: order.status, // Initial state is always 'created'
            created_at: order.created_at.toISOString() // ISO 8601 format
        });
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ 
            error: { 
                code: "SERVER_ERROR", 
                description: "Internal server error" 
            } 
        });
    }
};