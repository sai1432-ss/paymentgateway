import * as db from '../db.js';

export const getPayment = async (req, res) => {
    // 1. Extract payment_id from URL path parameters
    const { payment_id } = req.params;
    
    // 2. Extract merchant_id from the authenticated request
    // This ensures only the owner can see the private payment details
    const merchant_id = req.merchant.id;

    try {
        // 3. Query for the specific payment belonging to the merchant
        const queryText = `
            SELECT id, order_id, amount, currency, method, vpa, card_network, card_last4, 
                   status, error_code, error_description, created_at, updated_at
            FROM payments 
            WHERE id = $1 AND merchant_id = $2
        `;
        
        const result = await db.query(queryText, [payment_id, merchant_id]);

        // 4. Return 404 if payment is not found
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: {
                    code: "NOT_FOUND_ERROR",
                    description: "Payment not found"
                }
            });
        }

        const payment = result.rows[0];

        // 5. Format the response with exact fields and ISO 8601 timestamps
        // This will reflect the finalStatus (success/failed) determined by your .env logic
        res.status(200).json({
            id: payment.id,
            order_id: payment.order_id,
            amount: payment.amount,
            currency: payment.currency,
            method: payment.method,
            vpa: payment.vpa,
            card_network: payment.card_network,
            card_last4: payment.card_last4,
            status: payment.status, // This changes from 'processing' based on .env delay
            error_code: payment.error_code,
            error_description: payment.error_description,
            created_at: payment.created_at.toISOString(),
            updated_at: payment.updated_at.toISOString()
        });

    } catch (error) {
        console.error("Get Payment Error:", error);
        res.status(500).json({ 
            error: { 
                code: "SERVER_ERROR", 
                description: "Internal server error" 
            } 
        });
    }
};