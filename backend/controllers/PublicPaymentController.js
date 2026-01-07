import * as db from '../db.js';
import crypto from 'crypto';

// --- Validation Helpers ---
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

export const createPublicPayment = async (req, res) => {
    const { order_id, method, upi_info, card_info } = req.body;

    try {
        const vpa = method === 'upi' ? upi_info?.vpa : null;
        const cardNumber = method === 'card' ? card_info?.number : null;

        const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [order_id]);
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: { code: "NOT_FOUND_ERROR", description: "Order not found" } });
        }
        const order = orderRes.rows[0];

        // Validation
        if (method === 'upi') {
            if (!vpa || !validateVPA(vpa)) {
                return res.status(400).json({ error: { code: "INVALID_VPA", description: "VPA format invalid" } });
            }
        } else if (method === 'card') {
            if (!cardNumber || !validateLuhn(cardNumber)) {
                return res.status(400).json({ error: { code: "INVALID_CARD", description: "Card validation failed" } });
            }
        }

        const paymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;
        const network = method === 'card' ? detectNetwork(cardNumber) : null;
        const last4 = method === 'card' ? cardNumber.slice(-4) : null;

        const insertQuery = `
            INSERT INTO payments (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
            VALUES ($1, $2, $3, $4, $5, $6, 'processing', $7, $8, $9)
            RETURNING *
        `;
        
        const payRes = await db.query(insertQuery, [
            paymentId, order.id, order.merchant_id, order.amount, order.currency, method, vpa, network, last4
        ]);
        
        // Immediate response acknowledging the initiation
        res.status(201).json(payRes.rows[0]);

        // Background update: This is what stops the buffering on frontend!
        const delay = Math.random() * 3000 + 7000; // 7-10 seconds delay
        setTimeout(async () => {
            const finalStatus = 'success'; // Force success for testing
            await db.query('UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2', [finalStatus, paymentId]);
            await db.query('UPDATE orders SET status = $1 WHERE id = $2', ['paid', order_id]);
            console.log(`Payment ${paymentId} updated to SUCCESS`);
        }, delay);

    } catch (error) {
        res.status(500).json({ error: { code: "SERVER_ERROR", description: "Internal server error" } });
    }
};