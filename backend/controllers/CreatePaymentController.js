import * as db from '../db.js';
import crypto from 'crypto';

// --- Validation Helpers (Keep as is) ---
const validateVPA = (vpa) => /^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+$/.test(vpa);

const validateLuhn = (number) => {
    const cleaned = number.replace(/[\s-]/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;
    let sum = 0, shouldDouble = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned.charAt(i));
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0;
};

const detectNetwork = (number) => {
    const cleaned = number.replace(/[\s-]/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^(60|65|81|82|89)/.test(cleaned)) return 'rupay';
    return 'unknown';
};

// --- Controller Logic ---

export const createPayment = async (req, res) => {
    const { order_id, method, vpa, card } = req.body;
    const merchant_id = req.merchant.id;

    try {
        // 1. Verify order exists and belongs to merchant
        const orderRes = await db.query('SELECT * FROM orders WHERE id = $1 AND merchant_id = $2', [order_id, merchant_id]);
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Order not found" } });
        }
        const order = orderRes.rows[0];

        // 2. Method-specific validation
        if (method === 'upi') {
            if (!vpa || !validateVPA(vpa)) {
                return res.status(400).json({ error: { code: "INVALID_VPA", description: "VPA format invalid" } });
            }
        } else if (method === 'card') {
            if (!card || !validateLuhn(card.number)) {
                return res.status(400).json({ error: { code: "INVALID_CARD", description: "Card validation failed" } });
            }
            const now = new Date();
            const expiry = new Date(card.expiry_year, card.expiry_month - 1);
            if (expiry < new Date(now.getFullYear(), now.getMonth())) {
                return res.status(400).json({ error: { code: "EXPIRED_CARD", description: "Card has expired" } });
            }
        }

        // 3. Initialize Payment Record
        const paymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;
        const network = method === 'card' ? detectNetwork(card.number) : null;
        const last4 = method === 'card' ? card.number.replace(/[\s-]/g, '').slice(-4) : null;

        const insertQuery = `
            INSERT INTO payments (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
            VALUES ($1, $2, $3, $4, $5, $6, 'processing', $7, $8, $9)
            RETURNING *
        `;
        const payRes = await db.query(insertQuery, [paymentId, order.id, merchant_id, order.amount, order.currency, method, vpa || null, network, last4]);
        
        // Return 201 response immediately
        res.status(201).json(payRes.rows[0]);

        // 4. UPDATED: Async Processing using .env parameters
        let delay;
        let finalStatus;

        if (process.env.TEST_MODE === 'true') {
            // Use specific test overrides
            delay = parseInt(process.env.TEST_PROCESSING_DELAY) || 1000;
            finalStatus = process.env.TEST_PAYMENT_SUCCESS === 'true' ? 'success' : 'failed';
        } else {
            // Calculate dynamic delay between MIN and MAX
            const minDelay = parseInt(process.env.PROCESSING_DELAY_MIN) || 5000;
            const maxDelay = parseInt(process.env.PROCESSING_DELAY_MAX) || 10000;
            delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

            // Determine status based on method-specific success rates
            const successRate = method === 'upi' 
                ? parseFloat(process.env.UPI_SUCCESS_RATE || 0.90) 
                : parseFloat(process.env.CARD_SUCCESS_RATE || 0.95);
            
            finalStatus = Math.random() < successRate ? 'success' : 'failed';
        }
        
        setTimeout(async () => {
            await db.query('UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2', [finalStatus, paymentId]);
            
            if (finalStatus === 'success') {
                await db.query('UPDATE orders SET status = $1 WHERE id = $2', ['paid', order_id]);
            }
        }, delay);

    } catch (error) {
        console.error("Payment Processing Error:", error);
        res.status(500).json({ error: { code: "SERVER_ERROR", description: "Internal server error" } });
    }
};